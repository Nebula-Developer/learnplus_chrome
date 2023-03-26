$("body").append("<div class='learnplus-wrapper'></div>");
$(".learnplus-wrapper").append("<div class='learnplus-window-scale-overlay'></div>");
$(".learnplus-wrapper").append("<div class='learnplus-alerts-wrapper'></div>");

socket.emit('get', 'theme.css', (data) => {
    if (data.success) {
        var style = $("<style></style>");
        style.text(data.data);
        $("head").append(style);
    }
});