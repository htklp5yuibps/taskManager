import { createTasks, changeTaskStatus, getTaskWithId, updateTask } from '../taskServices.js';
import { taskEditComponent } from './taskEditComponent.js';
import { TodoTask } from '../entities/todoTask.js';
import { InprogressTask } from '../entities/inprogressTask.js';
import { DoneTask } from '../entities/doneTask.js';
import { AcceptedTask } from '../entities/acceptedTask.js';
import { menuComponent } from './menuComponent.js';
import { messages } from './messages.js';
import { titles } from './titles.js';
import { makeRequest, removeMenuElement } from '../commonFunctions.js';
import { rootComponent } from './root.js';

export function tasksComponent(message, tasks) {
    if (!tasks) {
        makeRequest('GET', 'http://localhost:8090/taskManager/users')
            .then(response => {
                switch (response.status) {
                    case 200: {
                        makeRequest('GET', 'http://localhost:8090/taskManager/tasks')
                            .then(response => {
                                createElement(createTasks(response.responseJSON), message);
                            });
                        break;
                    }
                    case 403: {
                        makeRequest('GET', 'http://localhost:8090/taskManager/tasks')
                            .then(response => {
                                createElement(createTasks(response.responseJSON), message);
                            });
                        break;
                    }
                }
            });
    } else {
        createElement(tasks, message);
    }
}

function createElement(tasks, message = null) {
    $('body > .content').replaceWith(`
    <div class="content tasks-content">
        <div class="tasks" task-status="todo">
            <div class="title">TODO</div>
        </div>
        <div class="tasks" task-status="inprgs">
            <div class="title">IN PROGRESS</div>
        </div>
        <div class="tasks" task-status="done">
            <div class="title">DONE</div>
        </div>
        <div class="tasks" task-status="accepted">
            <div class="title">ACCEPTED</div>
        </div>
    </div>
    `);

    for (let task of tasks.userTasks) {
        createTaskElement(task, false);
    }

    for (let task of tasks.tasks) {
        createTaskElement(task);
    }

    if (tasks.userTasks) {
        initTasksDnD();
        initTasksMenu();
    }

    function createTaskElement(task, readonlyMode = true) {
        if (task instanceof TodoTask) {
            appendTaskElement('todo');
        } else if (task instanceof InprogressTask) {
            appendTaskElement('inprgs');
        } else if (task instanceof DoneTask) {
            appendTaskElement('done');
        } else if (task instanceof AcceptedTask) {
            appendTaskElement('accepted');
        }

        function appendTaskElement(status) {
            console.log(task);
            $(`.tasks-content > .tasks[task-status="${status}"]`).append(createTaskMarkup());
            $(`.task[taskid="${task.id}"] .title`).text(task.title);
            $(`.task[taskid="${task.id}"] .task-description`).text(task.description);
            $(`.task[taskid="${task.id}"] .task-tags`).text(task.tags.join(' '));
            $(`.task[taskid="${task.id}"] .task-creator`).text(task.creator);
        }

        function createTaskMarkup() {
            let result = '';

            if (readonlyMode) {
                result += `<div class="task ${task instanceof AcceptedTask ? 'disabled' : task.type === 'bug' ? 'bug' : ''} read-only-task" taskId=${task.id}>`;
            } else {
                result += `<div ${task instanceof AcceptedTask ? '' : 'draggable="true"'} class="task ${task instanceof AcceptedTask ? 'disabled' : task.type === 'bug' ? 'bug' : ''}" taskId=${task.id}>`;
            }

            result += `
            <div class="task-title">
                <span class="title"></span>
    
                ${readonlyMode ? '' : `
                    ${task instanceof AcceptedTask ? '<i name="remove-btn" class="fas fa-trash"></i>' : `
                    <i class="task-menu fas fa-bars">
                        <ul ${task.type === 'bug' ? 'class="bug"' : ''}>
                            <li name="edit-btn"><i class="far fa-edit"></i>${titles.EDIT_BTN}</li>
                            <li name="remove-btn"><i class="fas fa-trash"></i>${titles.DELETE_BTN}</li>
                            <li class="separator"></li>
                            <li name="todo-btn">${titles.TASKMENU_TODO_BTN}</li>
                            <li name="inprgs-btn">${titles.TASKMENU_IN_PROGRESS_BTN}</li>
                            <li name="done-btn">${titles.TASKMENU_DONE_BTN}</li>
                            <li name="accepted-btn">${titles.TASKMENU_ACCEPTED_BTN}</li>
                        </ul>
                    </i>`}            
                `}
            </div>
    
            ${task.description ? '<div class="task-description"></div>' : ''}
            ${task.tags.length ? '<div class="task-tags"></div>' : ''}
            <div class="task-creator"></div>
            </div>`;

            return result;
        }
    }
}

