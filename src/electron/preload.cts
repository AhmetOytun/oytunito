const { contextBridge, ipcRenderer } = require("electron");

interface Device {
  name: string;
  host: string;
  port: number;
  addresses: string[];
  event?: "up" | "down"; // opsiyonel event eklendi istersen
}

interface DeviceDiscoveryAPI {
  start: () => void;
  stop: () => void;
  onDeviceFound: (callback: (device: Device) => void) => () => void;
  startBroadcast: () => Promise<void>;
  stopBroadcast: () => Promise<void>;
}

interface FileTransferAPI {
  startFileReceiver: () => Promise<void>;
  stopFileReceiver: () => Promise<void>;
  sendFile: (args: {
    ip: string;
    port: number;
    filePath: string;
  }) => Promise<void>;
}

contextBridge.exposeInMainWorld("deviceDiscovery", {
  start: (): void => ipcRenderer.send("start-discovery"),
  stop: (): void => ipcRenderer.send("stop-discovery"),
  onDeviceFound: (callback: (device: Device) => void) => {
    const listener = (_: any, device: Device) => callback(device);
    ipcRenderer.on("device-found", listener);
    return () => ipcRenderer.removeListener("device-found", listener);
  },
  startBroadcast: () => ipcRenderer.invoke("start-broadcast"),
  stopBroadcast: () => ipcRenderer.invoke("stop-broadcast"),
} as DeviceDiscoveryAPI);

contextBridge.exposeInMainWorld("fileTransfer", {
  startFileReceiver: () => ipcRenderer.invoke("start-file-receiver"),
  stopFileReceiver: () => ipcRenderer.invoke("stop-file-receiver"),
  sendFile: (args: { ip: string; port: number; filePath: string }) =>
    ipcRenderer.invoke("send-file", args),
} as FileTransferAPI);

contextBridge.exposeInMainWorld("electronApi", {
  openFileDialog: () => ipcRenderer.invoke("dialog:openFile"),
});
