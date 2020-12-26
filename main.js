const {app, TouchBar, nativeImage, ipcMain, BrowserWindow} = require('electron');
const url = require('url');
const path = require('path');
const p2pChannel = require('./scripts/window-rtc.js').main;

const TIMEOUT = 1000;
let mainWindow, secondWindow;

app.commandLine.appendSwitch('enable-transparent-visuals');

// app.commandLine.appendSwitch('enable-transparent-visuals');
// app.commandLine.appendSwitch('disable-gpu');

function createSecondWindow() {
    secondWindow = new BrowserWindow({
        width: 1100,
        height: 800,
        frame: false,
        title: 'ISEPStream',
        webPreferences: {
            nodeIntegration: true,
            enableRemoteModule: true,
            experimentalFeatures: true
        }
    });

    global.secondWindow = secondWindow;

    secondWindow.setMenuBarVisibility(false);

    secondWindow.loadURL(
        url.format({
            pathname: path.join(__dirname, `/www/index.html`),
            protocol: 'file:',
            slashes: true,
            hash: '/stream-area'
        })
        // path.join(__dirname, `/www/index.html`)
    );

    // Open the DevTools.
    // secondWindow.webContents.openDevTools({mode: 'undocked'})

    secondWindow.on('closed', function () {
        secondWindow = null
    });

    secondWindow.once('ready-to-show', () => {
        setTimeout(() => {
            // splash.destroy();
            p2pChannel.initChannel();
            // windowA and windowB are previously initiated BrowserWindows
            p2pChannel.addClient({window: mainWindow, name: 'mainWindow'});
            p2pChannel.addClient({window: secondWindow, name: 'secondWindow'});

            if (process.platform === 'win32') {
                secondWindow.maximize();
            } else {
                secondWindow.setFullScreen(true);
            }

            setTimeout(() => {
                mainWindow.show();
                mainWindow.focus();
            }, 1000);
        }, TIMEOUT);
    });
}

function createWindow() {
    if (process.platform === 'win32') {
        const config = {
            width: 1100,
            height: 800,
            frame: false,
            title: 'ISEPStream',
            webPreferences: {
                nodeIntegration: true,
                enableRemoteModule: true,
                experimentalFeatures: true,
                preload: path.join(__dirname, 'preload.js')
            }
        };

        const {BrowserWindow} = require('electron-acrylic-window');
        mainWindow = new BrowserWindow(config);
    } else {
        const config = {
            width: 1100,
            height: 800,
            show: true,
            frame: true,
            resizable: true,
            title: 'ISEPStream',
            vibrancy: 'fullscreen-ui',
            titleBarStyle: 'hiddenInset',
            webPreferences: {
                nodeIntegration: true,
                enableRemoteModule: true,
                experimentalFeatures: true,
                preload: path.join(__dirname, 'preload.js')
            }
        };

        mainWindow = new BrowserWindow(config);
    }

    mainWindow.setMenuBarVisibility(false);

    mainWindow.loadURL(
        url.format({
            pathname: path.join(__dirname, `/www/index.html`),
            protocol: 'file:',
            slashes: true
        })
        // path.join(__dirname, `/www/index.html`)
    );

    // Open the DevTools.
    // mainWindow.webContents.openDevTools({mode: 'undocked'})

    mainWindow.on('closed', function () {
        mainWindow = null;
        secondWindow.close();
    });

    global.mainWindow = mainWindow;

    mainWindow.once('ready-to-show', () => {
        if (process.platform === 'win32') {
            mainWindow.maximize();
        } else {
            mainWindow.setFullScreen(true);
        }
    });

    setUpTouchBar(mainWindow);

    ipcMain.on('changeTheme', (event, args) => {
        changeWindow(args);
    });
}

function setUpTouchBar(win) {
    const playIcon = nativeImage.createFromPath('./src/assets/native/play-circle.png').resize({height: 25});

    const button = new TouchBar.TouchBarButton({
        label: `GO LIVE`,
        accessibilityLabel: 'Counter',
        backgroundColor: '#a30000',
        icon: playIcon,
        iconPosition: 'left',
        click: () => {
            // update();
        }
    });

    const touchBar = new TouchBar({
        items: [button]
    });

    win.setTouchBar(touchBar);
}

// app.on('ready', createWindow)

app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') app.quit()
})

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

    setTimeout(
        createWindow,
        process.platform == 'linux' ? 1000 : 0
        // Electron has a bug on linux where it
        // won't initialize properly when using
        // transparency. To work around that, it
        // is necessary to delay the window
        // spawn function.
    );
    createSecondWindow();
});

const setupEvents = require('./installers/setupEvents')
if (setupEvents.handleSquirrelEvent()) {
    // squirrel event handled and app will exit in 1000ms, so don't do anything else
    return;
}

function changeWindow(isDark) {
    if (process.platform !== 'win32') {
        return;
    }
    const op = {
        theme: isDark ? 'dark' : 'light',
        effect: 'acrylic',
        maximumRefreshRate: 60,
        disableOnBlur: true
    };
    mainWindow.setVibrancy(op);
}
