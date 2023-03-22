lplog("LearnPlus loaded!");

var socket = io('https://learnplus.nebuladev.net');

socket.on('connect', function() {
    lplog("Socket connected.");
});

$(function() {
    socket.emit('getPanels', (res) => {
        if (!res.success) {
            lpLog("Failed to fetch panels: " + res.error);
            return;
        }

        var panels = res.data;
        var wrapper = $("<div id='learnplus-wrapper'></div>");
        
        for (var i = 0; i < panels.length; i++) {
            var panel = panels[i].data;
            var panelElm = $(panel);
            wrapper.append(panelElm);
        }

        $("body").append(wrapper);
        lplog("LearnPlus loaded!");
    });
})