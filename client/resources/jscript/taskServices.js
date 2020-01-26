import { TodoTask } from './entities/todoTask.js';
import { InprogressTask } from './entities/inprogressTask.js';
import { DoneTask } from './entities/doneTask.js';
import { AcceptedTask } from './entities/acceptedTask.js';
import { makeRequest } from './commonFunctions.js';
import { getCurrentUser } from './userServices.js';
import { PremiumUser } from './entities/premiumUser.js';

export function createTask(obj) {
    switch (obj.status) {
        case 'todo': { return createObject(TodoTask); }
        case 'inprogress': { return createObject(InprogressTask); }
        case 'done': { return createObject(DoneTask); }
        case 'accepted': { return createObject(AcceptedTask); }
    }

    function createObject(type) {
        let task = new type(obj.title, obj.description);
        task.id = obj.id;
        task.tags = obj.tags;
        task.type = obj.type;
        task.creator = obj.creator;
        return task;
    }
}

export function createTasks(obj) {
    const userTasks = obj.userTasks;
    const tasks = obj.tasks;
    const result = {
        userTasks: [],
        tasks: []
    };
    for (let i = 0; i < userTasks.length; i++) {
        result.userTasks.push(createTask(userTasks[i]));
    }
    for (let i = 0; i < tasks.length; i++) {
        result.tasks.push(createTask(tasks[i]));
    }
    return result;
}

export function changeTaskStatus(task, Type) {
    const result = new Type(task.title, task.description);
    result.id = task.id;
    result.tags = task.tags;
    result.type = task.type;
    result.creator = task.creator;
    return result;
}

export function updateTask(task) {
    return makeRequest('POST', 'http://localhost:8090/taskManager/tasks', 'application/x-www-form-urlencoded', {
        id: task.id,
        title: task.title,
        description: task.description,
        type: task.type,
        status: task.status,
        tags: task.tags
    }).then(response => {
        return response.status === 200;
    });
}

export function getTasks() {
    return makeRequest('GET', 'http://localhost:8090/taskManager/tasks').then(response => {
        if (response.status === 200) {
            return createTasks(response.responseJSON);
        }
    });
}

export function filterByTags(tags) {
    const filteredTasks = {
        userTasks: [],
        tasks: []
    }
    return getTasks().then((tasks) => {
        tags.forEach(obj => {
            for (let i = 0; i < tasks.tasks.length; i++) {
                if (tasks.tasks[i].tags.includes(obj) && !contains(tasks.tasks[i])) {
                    filteredTasks.tasks.push(tasks.tasks[i]);
                }
            }
            for (let i = 0; i < tasks.userTasks.length; i++) {
                if (tasks.userTasks[i].tags.includes(obj) && !contains(tasks.userTasks[i])) {
                    filteredTasks.userTasks.push(tasks.userTasks[i]);
                }
            }
        });
        return filteredTasks;
    });

    function contains(task) {
        for (let i = 0; i < filteredTasks.tasks.length; i++) {
            if (filteredTasks.tasks[i].id === task.id) {
                return true;
            }
        }
        for (let i = 0; i < filteredTasks.userTasks.length; i++) {
            if (filteredTasks.userTasks[i].id === task.id) {
                return true;
            }
        }
        return false;
    }
}

export function getTaskWithId(taskId) {
    return makeRequest('GET', `http://localhost:8090/taskManager/tasks/${taskId}`).then(response => {
        if (response.status === 200) {
            return createTask(response.responseJSON);
        }
    });
}

export async function limitIsReached() {
    let limit = 5;
    const tasks = await getTasks();
    const user = await getCurrentUser();

    for (let i = 0; i < tasks.userTasks.length; i++) {
        if (tasks.userTasks[i].status !== 'accepted') {
            limit -= 1;
        };
    }

    if (limit <= 0 && !(user instanceof PremiumUser)) {
        return true;
    }

    return false;
}