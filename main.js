'use strict';

const { app, ipcMain, BrowserWindow } = require('electron');
const path = require("node:path");
const buzzBuzzers = require('node-buzzers');

let buzzers;
let isBuzzConnected = true;
try {
    buzzers = buzzBuzzers(true);
} catch (error) {
    console.error('Failed to init buzz, falling back to keyboard controls');
    isBuzzConnected = false
}

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


if (isBuzzConnected) {
    buzzers.setLeds(false, false, false, false);
    buzzers.onError(function (err) {
        console.log("BUZZ ERROR: ", err);
    });
    buzzers.onPress(function (ev) {
        const controllerIndex = ev.controller - 1;
        const buttonName = BUTTON_NAME_MAP[ev.button];
        BUZZ_STATE[controllerIndex][buttonName] = true;
    });
    buzzers.onRelease((ev) => {
        const controllerIndex = ev.controller - 1;
        const buttonName = BUTTON_NAME_MAP[ev.button];
        BUZZ_STATE[controllerIndex][buttonName] = false;
    });
}

const KEY_NAME_MAP = {
    'Digit1': [0, 'buzz'],
    'Digit2': [0, 'blue'],
    'Digit3': [0, 'orange'],
    'Digit4': [0, 'green'],
    'Digit5': [0, 'yellow'],
    'KeyQ': [1, 'buzz'],
    'KeyW': [1, 'blue'],
    'KeyE': [1, 'orange'],
    'KeyR': [1, 'green'],
    'KeyT': [1, 'yellow'],
    'KeyA': [2, 'buzz'],
    'KeyS': [2, 'blue'],
    'KeyD': [2, 'orange'],
    'KeyF': [2, 'green'],
    'KeyG': [2, 'yellow'],
    'KeyZ': [3, 'buzz'],
    'KeyX': [3, 'blue'],
    'KeyC': [3, 'orange'],
    'KeyV': [3, 'green'],
    'KeyB': [3, 'yellow'],
};

const createWindow = () => {
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        autoHideMenuBar: true,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
        }
    })

    // Load the Vite app - use dev server in development, built files in production
    if (process.env.VITE_DEV_SERVER_URL) {
        win.loadURL(process.env.VITE_DEV_SERVER_URL);
    } else {
        win.loadFile(path.join(__dirname, 'app', 'dist', 'index.html'));
    }
}

app.whenReady().then(() => {
    ipcMain.handle('setLED', (...args) => {
        if (isBuzzConnected) buzzers.setLeds(...args);
    });
    ipcMain.handle('getState', () => BUZZ_STATE);
    ipcMain.handle('onKeyDown', (_, keyCode) => {
        if (!KEY_NAME_MAP[keyCode]) return;
        const [controllerIndex, buttonName] = KEY_NAME_MAP[keyCode];
        BUZZ_STATE[controllerIndex][buttonName] = true;
    });
    ipcMain.handle('onKeyUp', (_, keyCode) => {
        if (!KEY_NAME_MAP[keyCode]) return;
        const [controllerIndex, buttonName] = KEY_NAME_MAP[keyCode];
        BUZZ_STATE[controllerIndex][buttonName] = false;
    });
    createWindow();
});

app.on('before-quit', () => {
    if (isBuzzConnected) buzzers.setLeds(false, false, false, false);
});
