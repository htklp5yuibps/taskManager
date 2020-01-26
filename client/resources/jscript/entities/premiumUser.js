import { User } from './user.js';

export class PremiumUser extends User {
    constructor(username) {
        super(username);
        this.status = 'premium';
    }

    get getStatus() { return this.status; }
}