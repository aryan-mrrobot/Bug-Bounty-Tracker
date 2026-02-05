const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  onPowerEvent: (callback) => ipcRenderer.on('power-event', (_, data) => callback(data))
});
