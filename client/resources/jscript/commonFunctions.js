export function makeRequest(method, url, contentType = null, params = null) {
    return new Promise((res) => {
        const xhr = new XMLHttpRequest();
        let paramsString = '';
        xhr.withCredentials = true;

        xhr.onreadystatechange = () => {
            if (xhr.readyState === XMLHttpRequest.DONE) {
                res({
                        status: xhr.status,
                        responseJSON: xhr.responseText ? JSON.parse(xhr.responseText) : ''
                    }
                );
            }
        }

        xhr.open(method, url);
        if (contentType) {
            xhr.setRequestHeader('Content-Type', contentType);
        }

        if (params) {
            for (let param in params) {
                paramsString += `&${param}=${params[param]}`;
            }
            paramsString.replace('&', '');
        }

        xhr.send(paramsString ? paramsString : '');
    });
}

export function removeContentElement() {
    $('.content').replaceWith('<div class="content drop-style"></div>')
}

export function removeMenuElement() {
    $('.menu').replaceWith('<div class="menu drop-style"></div>')
}

export function isWellFormatUsername(username) {
    const arr = username.match('^[A-Za-z0-9@.]{10,}$');
    if (arr && arr.length === 1) {
        return true;
    }
    return false;
}

export function isWellFormatPremiumCode(premium) {
    const arr = premium.match('^[A-Za-z0-9]{4}-[A-Za-z0-9]{4}-[A-Za-z0-9]{4}-[A-Za-z0-9]{4}$');

    if (arr && arr.length === 1) {
        return true;
    }

    return false;
}