// All of the Node.js APIs are available in the preload process.
// It has the same sandbox as a Chrome extension.
const path = require('path');
const url = require('url');

// import browserEnv from 'browser-env';
// browserEnv(['navigator']);

// const customTitlebar = require('..'); // Delete this line and uncomment top line

window.addEventListener('DOMContentLoaded', () => {

    if (process.platform !== "win32") {
        return;
    }

    const customTitlebar = require('custom-electron-titlebar');
    if (window.matchMedia('(prefers-color-scheme:dark)').matches) {
        new customTitlebar.Titlebar({
            backgroundColor: customTitlebar.Color.fromHex('#2b2b2b'),
        });
    } else {
        new customTitlebar.Titlebar({
            backgroundColor: customTitlebar.Color.fromHex('#ffffff'),
        });
    }


    const replaceText = (selector, text) => {
        const element = document.getElementById(selector)
        if (element) element.innerText = text
    }

    for (const type of ['chrome', 'node', 'electron']) {
        replaceText(`${type}-version`, process.versions[type])
    }
})
