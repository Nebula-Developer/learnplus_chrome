var active_panels = [ ];
var loginCallbacks = [ ];

class Panel {
    constructor(x, y, width, height, title, content, strictScale = false) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.title = title;
        this.content = content;
        this.strictScale = strictScale;
    }

    create() {
        var panelID = Date.now() + active_panels.length;
        var panel = $("<div class='learnplus-panel' learnplus-panel-id='" + panelID + "' style='z-index: " + (active_panels.length + 99999) + "'></div>");
        panel.css("left", this.x);
        panel.css("top", this.y);
        
        panel.css("width", this.width);
        panel.css("height", this.height);
        panel.css("min-width", this.width);
        panel.css("min-height", this.height);

        var topbar = $("<div class='learnplus-panel-topbar'></div>");
        panel.append(topbar);
        
        var title = $("<div class='learnplus-panel-title'></div>");
        title.text(this.title);
        topbar.append(title);

        var buttons = $("<div class='learnplus-panel-buttons'></div>");
        topbar.append(buttons);

        var close = $("<div class='learnplus-panel-close'><img ondragstart='return false;' class='learnplus-panel-close-icon' src='" + root + "/Cross.png'></div>");
        close.click(() => {
            this.close();
        });
        buttons.append(close);

        var content = $("<div class='learnplus-panel-content'></div>");
        content.html(this.content);
        panel.append(content);

        if ($(".learnplus-wrapper").length > 0) {
            $(".learnplus-wrapper").append(panel);
        }

        var toPush = {
            panel: panel,
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height,
            id: panelID
        };

        // make it the top panel
        var index = active_panels.indexOf(toPush);
        if (index > -1) active_panels.splice(index, 1);

        active_panels.push(toPush);
        this.panel = panel;
        this.id = panelID;
        this.active = active_panels.length - 1;

        this.close = () => { this.panel.addClass("learnplus-panel-closed"); };
        this.open = () => { this.panel.removeClass("learnplus-panel-closed"); };
        this.remove = () => { this.panel.remove(); };
    }
}

