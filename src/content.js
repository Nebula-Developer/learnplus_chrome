lplog("LearnPlus loaded!");

var socket = io('https://learnplus.nebuladev.net');

socket.on('connect', function() {
    lplog("Socket connected.");
});

socket.on('error', function(err) {
    lplog("Socket error: " + err);
});

lplog(socket);
