import { makeRequest, removeContentElement } from '../commonFunctions.js';
import { messages } from './messages.js';
import { titles } from './titles.js';
import { rootComponent } from './root.js';
import { createTask, updateTask } from '../taskServices.js';

export function taskEditComponent(taskId, message) {
    removeContentElement();

    taskId > 0 ? (function () {
        makeRequest('GET', `http://localhost:8090/taskManager/tasks/${taskId}`).then(response => {
            switch (response.status) {
                case 200: {
                    createElement(createTask(response.responseJSON), message);
                    break;
                }
                case 404: {
                    taskEditComponent(-1);
                    break;
                }
            }
        });
    })() : (function () {
        createElement(null, messages.ERROR_TASK_MAY_HAVE_BEEN_DELETED);
    })();

    function createElement(task = null, message = null) {
        if (task) {
            $('body .content').replaceWith(`
                <div class="content task-edit-content ${message ? 'with-message' : ''}">
                    ${message ? `<div class="myui-tip ${message.type}">${message.text}</div>` : ''}
                    <div class="wrapper">
                        <input name="title" type="text" class="myui-form-control form-item" placeholder="${titles.CREDIT_TITLE_INP_PLACEHOLDER}" value="${task.title}">
                        <textarea name="description" class="myui-form-control form-item" rows="5" placeholder="${titles.CREDIT_DESCRIPTION_INP_PLACEHOLDER}">${task.description}</textarea>
                        <select name="type" class="myui-form-control form-item">
                            <option ${task.type === 'story' ? 'selected="selected"' : ''} value="story">${titles.CREADIT_TYPE_STORY}</option>
                            <option ${task.type === 'bug' ? 'selected="selected"' : ''} value="bug">${titles.CREADIT_TYPE_BUG}</option>
                        </select>
                        <input name="tags" type="text" class="myui-form-control form-item" placeholder="${titles.CREADIT_TAGS_INP_PLACEHOLDER}" value="${task.tags.join(' ')}">
                        <button name="save-btn" class="myui-btn form-item">${titles.SAVE_BTN}</button>
                        <button name="home-btn" class="myui-btn form-item">${titles.HOME_PAGE_BTN}</button>
                    </div>
                </div>
                `);

                $('.content button[name="save-btn"]').on('click', () => {
                    const title = $('.content input[name="title"]').val();
                    const description = $('.content textarea[name="description"]').val();
                    const tags = $('.content input[name="tags"]').val().split(' ');
                    const type = $('.content select[name="type"]').val();
        
                    if (title === '' || type === '') {
                        taskEditComponent(taskId, messages.ERROR_TITLE_AND_DESCRIPTION_EMPTY);
                    } else {
                        updateTask({
                            id: taskId,
                            status: task.status,
                            title: title,
                            description: description,
                            type: type,
                            tags: tags
                        }).then(result => {
                            if (result) {
                                taskEditComponent(taskId, messages.SUCCESS_TASK_UPDATED);
                            } else {
                                taskEditComponent(taskId, messages.ERROR_WHILE_PROCESSING_REQUEST);
                            }
                        });
                    }
                });
        } else {
            $('body .content').replaceWith(`
                <div class="content task-edit-content ${message ? 'with-message' : ''}">
                    ${message ? `<div class="myui-tip ${message.type}">${message.text}</div>` : ''}
                    <div class="wrapper">
                        <button name="home-btn" class="myui-btn form-item">${titles.HOME_PAGE_BTN}</button>
                    </div>
                </div>
                `);
        }

        $('.content button[name="home-btn"]').on('click', () => {
            rootComponent();
        });
    }
}