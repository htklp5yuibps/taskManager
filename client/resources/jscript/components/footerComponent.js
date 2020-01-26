import { titles } from '../components/titles.js';

export function footerComponent() {
    $('body > .footer').replaceWith(`<div class="footer"></div>`);
    $('body > .footer').text(titles.FOOTER);
}