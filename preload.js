const customTitlebar = require('custom-electron-titlebar');
let bt = null;

window.addEventListener('DOMContentLoaded', () => {
    if (process.platform !== 'win32') {
        return
    }

    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (event) => {
        bt.updateBackground(event.matches ? customTitlebar.Color.fromHex('#2b2b2b') : customTitlebar.Color.fromHex('#ffffff'))
    });

    bt.updateMenu(null);

    const replaceText = (selector, text) => {
        const element = document.getElementById(selector)
        if (element) element.innerText = text
    }

    for (const type of ['chrome', 'node', 'electron']) {
        replaceText(`${type}-version`, process.versions[type])
    }
});
