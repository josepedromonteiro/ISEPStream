import { app, BrowserWindow } from "electron";

createWindow = () => {
  let win = new BrowserWindow({ width: 800, height: 600 });

  win.loadURL("http://localhost:4200");
};

app.on("ready", createWindow);
