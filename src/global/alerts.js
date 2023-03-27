var active_alerts = [ ];

class Alert {
    constructor(title, content) {
        this.title = title;
        this.content = content;
    }

    show() {
        var alertID = Math.floor(Math.random() * 1000000000) + Date.now();
        var elm = $(`<div class="learnplus-alert" id="learnplus-alert-${alertID}">
                        <div class="learnplus-alert-title">
                            ${this.title}
                            <div class="learnplus-alert-close">
                                <img src="${root}/Cross.png" class="learnplus-alert-close-img">
                            </div>
                        </div>
                        <div class="learnplus-alert-content">${this.content}</div>
                    </div>`);

        $(".learnplus-alerts-wrapper").prepend(elm);

        this.close = function() {
            var wasLastInStack = active_alerts[active_alerts.length - 1].elm.is(elm);
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

        this.fadeOut = function() {
            elm.fadeOut(300, () => {
                elm.remove();
                active_alerts = active_alerts.filter((a) => !a.elm.is(elm));
            });
        };

        this.closeAnim = function() {
            elm.animate({
                opacity: 0
            }, 200, () => {
                this.close();
            });
        }

        var close = elm.find(".learnplus-alert-close");
        close.click(() => {
            this.closeAnim();
        });

        active_alerts.push({
            elm: elm,
            alert: this,
            close: this.close,
            fadeOut: this.fadeOut
        });
    }
}

function showAlert(title, content, time = -1) {
    var alert = new Alert(title, content);
    alert.show();

    if (time !== -1) {
        setTimeout(() => {
            alert.fadeOut();
        }, time);
    }
}

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

var alertDragDist = 100;

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

        var rotationRelativeToY = lerpDiff / elm.width() * 10;

        elm.css("transform", `translateX(${lerpDiff}px) rotate(${rotationRelativeToY}deg) translateY(${-lerpDiff / 10}px)`);
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

document.addEventListener("keydown", (e) => {
    if (e.key === "g" && e.ctrlKey) {
        var alert = new Alert("Test", "<div class='learnplus-text-1'>This is a test alert</div>");
        alert.show();
    }
});
