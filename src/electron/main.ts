import { app, BrowserWindow, ipcMain } from "electron";
import path from "path";
import { isDev } from "./util.js";
import { getPreloadPath } from "./pathResolver.js";
import express from "express";

let expressApp = express();

let isServerRunning = false;
let server: import("http").Server | null = null;
let mainWindow = null;

app.on("ready", () => {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    resizable: false,
    webPreferences: {
      preload: getPreloadPath(),
    },
  });
  if (isDev()) {
    mainWindow.loadURL("http://localhost:5123");
  } else {
    mainWindow.loadFile(path.join(app.getAppPath(), "/dist-react/index.html"));
  }
});

ipcMain.on("server-toggle", () => {
  if (isServerRunning) {
    server?.close();
    isServerRunning = false;
  } else {
    server = expressApp.listen(3131, () => {
      isServerRunning = true;
    });
  }
});

ipcMain.handle("server-status", () => {
  return isServerRunning;
});
