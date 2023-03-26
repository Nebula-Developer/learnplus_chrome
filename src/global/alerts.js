var active_alerts = [ ];

class Alert {
    constructor(title, content) {
        this.title = title;
        this.content = content;
    }

    show() {
        var elm = $(`<div class="learnplus-alert">
            <div class="learnplus-alert-title">${this.title}</div>
            <div class="learnplus-alert-content">${this.content}</div>
        </div>`);

        $(".learnplus-alerts-wrapper").append(elm);

        this.close = function() {
            elm.fadeOut(200, () => {
                elm.remove();
                active_alerts.splice(active_alerts.indexOf(this), 1);
            });
        };

        active_alerts.push({
            elm: elm,
            alert: this,
            close: this.close
        });
    }
}

function showAlert(title, content, time = -1) {
    var alert = new Alert(title, content);
    alert.show();

    if (time !== -1) {
        setTimeout(() => {
            alert.close();
        }, time);
    }
}

showAlert("test", "<div class='learnplus-text-medium learnplus-text-2'>This is a test alert to demonstrate the power of the LearnPlus library.</div>");

function loadAlertStylesheets() {
    socket.emit('get', 'alerts.css', (data) => {
        if (data.success) {
            var style = $("<style></style>");
            style.text(data.data);
            $("head").append(style);
        }
    });
}

loadAlertStylesheets();

// When we click an alert and drag it more than 300px to the left, we close it
$(document).on("mousedown", ".learnplus-alert", function(e) {
    e.preventDefault();
    var elm = $(this);
    var alert = active_alerts.find((a) => a.elm.is(elm)).alert;

    var startX = e.pageX;
    var startY = e.pageY;
    elm.addClass("learnplus-alert-dragging");

    var mousemove = (e) => {
        e.preventDefault();
        var diffX = e.pageX - startX;
        var diffY = e.pageY - startY;

        var percent = Math.abs(diffX) / 300;
        elm.css("opacity", 1 - percent);
        elm.css("filter", `blur(${percent * 5}px)`);

        elm.css("transform", `translateX(${diffX}px)`);
    };

    var mouseup = (e) => {
        e.preventDefault();
        elm.css("transform", "translateX(0px)");
        elm.removeClass("learnplus-alert-dragging");

        elm.css("opacity", 1);
        elm.css("filter", "blur(0px)");

        $(document).off("mouseup", mouseup);
        $(document).off("mousemove", mousemove);

        var diffX = e.pageX - startX;
        var diffY = e.pageY - startY;

        if (Math.abs(diffX) > 300) {
            alert.close();
            elm.removeClass("learnplus-alert-dragging");
        }
    };

    $(document).on("mousemove", mousemove);
    $(document).on("mouseup", mouseup);
});
