import { Task } from './task.js';

export class TodoTask extends Task {
    constructor(title, description) {
        super(title, description);
        this.status = 'todo';
    }

    get getStatus() { return this.status; }
}