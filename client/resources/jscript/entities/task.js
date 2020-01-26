import { Entity } from './entity.js';

export class Task extends Entity {
    constructor(title, description) {
        super();
        this.title = title || '';
        this.description = description || '';
        this.tags = [];
        this.type = 'story';
        this.creator = '';
    }

    get getTitle() { return this.title; }
    get getDescription() { return this.description; }
    get getTags() { return this.tags; }
    get getType() { return this.type; }
    get getCreator() { return this.creator; }

    set setTitle(title) { this.title = title; }
    set setDescription(description) { this.description = description; }
    set setTags(tags) { this.tags = tags; }
    set setType(type) { this.type = type; }
    set setCreator(creator) { this.creator = creator; }
}