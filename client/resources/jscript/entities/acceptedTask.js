import { Task } from './task.js';

export class AcceptedTask extends Task {
    constructor(title, description) {
        super(title, description);
        this.status = 'accepted';
    }

    get getStatus() { return this.status; }
}