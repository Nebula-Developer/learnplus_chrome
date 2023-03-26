var active_alerts = [ ];

class Alert {
    constructor(title, content) {
        this.title = title;
        this.content = content;
    }

    show() {
        var alertID = Math.floor(Math.random() * 1000000000) + Date.now();
        var elm = $(`<div class="learnplus-alert" id="learnplus-alert-${alertID}">
                        <div class="learnplus-alert-title">${this.title}</div>
                        <div class="learnplus-alert-content">${this.content}</div>
                    </div>`);

        $(".learnplus-alerts-wrapper").append(elm);

        this.close = function() {
            var wasLastInStack = active_alerts[0].elm.is(elm);
            if (!wasLastInStack) $(".learnplus-alerts-wrapper").addClass("learnplus-alerts-wrapper-blur");

            function removeAlertFinal() {
                elm.remove();
                $(".learnplus-alert").css("transform", "translateY(0px)");
                active_alerts = active_alerts.filter((a) => !a.elm.is(elm));
            }

            elm.css("opacity", "0");
            
            if (!wasLastInStack) {
                setTimeout(() => {
                    $(".learnplus-alerts-wrapper").removeClass("learnplus-alerts-wrapper-blur");
                    removeAlertFinal();
                }, 300);
            } else removeAlertFinal();
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
showAlert("test", "<div class='learnplus-text-medium learnplus-text-2'>This is a test alert to demonstrate the power of the LearnPlus library.</div>");
showAlert("test", "<div class='learnplus-text-medium learnplus-text-2'>This is a test alert to demonstrate the power of the LearnPlus library.</div>");
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

var alertDragDist = 250;

// When we click an alert and drag it more than 300px to the left, we close it
$(document).on("mousedown", ".learnplus-alert", function(e) {
    e.preventDefault();
    var elm = $(this);
    var found = active_alerts.find((a) => a.elm.is(elm));
    if (!found) return;
    var alert = found.alert;

    var startX = e.pageX;
    var startY = e.pageY;
    elm.addClass("learnplus-alert-dragging");

    var mousemove = (e) => {
        e.preventDefault();
        var diffX = e.pageX - startX;

        var percent = Math.abs(diffX) / alertDragDist;
        elm.css("opacity", 1 - percent);
        elm.css("filter", `blur(${percent * 5}px)`);
        var lerpDiff = diffX / 2.5;

        elm.css("transform", `translateX(${lerpDiff}px) rotate(${lerpDiff / 30}deg) translateY(${-lerpDiff / 10}px)`);
        var height = elm.height() + 12;
    }

    var startTime = Date.now();

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

        if (Math.abs(diffX) > alertDragDist) {
            alert.close();
            elm.removeClass("learnplus-alert-dragging");
        }
    };

    $(document).on("mousemove", mousemove);
    $(document).on("mouseup", mouseup);
});
