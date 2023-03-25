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

createAccount("NebulaDeveloper", "nebula", "nebuladev.contact@gmail.com").then((res) => {
    console.log(res);
});