function handleTopbarClick(e) {
    if ($(e.target).hasClass("learnplus-panel-close") || $(e.target).hasClass("learnplus-panel-close-icon")) return;
    var panel = $(this).parent();
    var panelFind = active_panels.find((p) => { return p.id == panel.attr("learnplus-panel-id"); });
    if (panelFind) {
        if (panel.css("width").replace("px", "") != panelFind.width || panel.css("height").replace("px", "") != panelFind.height) {
            panel.css("width", panelFind.width);
            panel.css("height", panelFind.height);
            var newX = panel.offset().left + e.offsetX;
            var newY = panel.offset().top + e.offsetY;
            newX -= (panel.width() / 2);
            newY -= 20;
            
            setWindowSize("none");
            panel.css("left", newX) - $(window).scrollLeft();
            panel.css("top", newY - $(window).scrollTop());
        }
    }

    var panelArray = active_panels.find((panel) => { return panel.id == $(this).parent().attr("learnplus-panel-id"); });

    if (panelArray) {
        var index = active_panels.indexOf(panelArray);
        if (index > -1) {
            active_panels.splice(index, 1);
        }
        active_panels.push(panelArray);

        updatePanelZIndex();
    }

    var startX = e.pageX;
    var startY = e.pageY;
    var startLeft = panel.offset().left;
    var startTop = panel.offset().top;

    var docMouseMove = function(e) {
        var left = startLeft + (e.pageX - $(window).scrollLeft() - startX);
        var top = startTop + (e.pageY - $(window).scrollTop() - startY);

        var isLeft = left < 0;
        var isTop = top < 0;
        var isRight = left > $(window).width() - panel.width();
        var isBottom = top > $(window).height() - panel.height();
        
        if (!isLeft && !isTop && !isRight && !isBottom) setWindowSize("none");
        // else if ((isLeft && isTop) || (isLeft && isBottom) || (isRight && isTop) || (isRight && isBottom)) setWindowSize("full");
        else if ((isLeft && isTop)) setWindowSize("tl");
        else if ((isLeft && isBottom)) setWindowSize("bl");
        else if ((isRight && isTop)) setWindowSize("tr");
        else if ((isRight && isBottom)) setWindowSize("br");
        else if (isLeft) setWindowSize("left");
        else if (isTop) setWindowSize("top");
        else if (isRight) setWindowSize("right");
        else if (isBottom) setWindowSize("bottom");
        else setWindowSize("none");

        left = Math.max(0, left);
        top = Math.max(0, top);
        
        var widthOffset = $(window).width() - panel.width();
        var heightOffset = $(window).height() - panel.height();

        left = Math.min(widthOffset, left);
        top = Math.min(heightOffset, top);

        panel.css("left", left);
        panel.css("top", top);

        e.preventDefault();
    };

    var docMouseUp = function(e) {
        $(document).off("mousemove", docMouseMove);
        $(document).off("mouseup", docMouseUp);

        var left = startLeft + (e.pageX - $(window).scrollLeft() - startX);
        var top = startTop + (e.pageY - $(window).scrollTop() - startY);

        var isLeft = left < 0;
        var isTop = top < 0;
        var isRight = left > $(window).width() - panel.width();
        var isBottom = top > $(window).height() - panel.height();

        var panelID = panel.attr("learnplus-panel-id");
        var pFind = active_panels.find((p) => { return p.id == panelID; });
        var leftPos = panel.offset().left;
        var topPos = panel.offset().top;
        var widthPos = pFind.width;
        var heightPos = pFind.height;

        if ((isLeft && isTop)) {
            leftPos = 0;
            topPos = 0;
            widthPos = "50%";
            heightPos = "50%";
        }
        else if ((isLeft && isBottom)) {
            leftPos = 0;
            topPos = "50%";
            widthPos = "50%";
            heightPos = "50%";
        }
        else if ((isRight && isTop)) {
            leftPos = "50%";
            topPos = 0;
            widthPos = "50%";
            heightPos = "50%";
        }
        else if ((isRight && isBottom)) {
            leftPos = "50%";
            topPos = "50%";
            widthPos = "50%";
            heightPos = "50%";
        }
        else if (isLeft) {
            widthPos = "50%";
            heightPos = "100%";
            topPos = "0";
            leftPos = "0";
        }
        else if (isTop) {
            heightPos = "50%";
            widthPos = "100%";
            leftPos = "0";
            topPos = "0";
        }
        else if (isRight) {
            leftPos = "50%";
            widthPos = "50%";
            heightPos = "100%";
            topPos = "0";
        }
        else if (isBottom) {
            topPos = "50%";
            heightPos = "50%";
            widthPos = "100%";
            leftPos = "0";
        }

        var didModWidth = widthPos != pFind.width;
        var didModHeight = heightPos != pFind.height;

        if (didModWidth || didModHeight) {
            var resizeDuration = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--panel-resize-duration'));
            if (resizeDuration == 0) {
                setWindowSize("none");
                panel.css("left", leftPos);
                panel.css("top", topPos);
                panel.css("width", widthPos);
                panel.css("height", heightPos);
            } else {
                panel.addClass("learnplus-panel-blur-transition");
                setWindowSize("none");
                
                setTimeout(() => {
                    panel.removeClass("learnplus-panel-blur-transition");
                    panel.css("left", leftPos);
                    panel.css("top", topPos);
                    panel.css("width", widthPos);
                    panel.css("height", heightPos);
                }, resizeDuration * 1000);
            }
        }
    };

    var docScroll = function(e) {
        e.preventDefault();
    };

    $(document).on("mousemove", docMouseMove);
    $(document).on("mouseup", docMouseUp);
}

function handlePanelClick(e) {
    var panel = $(this);
    var panelID = panel.attr("learnplus-panel-id");
    var pFind = active_panels.find((p) => { return p.id == panelID; });
    var pIndex = active_panels.indexOf(pFind);

    if (pIndex != active_panels.length - 1) {
        active_panels.splice(pIndex, 1);
        active_panels.push(pFind);
        updatePanelZIndex();
    }

    $(".learnplus-panel-active").removeClass("learnplus-panel-active");
    panel.addClass("learnplus-panel-active");
}

