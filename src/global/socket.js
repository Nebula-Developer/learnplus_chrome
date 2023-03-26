const socket = io('https://learnplus.nebuladev.net');

function login(username, password) {
    return new Promise((resolve, reject) => {
        socket.emit('login', { username, password }, (data) => { resolve(data); });
    });
}

function createAccount(username, password, email) {
    return new Promise((resolve, reject) => {
        socket.emit('createAccount', { username, password, email }, (data) => { resolve(data); });
    });
}

function loginToken(username, token) {
    return new Promise((resolve, reject) => {
        socket.emit('loginToken', { username, token }, (data) => { resolve(data); });
    });
}

const globalBrowser = {
    getStorage: function(key) {
        if (typeof browser !== "undefined") {
            return browser.storage.local.get(key).then((res) => {
                return res[key];
            });
        }
        else if (typeof chrome !== "undefined") {
            return new Promise((resolve, reject) => {
                chrome.storage.local.get(key, (res) => {
                    resolve(res[key]);
                });
            });
        }
    },
    setStorage: function(key, value) {
        if (typeof browser !== "undefined") {
            return browser.storage.local.set({[key]: value});
        }
        else if (typeof chrome !== "undefined") {
            return new Promise((resolve, reject) => {
                chrome.storage.local.set({[key]: value}, () => {
                    resolve();
                });
            });
        }
    }
};

