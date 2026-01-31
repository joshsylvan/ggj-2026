const { app, BrowserWindow, ipcMain } = require('electron');
const path = require("node:path");
const buzzBuzzers = require('node-buzzers');
const buzzers = buzzBuzzers(true);

const BUTTON_NAME_MAP = [
    'buzz', 'blue', 'orange', 'green', 'yellow'
];

const createEmptyBuzzerState = () => ({
    buzz: false,
    blue: false,
    orange: false,
    green: false,
    yellow: false,
    led: false,
});
const BUZZ_STATE = [createEmptyBuzzerState(), createEmptyBuzzerState(), createEmptyBuzzerState(), createEmptyBuzzerState()];

buzzers.setLeds(false, false, false, false);
buzzers.onError(function (err) {
    console.log("Error: ", err);
});

buzzers.onPress(function (ev) {
    const controllerIndex = ev.controller - 1;
    const buttonName = BUTTON_NAME_MAP[ev.button];

    BUZZ_STATE[controllerIndex][buttonName] = true;

    console.log(
        `controller ${controllerIndex} pressed ${buttonName}`
    );
});

buzzers.onRelease((ev) => {
    const controllerIndex = ev.controller - 1;
    const buttonName = BUTTON_NAME_MAP[ev.button];
    BUZZ_STATE[controllerIndex][buttonName] = false;
    console.log(
        `controller ${controllerIndex} released ${buttonName}`
    );
});

const createWindow = () => {
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        autoHideMenuBar: true,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
        }
    })

    win.loadFile('index.html')
}

app.whenReady().then(() => {
    ipcMain.handle('ping', () => 'pong');
    ipcMain.handle('setLED', (...args) => buzzers.setLeds(...args))
    ipcMain.handle('getState', () => BUZZ_STATE);
    createWindow()
})

app.on('before-quit', () => {
    buzzers.setLeds(false, false, false, false);
});


// import nodeBuzzers from "npm:node-buzzers";
// import { IBuzzer } from "npm:node-buzzers/types/types";

// const buzzers = nodeBuzzers(true) as IBuzzer;

// // function blinkBuzzerLeds() {
// //   setInterval(function () {
// //     console.log("joshua");
// //     buzzers.setLeds(true, true, true, true);
// //     setTimeout(function () {
// //       buzzers.setLeds(false, false, false, false);
// //     }, 500);
// //   }, 5000);
// // }

// // blinkBuzzerLeds();

// buzzers.setLeds(true, false, true, false);

// buzzers.onError(function (err) {
//   console.log("Error: ", err);
// });

// console.log("hello");

// buzzers.onPress(function (ev) {
//   console.log(
//     `PRESSED: { "Controller": ${ev.controller}, "Button": ${ev.button} }`,
//   );
// });
