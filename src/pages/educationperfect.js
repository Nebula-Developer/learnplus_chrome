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

async function epPrimaryLoop() {
    
}

async function epFastLoop() {
    ensureSkipPanel();
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
