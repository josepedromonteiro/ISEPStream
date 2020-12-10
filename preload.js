// All of the Node.js APIs are available in the preload process.
// It has the same sandbox as a Chrome extension.
const path = require('path');
const url = require('url');
const customTitlebar = require('custom-electron-titlebar');
let bt = null;

// import browserEnv from 'browser-env';
// browserEnv(['navigator']);

// const customTitlebar = require('..'); // Delete this line and uncomment top line

window.addEventListener('DOMContentLoaded', () => {

    if (process.platform !== "win32") {
        return;
    }

    bt = new customTitlebar.Titlebar({
        backgroundColor: window.matchMedia('(prefers-color-scheme:dark)').matches ? customTitlebar.Color.fromHex('#2b2b2b') : customTitlebar.Color.fromHex('#ffffff'),
    });

    bt.updateMenu(new Electron.Menu());


    const replaceText = (selector, text) => {
        const element = document.getElementById(selector)
        if (element) element.innerText = text
    }

    for (const type of ['chrome', 'node', 'electron']) {
        replaceText(`${type}-version`, process.versions[type])
    }
});


window.matchMedia('(prefers-color-scheme: dark)')
    .addEventListener('change', event => {
        // alert('Change bitch');
        bt.updateBackground(event.matches ? customTitlebar.Color.fromHex('#2b2b2b') : customTitlebar.Color.fromHex('#ffffff'));
        console.log(bt);
    });
