const {app, BrowserWindow} = require('electron')
const url = require("url");
const path = require("path");
const p2pChannel = require('./scripts/window-rtc.js').main;

let mainWindow, secondWindow;


// app.commandLine.appendSwitch('enable-transparent-visuals');
// app.commandLine.appendSwitch('disable-gpu');

function createSecondWindow() {
    secondWindow = new BrowserWindow({
        width: 1100,
        height: 800,
        show: false,
        frame: false,
        webPreferences: {
            nodeIntegration: true,
            enableRemoteModule: true,
            experimentalFeatures: true
        }
    })


    secondWindow.setMenuBarVisibility(false);

    secondWindow.loadURL(
        url.format({
            pathname: path.join(__dirname, `/www/index.html`),
            protocol: "file:",
            slashes: true,
            hash: '/stream-area'
        })
        // path.join(__dirname, `/www/index.html`)
    );

    // Open the DevTools.
    secondWindow.webContents.openDevTools({mode: 'undocked'})

    secondWindow.on('closed', function () {
        secondWindow = null
    });
}

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1100,
        height: 800,
        show: false,
        titleBarStyle: 'hiddenInset',
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
    mainWindow.webContents.openDevTools({mode: 'undocked'})

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
    if (mainWindow === null) {
        createWindow();
    }

    if (secondWindow === null) {
        createSecondWindow();
    }
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
        setTimeout(() => {
            // splash.destroy();
            mainWindow.show();
        }, 7000)
    });

    createSecondWindow();

    secondWindow.once('ready-to-show', () => {
        setTimeout(() => {
            // splash.destroy();

            p2pChannel.initChannel();
            // windowA and windowB are previously initiated BrowserWindows
            p2pChannel.addClient({window: mainWindow, name: 'mainWindow'});
            p2pChannel.addClient({window: secondWindow, name: 'secondWindow'});
            secondWindow.setFullScreen(true);
            secondWindow.show();
        }, 7000)
    });
});


const setupEvents = require('./installers/setupEvents')
if (setupEvents.handleSquirrelEvent()) {
    // squirrel event handled and app will exit in 1000ms, so don't do anything else
    return;
}