function initTasksDnD() {
    let draggableTask = null;

    $('.task').on('dragstart', function (event) {
        if (!$(event.target).hasClass('task') || $(event.target).find('.task-menu').length === 0) {
            return false;
        }

        $(this).addClass('dragged');
        console.log(draggableTask);
        draggableTask = this;
    });

    $('.task').on('dragend', function () {
        $(this).removeClass('dragged');
        draggableTask = null;
    });

    $('.tasks').on('dragover', function (event) {
        if (draggableTask) {
            event.preventDefault();
            $(this).addClass('dragover');
        } else {
            return false;
        }
    });

    $('.tasks').on('dragenter', function () {
        if (draggableTask) {
            $(this).addClass('dragover');
        } else {
            return false;
        }
    });

    $('.tasks').on('dragleave', function () {
        $(this).removeClass('dragover');
    });

    $('.tasks').on('drop', function () {
        if (draggableTask) {
            const status = $(this).closest('.tasks').attr('task-status');
            const taskId = $(draggableTask).attr('taskid');

            switch (status) {
                case 'todo': {
                    getTaskWithId(taskId)
                        .then(task => {
                            task = changeTaskStatus(task, TodoTask);
                            updateTask(task).then(rootComponent());
                        });
                    break;
                }
                case 'inprgs': {
                    getTaskWithId(taskId)
                        .then(task => {
                            task = changeTaskStatus(task, InprogressTask);
                            updateTask(task).then(rootComponent());
                        });
                    break;
                }
                case 'done': {
                    getTaskWithId(taskId)
                        .then(task => {
                            task = changeTaskStatus(task, DoneTask);
                            updateTask(task).then(rootComponent());
                        });
                    break;
                }
                case 'accepted': {
                    getTaskWithId(taskId)
                        .then(task => {
                            task = changeTaskStatus(task, AcceptedTask);
                            updateTask(task).then(rootComponent());
                        });
                    break;
                }
            }
        } else {
            return false;
        }
    });
}

function initTasksMenu() {
    $('.task-menu').on('click', function () {
        $(this).find('ul').css('display', 'block');
    });

    $('ul').on('mouseleave', function () {
        $(this).css('display', 'none');
    });

    $('.task-menu').on('mouseleave', function () {
        $('ul').css('display', 'none');
    });

    $('*[name="remove-btn"]').on('click', function () {
        const taskId = $(this).closest('.task[taskId]').attr('taskId');
        makeRequest('DELETE', 'http://localhost:8090/taskManager/tasks', 'application/x-www-form-urlencoded', { taskId: taskId })
            .then(response => {
                switch (response.status) {
                    case 204: {
                        menuComponent();
                        tasksComponent();
                        break;
                    }
                    default: {
                        tasksComponent(messages.ERROR_WHILE_PROCESSING_REQUEST);
                        break;
                    }
                }
            });
    });

    $('li[name="edit-btn"]').on('click', function () {
        const taskId = $(this).closest('.task').attr('taskId');
        removeMenuElement();
        taskEditComponent(taskId);
    });

    $('li[name="todo-btn"]').on('click', function () {
        const taskId = $(this).closest('.task').attr('taskId');
        changeStatusOnClick(taskId, TodoTask);
    });

    $('li[name="inprgs-btn"]').on('click', function () {
        const taskId = $(this).closest('.task').attr('taskId');
        changeStatusOnClick(taskId, InprogressTask);
    });

    $('li[name="done-btn"]').on('click', function () {
        const taskId = $(this).closest('.task').attr('taskId');
        changeStatusOnClick(taskId, DoneTask);
    });

    $('li[name="accepted-btn"]').on('click', function () {
        const taskId = $(this).closest('.task').attr('taskId');
        changeStatusOnClick(taskId, AcceptedTask);
    });

    async function changeStatusOnClick(taskId, type) {
        let task = await getTaskWithId(taskId);
        task = changeTaskStatus(task, type);
        if (await updateTask(task)) {
            menuComponent();
            tasksComponent();
        } else {
            tasksComponent(messages.ERROR_WHILE_PROCESSING_REQUEST);
        }
    }
}