const {app, BrowserWindow} = require('electron')
const url = require("url");
const path = require("path");

let mainWindow;


// app.commandLine.appendSwitch('enable-transparent-visuals');
// app.commandLine.appendSwitch('disable-gpu');


function createWindow () {
  mainWindow = new BrowserWindow({
    width: 1100,
    height: 800,
    // transparent: true,
    // frame: false,
    show: false,
    fullscreenable: false,
    webPreferences: {
      nodeIntegration: true,
      enableRemoteModule: true,
      experimentalFeatures: true
    }
  })


  mainWindow.setMenuBarVisibility(false);

  mainWindow.loadURL(
      url.format({
        pathname: path.join(__dirname, `/www/index.html`),
        protocol: "file:",
        slashes: true
      })
      // path.join(__dirname, `/www/index.html`)
  );

  // Open the DevTools.
  mainWindow.webContents.openDevTools({mode:'undocked'})

  mainWindow.on('closed', function () {
    mainWindow = null
  })
}

// app.on('ready', createWindow)

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})
//
app.on('activate', function () {
  if (mainWindow === null) createWindow()
})

let splash;

app.on('ready', () => {

  // splash = new BrowserWindow({width: 810, height: 610, transparent: true, frame: false, alwaysOnTop: true});
  // splash.loadURL(
  //     url.format({
  //       pathname: path.join(__dirname, `splashscreen.html`),
  //       protocol: "file:",
  //       slashes: true
  //     }),);



  createWindow();
  mainWindow.once('ready-to-show', () => {


    setTimeout(()=>{
      splash.destroy();
      mainWindow.show();
    }, 7000)
  });
});


const setupEvents = require('./installers/setupEvents')
if (setupEvents.handleSquirrelEvent()) {
  // squirrel event handled and app will exit in 1000ms, so don't do anything else
  return;
}
