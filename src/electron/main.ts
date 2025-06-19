import { app, BrowserWindow, dialog, ipcMain } from "electron";
import path from "path";
import os from "os";
import { isDev } from "./util.js";
import { getPreloadPath } from "./pathresolver.js";
import { Bonjour } from "bonjour-service";
import net from "net";
import startFileReceiver from "./TCPServer.js";
import sendFile from "./TCPClient.js";

const bonjour = new Bonjour();

let browser: ReturnType<typeof bonjour.find> | null = null;
let publishedService: ReturnType<typeof bonjour.publish> | null = null;
let fileReceiverServer: net.Server | null = null;

export let mainWindow: BrowserWindow | null = null;

app.on("ready", () => {
  mainWindow = new BrowserWindow({
    width: 600,
    height: 450,
    resizable: false,
    webPreferences: {
      preload: getPreloadPath(),
    },
    autoHideMenuBar: true,
    backgroundColor: "#1d293d",
    show: false,
  });

  if (isDev()) {
    mainWindow.loadURL("http://localhost:5123");
  } else {
    mainWindow.loadFile(path.join(app.getAppPath(), "/dist-react/index.html"));
  }

  mainWindow.once("ready-to-show", () => {
    mainWindow!.show();
  });
});

app.on("before-quit", () => {
  console.log("App quitting: stopping Bonjour services...");

  if (publishedService && typeof publishedService.stop === "function") {
    publishedService.stop();
    publishedService = null;
  }

  if (browser) {
    browser.stop();
    browser = null;
  }

  if (fileReceiverServer) {
    fileReceiverServer.close();
    fileReceiverServer = null;
  }
});

ipcMain.on("start-discovery", () => {
  if (browser) return;

  browser = bonjour.find({ type: "oytunito" });

  browser.on("up", (service) => {
    mainWindow?.webContents.send("device-found", {
      event: "up",
      name: service.name,
      host: service.host,
      port: service.port,
      addresses: service.addresses,
    });
  });

  browser.on("down", (service) => {
    mainWindow?.webContents.send("device-found", {
      event: "down",
      name: service.name,
      host: service.host,
      port: service.port,
      addresses: service.addresses,
    });
  });

  browser.start();
});

ipcMain.handle("start-broadcast", () => {
  if (publishedService) return;
  publishedService = bonjour.publish({
    port: 3132,
    name: `${os.hostname()}`,
    type: "oytunito",
  });
  if (typeof publishedService?.start === "function") {
    publishedService.start();
  }
});

ipcMain.on("stop-discovery", () => {
  browser?.stop();
  browser = null;
});

ipcMain.handle("stop-broadcast", () => {
  if (typeof publishedService?.stop === "function") {
    publishedService.stop();
  }
  publishedService = null;
});

ipcMain.handle("start-file-receiver", (event) => {
  if (!fileReceiverServer) {
    fileReceiverServer = startFileReceiver(event.sender);
  }
  return true;
});

ipcMain.handle("stop-file-receiver", () => {
  if (fileReceiverServer) {
    fileReceiverServer.close();
    fileReceiverServer = null;
  }
});

ipcMain.handle("send-file", (event, { ip, port, filePath }) => {
  return sendFile(ip, port, filePath, (progress) => {
    event.sender.send("send-file-progress", progress);
  });
});

ipcMain.handle("dialog:openFile", async () => {
  const { canceled, filePaths } = await dialog.showOpenDialog({
    properties: ["openFile"],
  });
  if (canceled) {
    return null;
  } else {
    return filePaths[0];
  }
});

ipcMain.handle("dialog:showMessage", async (_event, { title, message }) => {
  await dialog.showMessageBox({
    type: "info",
    title,
    message,
  });
});
