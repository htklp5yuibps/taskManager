const { Router } = require('express');
const fs = require('fs');
const path = require('path');

const dbFilePath = path.join(__dirname, '..', 'database', 'tasks.json');

const tasksRoutes = Router();

tasksRoutes.get('', (request, response) => {
    try {
        const tasks = readAll(request.session.user.username || null);
        response.status(200).json(tasks);
    } catch (exc) {
        response.status(500).send();
    }
});
tasksRoutes.get('/:id', (request, response) => {
    try {
        if (request.session.user !== 'unauthorized') {
            const task = getWithId(request.params.id, request.session.user.id);
            task ? response.status(200).json(task) : response.status(404).send();
        } else {
            response.status(403).send();
        }
    } catch (exc) {
        response.status(500).send();
    }
});
tasksRoutes.post('', (request, response) => {
    try {
        if (request.session.user !== 'unauthorized') {
            if (update(request.body, request.session.user.id)) {
                response.status(200).send();
            } else {
                response.status(400).send();
            }
        } else {
            response.status(403).send();
        }
    } catch (exc) {
        response.status(500).send();
    }
});
tasksRoutes.put('', (request, response) => {
    try {
        if (request.session.user !== 'unauthorized') {
            if (create(request.body.title, request.body.description,
                    request.body.type, request.body.tags, request.session.user.id,  request.session.user.username)) {
                response.status(201).send();
            } else {
                response.status(400).send();
            }
        } else {
            response.status(403).send();
        }
    } catch (exc) {
        console.log(exc);
        response.status(500).send();
    }
});
tasksRoutes.delete('', (request, response) => {
    try {
        if (request.session.user !== 'unauthorized') {
            if (remove(request.body.taskId, request.session.user.id)) {
                response.status(204).send();
            } else {
                response.status(400).send();
            }
        } else {
            response.status(403).send();
        }
    } catch (exc) {
        response.status(500).send();
    }
});

function readAll(username) {
    const tasks = JSON.parse(fs.readFileSync(dbFilePath)).tasks;

    if (username) {
        const result = {
            userTasks: [],
            tasks: []
        }
        tasks.forEach(obj => {
            if (obj.creator === username) {
                result.userTasks.push(obj);
            } else {
                result.tasks.push(obj);
            }
        });
        return result;
    } else {
        return {
            userTasks: [],
            tasks: tasks
        }
    }
}

function write(obj) {
    fs.writeFileSync(dbFilePath, JSON.stringify(obj));
}

function read(userId) {
    let tasks = JSON.parse(fs.readFileSync(dbFilePath)).tasks;
    const filteredTasks = [];
    tasks.forEach(obj => {
        if (obj.userId == userId) {
            filteredTasks.push(obj);
        }
    });
    return filteredTasks;
}

function getWithId(taskId, userId) {
    const tasks = read(userId);
    for (let i = 0; i < tasks.length; i++) {
        if (tasks[i].id === Number.parseInt(taskId)) {
            return tasks[i];
        }
    }
}

function create(title, description, type, tags, userId, creator) {
    if (title !== '' && type !== '') {
        const task = {
            id: getNextId(),
            title: title,
            description: description || '',
            type: type,
            tags: tags ? tags.split(',') : [],
            userId: userId,
            status: 'todo',
            creator: creator
        }
        const tasks = readAll();
        const array = tasks.tasks;
        array.push(...tasks.userTasks);
        array.push(task);
        write({
            nextId: getNextId() + 1,
            tasks: array
        });
        return true;
    }
    return false;
}

function remove(taskId, userId) {
    const tasks = readAll();
    const allTasksArr = tasks.tasks;
    allTasksArr.push(...tasks.userTasks);
    for (let i = 0; i < allTasksArr.length; i++) {
        if (allTasksArr[i].id === Number.parseInt(taskId) && allTasksArr[i].userId === userId) {
            allTasksArr.splice(i, 1);
            write({ nextId: getNextId(), tasks: allTasksArr });
            return true;
        }
    }
    return false;
}

function update(obj, userId) {
    const tasks = readAll();
    const allTasks = tasks.tasks;
    allTasks.push(...tasks.userTasks);

    for (let i = 0; i < allTasks.length; i++) {
        if (allTasks[i].id === Number.parseInt(obj.id) && allTasks[i].userId === Number.parseInt(userId)) {
            allTasks[i].title = obj.title;
            allTasks[i].description = obj.description;
            allTasks[i].status = obj.status;
            allTasks[i].tags = obj.tags ? obj.tags.split(',') : [];
            allTasks[i].type = obj.type;
            write({ nextId: getNextId(), tasks: allTasks});
            return true;
        }
    }
    return false;
}

function getNextId() {
    return JSON.parse(fs.readFileSync(dbFilePath)).nextId;
}

module.exports = tasksRoutes;