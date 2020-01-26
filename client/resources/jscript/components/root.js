import { tasksComponent } from './tasksComponent.js';
import { menuComponent } from './menuComponent.js';
import { headerComponent } from './headerComponent.js';
import { footerComponent } from './footerComponent.js';

rootComponent();

export function rootComponent() {
    headerComponent();
    menuComponent();
    tasksComponent();
    footerComponent();
}