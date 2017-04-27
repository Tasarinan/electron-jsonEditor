'use strict'


const electron = require('electron')

const ipc = electron.ipcRenderer;
const remote = electron.remote;
const shell = electron.shell;


const { docStatus } = require('./doc-status');
const welcomeMessage = require('./welcome-message.js')
const Settings = require('./Settings')
const MainMenu = require('./MainMenu')
const path = require('path')
const Layout = require('./Layout')
const fs = require('fs')


let cursorPos = 10
let input = welcomeMessage

const settings = new Settings()
const layout = new Layout(JSON.parse(input), settings)
const menu = new MainMenu(Layout, settings)

//layout.tabs.newTab(input, cursorPos)

var nodeVersion = process.versions.node;
var chromeVersion = process.versions.chrome;
var electronVersion = process.versions.electron;



document.ondragover = document.ondrop = (event) => {
    event.preventDefault();
    return false;
}


ipc.on('new-window', (event) => {
    ipc.send('new-window');
    docStatus.filename = "";
    docStatus.modified = false;
});

ipc.on('open-file-dialog', (event) => {
    let isNewWindow = false;
    if (docStatus.modified === true)
        isNewWindow = true;
    ipc.send('open-file-dialog', docStatus.filename, isNewWindow);

});

ipc.on('save-file-dialog', (event) => {
    if (docStatus.filename == "") {
        ipc.send('save-new-file');
    } else {
        saveFile(docStatus.filename);
    }
});


ipc.on('saveAs-file-dialog', (event) => {
    ipc.send('save-new-file');
});

ipc.on('open-file', (event, filename) => {
    readFile(filename);
});

ipc.on('save-file', (event, filename) => {
    saveFile(filename);

})

function readFile(filename) {
    fs.readFile(filename, 'utf-8', function(err, data) {
        let parsedJson = null;
        if (err) {
            return;
        }
        parsedJson = JSON.parse(data);
        layout.updateInput(parsedJson);
        docStatus.filename = filename;
        docStatus.modified = false;
    });
}

function saveFile(filename) {
    let parsedJson = null;
    parsedJson = jsonEditor.get();
    let data = null;
    data = JSON.stringify(parsedJson, null, 2);
    fs.writeFile(filename, data, {
        function(err) {
            if (err) {
                alert("An error occurred ");
            }
        }
    });
    docStatus.filename = filename;
    docStatus.modified = false;
}