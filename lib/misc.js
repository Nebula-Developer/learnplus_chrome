const learnplus_ensure = 1;

const learnplus_log_1 = "color: purple; font-size: 1.2em; font-weight: bold;";
const learnplus_log_2 = "color: blue; font-size: 1.1em; font-weight: bold;";

function lplog(msg) {
    if (typeof msg !== "string") console.log("%c[ LearnPlus ] %c", learnplus_log_1, learnplus_log_2, msg);
    else console.log("%c[ LearnPlus ] %c" + msg, learnplus_log_1, learnplus_log_2);
}

function sleep(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }
