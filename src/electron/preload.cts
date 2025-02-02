const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electron", {
  toggleServer: () => ipcRenderer.send("server-toggle"),
  getServerStatus: () => ipcRenderer.invoke("server-status"),
});
