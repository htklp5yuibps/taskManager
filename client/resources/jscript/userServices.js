import { UsualUser } from './entities/usualUser.js';
import { PremiumUser } from './entities/premiumUser.js';
import { makeRequest } from './commonFunctions.js';

export function getCurrentUser() {
    return makeRequest('GET', 'http://localhost:8090/taskManager/users').then(response => {
        return createUser(response.responseJSON);
    });
}

export function createUser(obj) {
    switch (obj.status) {
        case 'usual': { return createObject(UsualUser); }
        case 'premium': { return createObject(PremiumUser); }
    }

    function createObject(type) {
        const user = new type(obj.username);
        user.setId = obj.id;
        return user;
    }
}

