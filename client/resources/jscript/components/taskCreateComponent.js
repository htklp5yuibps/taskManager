import { rootComponent } from './root.js';
import { removeContentElement, makeRequest } from '../commonFunctions.js';
import { limitIsReached } from '../taskServices.js';
import { titles } from './titles.js';
import { messages } from './messages.js';

export function taskCreateComponent(message) {
    removeContentElement();

    $('.content').replaceWith(`
    <div class="content task-edit-content ${message ? 'with-message' : ''}">
        ${message ? `<div class="myui-tip ${message.type}">${message.text}</div>` : ''}
        <div class="wrapper">
            <input name="title" type="text" class="myui-form-control form-item" placeholder="${titles.CREDIT_TITLE_INP_PLACEHOLDER}">
            <textarea name="description" class="myui-form-control form-item" rows="5" placeholder="${titles.CREDIT_DESCRIPTION_INP_PLACEHOLDER}"></textarea>
            <select name="type" class="myui-form-control form-item">
                <option value="bug">${titles.CREADIT_TYPE_BUG}</option>
                <option value="story">${titles.CREADIT_TYPE_STORY}</option>
            </select>
            <input name="tags" type="text" class="myui-form-control form-item" placeholder="${titles.CREADIT_TAGS_INP_PLACEHOLDER}">
            <button name="createTask-btn" class="myui-btn form-item" type="button">${titles.CREATE_TASK_BTN}</button>
            <button name="home-btn" class="myui-btn form-item" type="button">${titles.HOME_PAGE_BTN}</button>
        </div>
    </div>
    `);

    $('.content button[name="createTask-btn"]').on('click', () => {
        limitIsReached().then(isReached => {
            if (!isReached) {
                const title = $('.content input[name="title"]').val();
                const description = $('.content textarea[name="description"]').val();
                const type = $('.content select[name="type"]').val();
                const tags = $('.content input[name="tags"]').val().split(' ');
    
                makeRequest('PUT', 'http://localhost:8090/taskManager/tasks', 'application/x-www-form-urlencoded', {
                    title: title,
                    description: description,
                    type: type,
                    tags: tags
                }).then(response => {
                    switch (response.status) {
                        case 201: {
                            taskCreateComponent(messages.SUCCESS_TASK_CREATED);
                            break;
                        }
                        default: {
                            taskCreateComponent(messages.ERROR_WHILE_PROCESSING_REQUEST);
                            break;
                        }
                    }
                });
            } else {
                taskCreateComponent(messages.ERROR_ACCOUNT_TASKS_LIMIT_REACHED);
            }
        });
    });

    $('.content button[name="home-btn"]').on('click', () => {
        rootComponent();
    });
}