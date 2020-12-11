const createWindowsInstaller = require('electron-winstaller').createWindowsInstaller
const path = require('path')

getInstallerConfig()
    .then(createWindowsInstaller)
    .catch((error) => {
        console.error(error.message || error)
        process.exit(1)
    })

function getInstallerConfig () {
    console.log('creating windows installer')
    const rootPath = path.join('./')
    const outPath = path.join(rootPath, 'release-builds');
    return Promise.resolve({
        appDirectory: path.join(outPath, 'Fundo Domotica app-win32-ia32/'),
        authors: 'ISEP',
        noMsi: true,
        outputDirectory: path.join(outPath, 'windows-installer'),
        exe: 'Fundo Domotica app.exe',
        setupExe: 'FundoDomoticaAppInstaller.exe',
        setupIcon: path.join(rootPath, 'src/assets/native/icon.ico')
    })
}
