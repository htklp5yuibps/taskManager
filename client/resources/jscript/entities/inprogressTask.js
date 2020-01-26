import { Task } from './task.js';

export class InprogressTask extends Task {
    constructor(title, description) {
        super(title, description);
        this.status = 'inprogress';
    }

    get getStatus() { return this.status; }
}