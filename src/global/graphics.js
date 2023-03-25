
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
        var panel = $("<div class='learnplus-panel'></div>");
        panel.css("left", this.x);
        panel.css("top", this.y);
        if (this.strictScale) {
            panel.css("width", this.width);
            panel.css("height", this.height);
        } else {
            
        }

        var topbar = $("<div class='learnplus-panel-topbar'></div>");
        panel.append(topbar);
        
        var title = $("<div class='learnplus-panel-title'></div>");
        title.text(this.title);
        topbar.append(title);

        var buttons = $("<div class='learnplus-panel-buttons'></div>");
        topbar.append(buttons);

        var close = $("<div class='learnplus-panel-close'><i class='fas fa-times'></i></div>");
        close.click(() => {
            panel.remove();
        });
        buttons.append(close);

        var content = $("<div class='learnplus-panel-content'></div>");
        content.html(this.content);
        panel.append(content);

        $("body").append(panel);
    }
}

$(document).on("mousedown", ".learnplus-panel-topbar", function(e) {
    var panel = $(this).parent();
    
    var startX = e.pageX;
    var startY = e.pageY;
    var startLeft = panel.offset().left;
    var startTop = panel.offset().top;

    var docMouseMove = function(e) {
        var left = startLeft + (e.pageX - $(window).scrollLeft() - startX);
        var top = startTop + (e.pageY - $(window).scrollTop() - startY);

        left = Math.max(0, left);
        top = Math.max(0, top);

        left = Math.min($(window).width() - panel.width(), left);
        top = Math.min($(window).height() - panel.height(), top);

        panel.css("left", left);
        panel.css("top", top);

        e.preventDefault();
    };

    var docMouseUp = function(e) {
        $(document).off("mousemove", docMouseMove);
        $(document).off("mouseup", docMouseUp);
    };

    var docScroll = function(e) {
        e.preventDefault();
    };

    $(document).on("mousemove", docMouseMove);
    $(document).on("mouseup", docMouseUp);
});

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

testPanel.create();
