import { User } from './user.js';

export class UsualUser extends User {
    constructor(username) {
        super(username);
        this.status = 'usual';
    }

    get getStatus() { return this.status; }
}