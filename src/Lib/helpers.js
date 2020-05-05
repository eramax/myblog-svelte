export function httpGet(path) {
    return req(path);
}

export function httpPost(path, data) {
    return req(path, 'POST', data);
}

export function httpPut(path, data) {
    return req(path, 'PUT', data);
}

async function req(path, method = 'GET', data) {
    const res = await fetch(path, {
        method,
        credentials: 'same-origin',
        body: data && JSON.stringify(data)
    });
    return await res.json();
}

export const getBlob = async(url) => {
    const res = await fetch(url);
    return await res.blob();
};

export const toDataURL = (url) =>
    fetch(url).then((response) => response.blob()).then(
        (blob) =>
        new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        })
    );

export function uuidv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = (Math.random() * 16) | 0,
            v = c == 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
    });
}
export const getFilename = (path) => path.replace(/^.*[\\\/]/, '').toLowerCase();