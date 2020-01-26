import { rootComponent } from './root.js';
import { removeMenuElement, makeRequest, isWellFormatUsername, isWellFormatPremiumCode } from '../commonFunctions.js';
import { titles } from './titles.js';
import { messages } from './messages.js';

export function signinComponent(message) {
    removeMenuElement();

    $('.content').replaceWith(`
    <div class="content signin-content ${message ? 'with-message' : ''}">
        ${message ? `<div class="myui-tip ${message.type}">${message.text}</div>` : ''}
        <div class="wrapper">
            <input id="username-inp" type="text" class="myui-form-control" placeholder="${titles.USERNAME_INP_PLACEHOLDER}">
            <input id="password-inp" type="password" class="myui-form-control" placeholder="${titles.PASSWORD_INP_PLACEHOLDER}">
            <input id="premium-inp" type="text" class="myui-form-control" placeholder="${titles.PREMIUM_CODE_INP_PLACEHOLDER}">
            <button id="signin-btn" class="myui-btn" type="button">${titles.SIGN_IN_BTN}</button>
            <button id="signup-btn" class="myui-btn" type="button">${titles.SIGN_UP_BTN}</button>
            <button id="mainpage-btn" class="myui-btn" type="button">${titles.HOME_PAGE_BTN}</button>
        </div>
    </div>
    `);

    $('.content #signin-btn').on('click', () => {
        const username = $('#username-inp').val();
        const password = $('#password-inp').val();

        makeRequest('POST', 'http://localhost:8090/taskManager/users', 'application/x-www-form-urlencoded', {
            username: username,
            password: password
        }).then(response => {
            switch (response.status) {
                case 200: {
                    rootComponent();
                    break;
                }
                case 403: {
                    signinComponent(messages.ERROR_INCORRECT_USERNAME_OR_PASSWORD);
                    break;
                }
            }
        });
    });

    $('.content #signup-btn').on('click', () => {
        const username = $('#username-inp').val();
        const password = $('#password-inp').val();
        const premium = $('#premium-inp').val();

        if (!isWellFormatUsername(username) || !isWellFormatUsername(password)) {
            signinComponent(messages.ERROR_USERNAME_OR_PASSWORD_IS_NOT_WELL_FORMATED);
            return false;
        }

        if (premium) {
            if (!isWellFormatPremiumCode(premium)) {
                signinComponent(messages.ERROR_PREMIUM_IS_NOT_WELL_FORMATED);
                return false;
            }
        }

        makeRequest('PUT', 'http://localhost:8090/taskManager/users', 'application/x-www-form-urlencoded', {
            username: username,
            password: password,
            premium: premium
        }).then(response => {
            switch (response.status) {
                case 200: {
                    signinComponent(messages.SUCCESS_USER_CREATED);
                    break;
                }
                case 201: {
                    signinComponent(messages.ERROR_USERNAME_EXISTS_OR_PREMIUM_CODE);
                }
            }
        });
    });

    $('#mainpage-btn').on('click', rootComponent);
}

function removeElement() {
    $('body .content').replaceWith('<div class="content"></div>');
}