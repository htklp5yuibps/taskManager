import { Task } from './task.js';

export class DoneTask extends Task {
    constructor(title, description) {
        super(title, description);
        this.status = 'done';
    }

    get getStatus() { return this.status; }
}