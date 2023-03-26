var active_panels = [ ];

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
        if (this.strictScale) {
            panel.css("width", this.width);
            panel.css("height", this.height);
        } else {
            panel.css("min-width", this.width);
            panel.css("min-height", this.height);
        }

        var resizeWrapper = $(`
            <div class='learnplus-panel-resize-wrapper'>
                <div class='learnplus-panel-resize learnplus-panel-resize-t'></div>
                <div class='learnplus-panel-resize learnplus-panel-resize-r'></div>
                <div class='learnplus-panel-resize learnplus-panel-resize-b'></div>
                <div class='learnplus-panel-resize learnplus-panel-resize-l'></div>
                <div class='learnplus-panel-resize learnplus-panel-resize-tl'></div>
                <div class='learnplus-panel-resize learnplus-panel-resize-tr'></div>
                <div class='learnplus-panel-resize learnplus-panel-resize-bl'></div>
                <div class='learnplus-panel-resize learnplus-panel-resize-br'></div>
            </div>
        `);

        panel.append(resizeWrapper);

        var topbar = $("<div class='learnplus-panel-topbar'></div>");
        panel.append(topbar);
        
        var title = $("<div class='learnplus-panel-title'></div>");
        title.text(this.title);
        topbar.append(title);

        var buttons = $("<div class='learnplus-panel-buttons'></div>");
        topbar.append(buttons);

        var close = $("<div class='learnplus-panel-close'><i class='fas fa-times learnplus-panel-close-icon'></i></div>");
        close.click(() => {
            panel.remove();
        });
        buttons.append(close);

        var content = $("<div class='learnplus-panel-content'></div>");
        content.html(this.content);
        panel.append(content);

        if ($(".learnplus-wrapper").length > 0) {
            $(".learnplus-wrapper").append(panel);
        } else {
            $("body").append("<div class='learnplus-wrapper'></div>");
            $(".learnplus-wrapper").append(panel);
            $(".learnplus-wrapper").append("<div class='learnplus-window-scale-overlay'></div>");
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
        if (index > -1) {
            active_panels.splice(index, 1);
        }

        active_panels.push(toPush);
    }
}

$(document).on("mousedown", ".learnplus-panel-topbar", function(e) {
    // Make sure we are not on the close button
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
            panel.css("left", newX);
            panel.css("top", newY);
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
});

$(document).on("mousedown", ".learnplus-panel", function(e) {
    var panel = $(this);
    var panelID = panel.attr("learnplus-panel-id");
    var pFind = active_panels.find((p) => { return p.id == panelID; });
    var pIndex = active_panels.indexOf(pFind);

    if (pIndex != active_panels.length - 1) {
        active_panels.splice(pIndex, 1);
        active_panels.push(pFind);
        updatePanelZIndex();
    }
});

function updatePanelZIndex() {
    for (var i = 0; i < active_panels.length; i++) {
        active_panels[i].panel.css("z-index", i + 99999);
    }
}

socket.emit('get', 'panel.css', (data) => {
    if (data.success) {
        var style = $("<style></style>");
        style.text(data.data);
        $("head").append(style);
    }
});

$(window).on("resize", function() {
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
    });
});

$("head").append(`<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.3.0/css/all.min.css" integrity="sha512-SzlrxWUlpfuzQ+pcUCosxcglQRNAq/DZjVsC0lE40xsADsfeQoEypE+enwcOiGjk/bSuGGKHEyjSoQ1zVisanQ==" crossorigin="anonymous" referrerpolicy="no-referrer" />`);

var testPanel = new Panel(100, 100, 300, 300, "Test Panel", `
<div class="learnplus-text-1">Hello World!</div>
<div class="learnplus-text-2">This is a test panel.</div>
<div class="learnplus-text-3">This is a test panel.</div>
<div class="learnplus-button-1">Test Button</div>
`);

var testPanel2 = new Panel(100, 100, 300, 300, "Test Panel 2", `
<div class="learnplus-text-1">Hello World!</div>
<div class="learnplus-text-2">This is a test 2 panel.</div>
<div class="learnplus-button-2">Test Button - With two!</div>
<div class="learnplus-button-1 learnplus-button-disabled">Test Button - Disabled</div>
`);

testPanel.create();
testPanel2.create();

testPanel2.create();
testPanel2.create();
testPanel2.create();
testPanel2.create();

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
