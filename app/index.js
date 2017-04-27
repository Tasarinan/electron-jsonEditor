'use strict'

//load electron modules
const electron = require('electron');
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const dialog = electron.dialog;
const ipcMain = electron.ipcMain;
const Menu = electron.Menu;
const globalShortcut = electron.globalShortcut;
//const appMenu = require('./menu')
const enableContextMenu = require('electron-context-menu');

//load node native  modules
const fs = require('fs');
const path = require('path');
const url = require('url');
const mkdirp = require('mkdirp')

//constants

const WINDOW_HEIGHT = 600
const WINDOW_WIDTH = 1000

// Environment
const env = process.env.ENV || 'production'
    // Create tmp directory
mkdirp(path.resolve(__dirname, '../tmp'));

// If there are args, they are being passed from the command line, which means we
// must slice them again
const args = process.argv.slice(2);
//variable

var winList = [];
var screenWidth = null;
var screenHeight = null;



//create BrowserWindow

function createWindow() {
    let mainWindow = null;

    //create a instance of BrowserWindow
    mainWindow = new BrowserWindow({
        width: WINDOW_WIDTH,
        height: WINDOW_HEIGHT,
        frame: true,
        defaultFontSize: 16,
        x: winList.length * 20 % (screenWidth - 800),
        y: winList.length * 20 % (screenHeight - 600),
        icon: path.join(__dirname, '../assets/imgs/icon.png'),
        defaultMonospaceFontSize: 16,
        defaultEncoding: "utf-8",
    });


    // and load the index.html of the app.
    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'index.html'),
        protocol: 'file:',
        slashes: true
    }));

    // Enable context menu
    enableContextMenu()

    // Menu.setApplicationMenu(appMenu);

    mainWindow.on('closed', () => {
        mainWindow = null;
    });

    if (process.env.DEBUG) {
        mainWindow.toggleDevTools();
    }
    // Open the DevTools
    if (env === 'development') {
        mainWindow.webContents.openDevTools()
    }
    // Register shortcut listeners
    globalShortcut.register('CommandOrControl+Tab', () => {
        mainWindow.webContents.send('tab-change', 1);
    })
    globalShortcut.register('CommandOrControl+Shift+Tab', () => {
        mainWindow.webContents.send('tab-change', -1);
    })
    return mainWindow;
}

function getScreenSize() {
    screenWidth = electron.screen.getPrimaryDisplay().workAreaSize.width;
    screenHeight = electron.screen.getPrimaryDisplay().workAreaSize.height;
}

//show window when app is ready 

app.on('ready', () => {
    getScreenSize();
    if (!winList.length) {
        winList.push(createWindow())
    };
})

// Exit application when all window is closed.
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
})

//getDefaultPath

function getDefaultPath(currentFile) {
    let defaultPath = "";
    if (!currentFile || currentFile == "") {
        defaultPath = app.getPath('documents');
    } else {
        defaultPath = path.dirname(currentFile);
    };
    return defaultPath;
}

ipcMain.on('new-window', () => {
    winList.push(createWindow());
});

ipcMain.on('open-file-dialog', (event, currentFile, isNewWindow) => {
    let defaultPath = getDefaultPath(currentFile);
    let options = {
        title: 'Open File',
        properties: ['openFile'],
        defaultPath: defaultPath,
        filters: [{
            name: 'Json',
            extensions: ['json']
        }, { name: 'All Files', extensions: ['*'] }],
    };
    const filenames = dialog.showOpenDialog(options);
    if (!filenames) return;
    const filename = filenames[0];
    if (!isNewWindow) {
        event.sender.send('open-file', filename);
    } else {
        let newWindow = createWindow();
        winList.push(newWindow);
        newWindow.webContents.on('dom-ready', () => {
            newWindow.webContents.send('open-file', filename);
        });
    };
});

ipcMain.on('save-new-file', (event) => {
    let defaultPath = getDefaultPath();
    let options = {
        title: 'Save Json file',
        properties: ['openFile'],
        defaultPath: defaultPath,
        filters: [{
            name: 'Json',
            extensions: ['json']
        }]
    };
    const filenames = dialog.showSaveDialog(options);
    if (!filenames) return;
    event.sender.send('save-file', filenames[0]);

});