const { app, BrowserWindow } = require("electron");
const url = require("url");
const path = require("path");

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 720,
    show: false,
    fullscreenable: false,
    webPreferences: {
      nodeIntegration: true,
      enableRemoteModule: true,
      experimentalFeatures: true,
    },
  });

  mainWindow.setMenuBarVisibility(false);

  mainWindow.loadURL(
    url.format({
      pathname: path.join(__dirname, `../www/index.html`),
      protocol: "file:",
      slashes: true,
    })
  );

  mainWindow.webContents.openDevTools()

  mainWindow.on("closed", function () {
    mainWindow = null;
  });
}

app.on("window-all-closed", function () {
  if (process.platform !== "darwin") app.quit();
});

app.on("activate", function () {
  if (mainWindow === null) createWindow();
});

let splash;

app.on("ready", () => {
  createWindow();
  mainWindow.once("ready-to-show", () => {
    setTimeout(() => {
      mainWindow.show();
    }, 7000);
  });
});

const setupEvents = require("../installers/setupEvents");
if (setupEvents.handleSquirrelEvent()) {
  return;
}
