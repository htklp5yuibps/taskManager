import { Entity } from './entity.js';

export class User extends Entity {
    constructor(username) {
        super();
        this.username = username;
    }

    get getUsername() { return this.username; }
    set setUsename(username) { this.username = username; }
}