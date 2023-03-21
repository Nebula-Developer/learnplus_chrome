lplog("LearnPlus - EducationPerfect module loaded.");
epInit();

function epInit() {
    const general = async() => {
        while (true) {
            epPrimaryLoop();
            await sleep(100);
        }
    }

    const fast = async() => {
        while (true) {
            epFastLoop();
            await sleep(50);
        }
    }

    general();
    fast();
}

var scratchLock = 0;
async function epPrimaryLoop() {
    if (elmExists(".scratch-canvas") && scratchLock == 0) {
        scratchLock = 1;
        handleWriteCanvasText("Hello World! This is a test.");
    }
}

async function epFastLoop() {
    ensureSkipPanel();
}

async function handleWriteCanvasText(text) {
    var newCanvas = document.createElement("canvas");
    var container = $(".scratch-canvas");
    newCanvas.width = 800;
    newCanvas.height = 500;
    var ctx = newCanvas.getContext("2d");
    ctx.font = "50px Monospace";
    ctx.fillText(text, 10, 50);

    var imgData = ctx.getImageData(0, 0, 1000, 1000);
    var positions = [];
    for (var i = 0; i < imgData.data.length; i += 4 * 4) {
        if (imgData.data[i + 3] > 0) {
            var x = (i / 4) % 1000;
            var y = Math.floor((i / 4) / 1000);
            positions.push({ x: x, y: y });
        }
    }
    sketchCanvasDrawPositions(positions);
}

function makeMouseEvent(type, x, y) {
    // Make mouseup/mousedown event, but not MouseEvents
    var mouseEvent = new MouseEvent(type, {
        view: window,
        bubbles: true,
        cancelable: true,
        clientX: x,
        clientY: y
    });
    return mouseEvent;
}

function getSketchCanvas() { return $(".scratch-canvas"); }

function sketchCanvasDown(x, y) {
    var canvas = getSketchCanvas();
    var mouseEvent = makeMouseEvent("mousedown", x + canvas.offset().left, y + canvas.offset().top);
    canvas[0].dispatchEvent(mouseEvent);
}

function sketchCanvasUp(x, y) {
    var canvas = getSketchCanvas();
    var mouseEvent = makeMouseEvent("mouseup", x + canvas.offset().left, y + canvas.offset().top);
    canvas[0].dispatchEvent(mouseEvent);
}

function sketchCanvasMove(x, y) {
    var canvas = getSketchCanvas();
    var mouseEvent = makeMouseEvent("mousemove", x + canvas.offset().left, y + canvas.offset().top);
    canvas[0].dispatchEvent(mouseEvent);
}

async function sketchCanvasDrawPositions(positions) {
    $(".scratch-canvas").css("pointer-events", "none");
    var canvas = getSketchCanvas();
    var first = positions[0];
    sketchCanvasDown(first.x, first.y);
    await sleep(10);
    var oldY = first.y;
    
    var x = 0;
    var y = 0;
    var direction = 1;
    var lastTime = Date.now();

    while (positions.length > 0) {
        var index = -1;
        for (var i = 0; i < positions.length; i++) {
            if (positions[i].x == x && positions[i].y == y) {
                index = i;
                break;
            }
        }
        if (index != -1) {
            sketchCanvasDown(positions[index].x, positions[index].y);
            await sleep(5);
            sketchCanvasUp(positions[index].x, positions[index].y);
            positions.splice(index, 1);

            var howManyLeft = positions.length;
            if (howManyLeft % 10 == 0) {
                lplog("LearnPlus - " + howManyLeft + " pixels left to draw.");
            }
        }
        y += direction;
        if (y >= 1000) {
            y = 999;
            x++;
            direction = -1;
        } else if (y < 0) {
            y = 0;
            x++;
            direction = 1;
        }
    }

    $(".scratch-canvas").css("pointer-events", "auto");
}

async function ensureSkipPanel() {
    if (elmExists(".information.selected") && !elmExists("#learnplus-skip-panel")) {
        var nativeSkipButton = $(".information-controls .continue");
        nativeSkipButton.css("display", "none");

        function activateSkip() {
            var nativeButtons = $(".continue.arrow.action-bar-button.v-group.ng-isolate-scope").find('button');
            for (var i = 0; i < nativeButtons.length; i++) {
                if (nativeButtons[i].id.includes("learnplus")) continue;
                nativeButtons[i].click();
            }
        }

        const panel = $(`<div id="learnplus-skip-panel" style="margin-left: 10px; display: flex;"></div>`);

        const skipButton = await genButton("Skip", () => {
            activateSkip();
            console.log("test");
        }, "learnplus-skip-button");

        const skipSectionButton = await genButton("Skip Section", async () => {
            while (elmExists(".information.selected")) {
                activateSkip();
                await sleep(100);
            }
        }, "learnplus-skip-section-button");

        panel.append(skipButton);
        panel.append(skipSectionButton);

        const infoControls = $(".information-controls");
        infoControls.css("display", "flex");

        if (infoControls.length > 0) {
            infoControls.append(panel);
        }
    }
}

async function genButton(text, func, id) {
    const button = $(`
        <div id="${id}" class="action-bar-button v-group continue" style="margin-left: 10px">
            <button>
                <span class="abb-label">
                    <span class="ng-binding ng-scope"> ${text} </span>
                </span>
                <span class="highlight"></span>
            </button>
            <div class="sidemode-label ng-hide">
                <span class="ng-binding ng-scope"> ${text} </span>
            </div>
        </div>       
    `);

    button.click(func);
    return button;
}

function elmExists(query) {
    return document.querySelector(query) !== null;
}