$(document).on("mousedown", ".learnplus-panel-topbar", handleTopbarClick);
$(document).on("mousedown", ".learnplus-panel", handlePanelClick);

function updatePanelZIndex() {
    for (var i = 0; i < active_panels.length; i++) {
        active_panels[i].panel.css("z-index", i + 99999);
    }
}

function loadPanelStylesheets() {
    $("head").append(`  <link rel="stylesheet" href="https://use.fontawesome.com/releases/v5.15.4/css/fontawesome.css" integrity="sha384-jLKHWM3JRmfMU0A5x5AkjWkw/EYfGUAGagvnfryNV3F9VqM98XiIH7VBGVoxVSc7" crossorigin="anonymous"/>`);
    $("head").append(`<link rel="stylesheet" href="https://use.fontawesome.com/releases/v5.15.4/css/solid.css" integrity="sha384-Tv5i09RULyHKMwX0E8wJUqSOaXlyu3SQxORObAI08iUwIalMmN5L6AvlPX2LMoSE" crossorigin="anonymous"/>`);
    socket.emit('get', 'panel.css', (data) => {
        if (data.success) {
            var style = $("<style></style>");
            style.text(data.data);
            $("head").append(style);
        }
    });
}

loadPanelStylesheets();

function handlePanelLocations() {
    $(".learnplus-panel").each(function() {
        var panel = $(this);
        var left = panel.offset().left;
        var top = panel.offset().top;

        left = Math.max(0, left);
        top = Math.max(0, top);

        left = Math.min($(window).width() - panel.width(), left);
        top = Math.min($(window).height() - panel.height(), top);

        panel.css("left", left);
        panel.css("top", top);

        var width = panel.width();
        var height = panel.height();

        width = left + width > $(window).width() ? $(window).width() - left : width;
        height = top + height > $(window).height() ? $(window).height() - top : height;

        width = Math.min(width, $(window).width());
        height = Math.min(height, $(window).height());

        panel.css("width", width);
        panel.css("height", height);

        var panelID = panel.attr("learnplus-panel-id");
        var pFind = active_panels.find((p) => { return p.id == panelID; });
        pFind.width = width;
        pFind.height = height;
    });
}

$(window).on("resize", handlePanelLocations);

