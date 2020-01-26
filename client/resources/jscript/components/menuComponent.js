import { rootComponent } from './root.js';
import { taskCreateComponent } from './taskCreateComponent.js';
import { filterByTags, limitIsReached } from '../taskServices.js';
import { titles } from './titles.js';
import { tasksComponent } from './tasksComponent.js';
import { makeRequest, removeMenuElement } from '../commonFunctions.js';

export function menuComponent() {
    makeRequest('GET', 'http://localhost:8090/taskManager/users').then(response => {
        switch (response.status) {
            case 200: {
                createElement();
                break;
            }
            case 403: {
                createGuestElement();
                break;
            }
        }
    });
}

function createElement() {
    limitIsReached().then(isReached => {
        $('.menu').replaceWith(`
        <div class="menu position-rel">
            <div class="wrapper flex position-abs">
                <button name="resetFilter-btn" type="button" class="myui-btn margin-right-10">${titles.RESET_FILTER_BTN}</button>
                <span class="myui-searchbar">
                    <input type="text" name="tags-inp" placeholder="${titles.TAGS_SEARCH_PLACEHOLDER}"><button name="search-btn" type="button">${titles.TAGS_SEARCH_BTN}</button>
                </span>
                ${isReached ? '' : `<button name="createtask-btn" type="button" class="myui-btn margin-left-30">${titles.CREATE_TASK_BTN}</button>`}
            </div>
            <button name="logout-btn" class="myui-btn margin-left-auto" type="button">${titles.LOGOUT_BTN}</button>
        </div>
        `);

        $('button[name="createtask-btn"]').on('click', () => {
            removeMenuElement();
            taskCreateComponent();
        });

        $('button[name="logout-btn"]').on('click', () => {
            makeRequest('POST', 'http://localhost:8090/taskManager/users/logout').then(response => {
                if (response.status === 200) {
                    rootComponent();
                }
            });
        });

        $('button[name="search-btn"]').on('click', () => {
            const tags = $('.menu *[name="tags-inp"]').val().split(' ');
            filterByTags(tags).then(tasks => tasksComponent(undefined, tasks));
        });

        $('button[name="resetFilter-btn"]').on('click', () => {
            $('.menu *[name="tags-inp"]').val('');
            tasksComponent();
        });
    });
}

function createGuestElement() {
    $('.menu').replaceWith(`
    <div class="menu empty"></div>
    `);
}