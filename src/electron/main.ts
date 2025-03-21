import { app, BrowserWindow, ipcMain } from "electron";
import path from "path";
import { isDev } from "./util.js";
import { getPreloadPath } from "./pathresolver.js";
import express from "express";
import Bonjour from "bonjour";
import os from "os";
import router, { progress, isDownloading } from "./router.js";
import cors from "cors";

let bonjourService: Bonjour.Bonjour | null = null;
const expressApp = express();

expressApp.use(cors());
expressApp.use(express.json());
expressApp.use(router);

let isServerRunning = false;
let server: import("http").Server | null = null;
export let mainWindow: BrowserWindow | null = null;

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

ipcMain.on("start-publishing", () => {
  if (!bonjourService) {
    bonjourService = Bonjour();
  }

  bonjourService.unpublishAll(() => {
    bonjourService!.publish({
      name: os.hostname(),
      type: "filetransfer",
      port: 3132,
    });
  });
});

ipcMain.on("stop-publishing", () => {
  if (bonjourService) {
    bonjourService.unpublishAll(() => {
      bonjourService?.destroy();
      bonjourService = null;
    });
  }
});

ipcMain.handle("download-progress", () => {
  if (isDownloading) {
    return progress;
  }
  return null;
});

ipcMain.handle("get-devices", async () => {
  devices = [];

  await new Promise<void>((resolve) => {
    if (!bonjourService) {
      bonjourService = Bonjour();
    }

    const browser = bonjourService.find({ type: "filetransfer" });

    browser.on("up", (service) => {
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
