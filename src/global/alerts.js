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