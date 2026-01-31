const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('versions', {
    node: () => process.version.node,
    chrome: () => process.version.chrome,
    electron: () => process.versions.electron,
    ping: () => ipcRenderer.invoke('ping'),
});

contextBridge.exposeInMainWorld('buzz', {
    setLED: (p1, p2, p3, p4) => ipcRenderer.invoke('setLED', p1, p2, p3, p4),
    getState: () => ipcRenderer.invoke('getState'),
});
// contextBridge.exposeInMainWorld('buzzers', {
//     buzzers,
// });
