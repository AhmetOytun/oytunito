import { app, BrowserWindow, ipcMain } from "electron";
import path from "path";
import { isDev } from "./util.js";
import { getPreloadPath } from "./pathresolver.js";
import express from "express";
import bonjour from "bonjour";

let bonjourService = bonjour();
let expressApp = express();

let isServerRunning = false;
let server: import("http").Server | null = null;
let mainWindow = null;

const expressPort = 3131;
let devices: Device[] = [];

app.on("ready", () => {
  mainWindow = new BrowserWindow({
    width: 600,
    height: 450,
    resizable: false,
    webPreferences: {
      preload: getPreloadPath(),
    },
  });

  bonjourService.publish({
    name: "oytunito",
    type: "filetransfer",
    port: 3132,
  });

  if (isDev()) {
    mainWindow.loadURL("http://localhost:5123");
  } else {
    mainWindow.loadFile(path.join(app.getAppPath(), "/dist-react/index.html"));
  }
});

ipcMain.on("server-start", () => {
  if (!isServerRunning) {
    server = expressApp.listen(expressPort, () => {
      isServerRunning = true;
    });
  }
});

ipcMain.on("server-stop", () => {
  if (isServerRunning) {
    server?.close();
    isServerRunning = false;
  }
});

ipcMain.handle("server-status", () => {
  return isServerRunning;
});

ipcMain.handle("get-devices", async () => {
  devices = [];

  await new Promise<void>((resolve) => {
    const browser = bonjourService.find({ type: "filetransfer" });

    browser.on("up", (service) => {
      console.log("Discovered device:", service);
      devices.push({
        name: service.name || service.host,
        address: service.referer.address,
        bonjourPort: service.port,
        expressPort: expressPort,
      });
    });

    setTimeout(() => {
      browser.stop();
      resolve();
    }, 2000);
  });

  return devices;
});
