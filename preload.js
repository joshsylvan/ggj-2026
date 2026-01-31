const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('versions', {
    node: () => process.version.node,
    chrome: () => process.version.chrome,
    electron: () => process.versions.electron,
});

contextBridge.exposeInMainWorld('buzz', {
    setLED: (p1, p2, p3, p4) => ipcRenderer.invoke('setLED', p1, p2, p3, p4),
    getState: () => ipcRenderer.invoke('getState'),
    onKeyDown: (event) => ipcRenderer.invoke('onKeyDown', event),
    onKeyUp: (event) => ipcRenderer.invoke('onKeyUp', event),
});
