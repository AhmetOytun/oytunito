const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electron", {
  toggleServer: () => ipcRenderer.send("server-toggle"),
  getServerStatus: () => ipcRenderer.invoke("server-status"),
  startServer: () => ipcRenderer.send("server-start"),
  stopServer: () => ipcRenderer.send("server-stop"),
  getDevices: () => ipcRenderer.invoke("get-devices"),
  startPublishing: () => ipcRenderer.send("start-publishing"),
  stopPublishing: () => ipcRenderer.send("stop-publishing"),
  downloadProgress: () => ipcRenderer.invoke("download-progress"),
});
