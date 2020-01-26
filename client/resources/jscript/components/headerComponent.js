import { makeRequest } from '../commonFunctions.js';
import { createUser } from '../userServices.js';
import { signinComponent } from './signinComponent.js';
import { titles } from './titles.js';

export function headerComponent() {
    makeRequest('GET', 'http://localhost:8090/taskManager/users').then(response => {
        if (response.status === 200) {
            createElement(response.responseJSON);
        } else if (response.status === 403) {
            createGuestElement();
        }
    });
}

function createElement(userJson) {
    const user = createUser(userJson);

    $('.header').replaceWith(`
    <div class="header">
        <span>${titles.LOGO}</span>
        <span class="userpanel">
            <span class="username"></span>
            <span class="status">${titles.STATUS}: ${user.status}</span>
        </span>
    </div>`);

    $('.userpanel > .username').text(user.username);
}

function createGuestElement() {
    $('.header').replaceWith(`
    <div class="header">
        <span>Task Manager</span>
        <span class="userpanel">
            <button type="button" class="myui-btn userpanel-signinbtn">SIGN IN</button>
        </span>
    </div>`);

    $('.userpanel-signinbtn').on('click', function() {
        signinComponent();
    });
}