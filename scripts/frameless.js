const electron = require('electron');
document.onreadystatechange = () => {
    if (document.readyState === "complete" && process.platform === 'win32') {
        win = electron.remote.getCurrentWindow();
        handleWindowControls();
    }
};

let win;

function handleWindowControls() {
    document.getElementById('min-button').addEventListener("click", () => {
        win.minimize();
        toggleMaxRestoreButtons();
    });
    document.getElementById('max-button').addEventListener("click", () => {
        win.maximize();
        toggleMaxRestoreButtons();
    });
    document.getElementById('restore-button').addEventListener("click", () => {
        win.unmaximize();
        toggleMaxRestoreButtons();
    });
    document.getElementById('close-button').addEventListener("click", () => {
        win.close();
        toggleMaxRestoreButtons();
    });

    toggleMaxRestoreButtons();
    win.on('maximize', toggleMaxRestoreButtons);
    win.on('unmaximize', toggleMaxRestoreButtons);

    function toggleMaxRestoreButtons() {
        if (win.isMaximized() || win.isKiosk()) {
            document.body.classList.add('maximized');
        } else {
            document.body.classList.remove('maximized');
        }
    }
}