function loadLoginPanels() {
    var loginPanel = new Panel(500, 300, 500, 325, "Login", `
        <div class="learnplus-text-large learnplus-text-1">Login to LearnPlus</div>
        <div class="learnplus-text-3 learnplus-mt-5 learnplus-login-error"></div>
        <input type="text" class="learnplus-input-1 learnplus-mt-25 learnplus-username-input" placeholder="Username or Email"/>
        <input type="password" class="learnplus-input-1 learnplus-mt-5 learnplus-password-input" placeholder="Password"/>
        <div class="learnplus-button-1 learnplus-mt-15 learnplus-login-button">Login</div>
        <div class="learnplus-text-3 learnplus-mt-15 learnplus-text-center learnplus-register-link learnplus-text-button-2">Don't have an account? Register here.</div>
    `);

    var registerPanel = new Panel(500, 300, 500, 410, "Register", `
        <div class="learnplus-text-large learnplus-text-1">Create a new LearnPlus account</div>
        <div class="learnplus-text-3 learnplus-mt-5 learnplus-register-error"></div>
        <input type="text" class="learnplus-input-1 learnplus-mt-25  learnplus-username-input" placeholder="Username"/>
        <input type="email" class="learnplus-input-1 learnplus-mt-5  learnplus-email-input" placeholder="Email"/>
        <input type="password" class="learnplus-input-1 learnplus-mt-5 learnplus-password-input" placeholder="Password"/>
        <input type="password" class="learnplus-input-1 learnplus-mt-5 learnplus-password-confirm-input" placeholder="Confirm Password"/>
        <div class="learnplus-button-1 learnplus-mt-15 learnplus-register-button">Create Account</div>
        <div class="learnplus-text-3 learnplus-mt-15 learnplus-text-center learnplus-login-link learnplus-text-button-2">Already have an account? Login here.</div>
    `);
    
    loginPanel.create();
    registerPanel.create();
    registerPanel.close();

    var loginButton = loginPanel.panel.find(".learnplus-login-button");
    var registerButton = registerPanel.panel.find(".learnplus-register-button");

    loginButton.on("click", function() {
        var username = loginPanel.panel.find(".learnplus-username-input").val().trim();
        var password = loginPanel.panel.find(".learnplus-password-input").val();
        login(username, password).then((res) => {
            if (!res.success) {
                loginPanel.panel.find(".learnplus-login-error").text(res.error);
            } else {
                loginPanel.close();
                
                if (res.data.token) {
                    globalBrowser.setStorage("token", JSON.stringify({
                        username: res.data.username,
                        token: res.data.token
                    }));
                }

                for (var i = 0; i < loginCallbacks.length; i++) {
                    loginCallbacks[i](res.data);
                }
            }
        })
    });

    registerButton.on("click", function() {
        var username = registerPanel.panel.find(".learnplus-username-input").val().trim();
        var email = registerPanel.panel.find(".learnplus-email-input").val();
        var password = registerPanel.panel.find(".learnplus-password-input").val();
        var passwordConfirm = registerPanel.panel.find(".learnplus-password-confirm-input").val();

        if (password != passwordConfirm) {
            registerPanel.panel.find(".learnplus-register-error").text("Passwords do not match");
            return;
        }

        createAccount(username, password, email).then((res) => {
            if (!res.success) {
                registerPanel.panel.find(".learnplus-register-error").text(res.error);
            } else {
                registerPanel.close();

                if (res.data.token) {
                    globalBrowser.setStorage("token", JSON.stringify({
                        username: res.data.username,
                        token: res.data.token
                    }));
                }

                for (var i = 0; i < loginCallbacks.length; i++) {
                    loginCallbacks[i](res.data);
                }
            }
        });
    });

    var loginLink = registerPanel.panel.find(".learnplus-login-link");
    var registerLink = loginPanel.panel.find(".learnplus-register-link");

    loginLink.on("click", function() {
        registerPanel.close();
        loginPanel.open();
    });

    registerLink.on("click", function() {
        loginPanel.close();
        registerPanel.open();
    });
}

function setWindowSize(pos) {
    var windowOverlay = $(".learnplus-window-scale-overlay");
    var width = "calc(100% - 20px)";
    var height = "calc(100% - 20px)";
    var left = "0px";
    var top = "0px";
    var opacity = 1;

    switch (pos) {
        case "left":
            width = "calc(50vw - 20px)";
            break;

        case "right":
            width = "calc(50vw - 20px)";
            left = "50%";
            break;

        case "top":
            height = "calc(50vh - 20px)";
            break;

        case "bottom":
            height = "calc(50vh - 20px)";
            top = "50vh";
            break;

        case "none":
            opacity = 0;
            break;

        case "tl":
            top = "0px";
            left = "0px";
            width = "calc(50vw - 20px)";
            height = "calc(50vh - 20px)";
            break;

        case "tr":
            top = "0px";
            left = "50vw";
            width = "calc(50vw - 20px)";
            height = "calc(50vh - 20px)";
            break;

        case "bl":
            top = "50vh";
            left = "0px";
            width = "calc(50vw - 20px)";
            height = "calc(50vh - 20px)";
            break;

        case "br":
            top = "50vh";
            left = "50vw";
            width = "calc(50vw - 20px)";
            height = "calc(50vh - 20px)";
            break;
    }

    windowOverlay.css("opacity", opacity);
    if (opacity == 0) {
        windowOverlay.css("filter", "blur(20px)");
        return;
    } else windowOverlay.css("filter", "blur(0px)");

    windowOverlay.css("width", width);
    windowOverlay.css("left", left);
    windowOverlay.css("height", height);
    windowOverlay.css("top", top);
}

globalBrowser.getStorage("token").then((token) => {
    if (token) {
        var json = JSON.parse(token);
        loginToken(json.username, json.token).then((res) => {
            if (!res.success) {
                loadLoginPanels();
            } else {
                for (var i = 0; i < loginCallbacks.length; i++) {
                    loginCallbacks[i](res.data);
                }
            }
        });
    } else {
        loadLoginPanels();
    }
});
