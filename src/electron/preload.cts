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
  onDownloadFinish: (callback: (fileName: string) => void) => {
    ipcRenderer.removeAllListeners("download-finished");
    ipcRenderer.on(
      "download-finished",
      (_: Electron.IpcRendererEvent, fileName: string) => {
        callback(fileName);
      }
    );
  },
  offDownloadFinish: () => {
    ipcRenderer.removeAllListeners("download-finished"); // Properly remove listeners
  },
});
