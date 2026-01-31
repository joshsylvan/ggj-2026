'use strict';

const { app, BrowserWindow, ipcMain } = require('electron');
const path = require("node:path");
const buzzBuzzers = require('node-buzzers');

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

let buzzers;
try {
    buzzers = buzzBuzzers(true);
    buzzers.setLeds(false, false, false, false);
    buzzers.onError(function (err) {
        console.log("BUZZ ERROR: ", err);
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
} catch (error) {
    console.error('Failed to init buzz', error);
}

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
    ipcMain.handle('ping', () => 'pong');
    ipcMain.handle('setLED', (...args) => buzzers?.setLeds?.(...args));
    ipcMain.handle('getState', () => BUZZ_STATE);
    createWindow()
})

app.on('before-quit', () => {
    buzzers?.setLeds?.(false, false, false, false);
});
