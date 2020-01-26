const { Router } = require('express');
const fs = require('fs');
const path = require('path');

const dbFilePath = path.join(__dirname, '..', 'database', 'users.json');
const premiumCodesFilePath = path.join(__dirname, '..', 'database', 'premium-codes.json');

const usersRoutes = Router();

usersRoutes.get('', (request, response) => {
    try {
        if (request.session.user !== 'unauthorized') {
            const user = getWithId(request.session.user.id);
            delete user.id;
            delete user.password;
            response.status(200).json(user);
        } else {
            response.status(403).send();
        }
    } catch (exc) {
        response.status(500).send();
    }
});
usersRoutes.post('', (request, response) => {
    try {
        if (login(request.session, request.body.username, request.body.password)) {
            response.status(200).send();
        } else {
            response.status(403).send();
        }
    } catch (exc) {
        response.status(500).send();
    }
});
usersRoutes.post('/logout', (request, response) => {
    try {
        logout(request.session);
        response.status(200).send();
    } catch (exc) {
        response.status(500).send();
    }
});
usersRoutes.put('', (request, response) => {
    try {
        const { username, password, premium } = request.body;
        if (create(username, password, premium)) {
            response.status(200).send();
        } else {
            response.status(201).send();
        }
    } catch (exc) {
        response.status(500).send();
    }
});

function isCorrectPremiumCode(premiumCode) {
    if (typeof premiumCode === 'string' && premiumCode != '') {
        const premiumCodes = JSON.parse(fs.readFileSync(premiumCodesFilePath))['premium-codes'];

        for(let prem of premiumCodes) {
            if (prem === premiumCode) {
                return true;
            }
        }
    }

    return false;
}

function removePremiumCode(premiumCode) {
    const premiumCodes = JSON.parse(fs.readFileSync(premiumCodesFilePath))['premium-codes'];

    for (let i = 0; i < premiumCodes.length; i++) {
        if (premiumCodes[i] === premiumCode) {
            premiumCodes.splice(i, 1);
            break;
        }
    }

    fs.writeFileSync(premiumCodesFilePath, JSON.stringify({
        'premium-codes': premiumCodes
    }));
}

function generateNewPremiumCode() {
    const chars = ['', 'a', 'b', 'c', 'd', 'e', 'f', 'g'];
    let premiumCode = '';
    while(true) {
        for (let i = 0; i < 16; i++) {
            if (i && i % 4 === 0) {
                premiumCode += '-';
            }
            premiumCode += chars[Math.floor((Math.random() * 7) + 1)];
        }
        if (!isCorrectPremiumCode(premiumCode)) {
            break;
        }
    }

    const codes = JSON.parse(fs.readFileSync(premiumCodesFilePath))['premium-codes'];
    codes.push(premiumCode);

    fs.writeFileSync(premiumCodesFilePath, JSON.stringify({
        'premium-codes': codes
    }));
}

function create(username, password, premium) {
    if (username !== '' || password !== '') {
        if (username.length >= 10 || password.length >= 10) {
            const users = readAll();

            for (let i = 0; i < users.length; i++) {
                if (users[i].username === username) {
                    return false;
                }
            }

            if (premium) {
                if (isCorrectPremiumCode(premium)) {
                    removePremiumCode(premium);
                    generateNewPremiumCode();
                } else {
                    return false;
                }
            }

            const user = {
                id: getNextId(),
                username: username,
                password: password,
                status: premium !== '' ? 'premium' : 'usual'
            }
            users.push(user);

            fs.writeFileSync(dbFilePath, JSON.stringify({
                nextId: getNextId() + 1,
                users: users
            }));

            return true;
        }
    }

    return false;
}

function readAll() {
    return JSON.parse(fs.readFileSync(dbFilePath)).users;
}

function getWithId(id) {
    const users = readAll();
    for (let i = 0; i < users.length; i++) {
        if (users[i].id === id) {
            return users[i];
        }
    }
}

function login(session, username, password) {
    const users = readAll();
    for (let i = 0; i < users.length; i++) {
        if (users[i].username === username && users[i].password === password) {
            session.user = {
                id: users[i].id,
                username: users[i].username,
                status: users[i].status
            }
            return true;
        }
    }
    return false;
}

function logout(session) {
    session.user = 'unauthorized';
}

function getNextId() {
    return JSON.parse(fs.readFileSync(dbFilePath)).nextId;
}

module.exports = usersRoutes;