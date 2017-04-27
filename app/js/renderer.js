const electron = require('electron')

const ipc = electron.ipcRenderer;
const remote = electron.remote;
const shell = electron.shell;

const fs = require('fs');

const { docStatus } = require('./js/doc-status');

var nodeVersion = process.versions.node;
var chromeVersion = process.versions.chrome;
var electronVersion = process.versions.electron;
//var jsonEditorOptions = {};
var jsonEditorOptions = {
    mode: 'code',
    onError: function(err) {
        alert(err.toString());
    },
    onModeChange: function(newMode, oldMode) {
        console.log('Mode switched from', oldMode, 'to', newMode);
    },
    onChange: function(){
        if (jsonEditor) {
        // if you comment out the next line of code, the problem is solved
        // editor.get() throws an exception when the editor does not
        // contain valid JSON.
        jsonViewer.set(jsonEditor.get());
      }
    }
};

var jsonViewerOptions = {
    mode: 'view',
    onError: function(err) {
        alert(err.toString());
    }
};


var jsonEditor = new JSONEditor(document.getElementById("editorPane"), jsonEditorOptions, {});
var jsonViewer = new JSONEditor(document.getElementById("viewerPane"), jsonViewerOptions, {});

document.ondragover = document.ondrop = (event) => {
    event.preventDefault();
    return false;
}


ipc.on('new-window',(event)=>{
  ipc.send('new-window');
  docStatus.filename = "";
  docStatus.modified = false;
});

ipc.on('open-file-dialog', (event) => {
    let isNewWindow = false;
    if (docStatus.filename != "") {
        isNewWindow = true;
    } else if (docStatus.modified === true) {
        isNewWindow = true;
    }
    ipc.send('open-file-dialog', docStatus.filename, isNewWindow);

});

ipc.on('save-file-dialog',(event)=>{
 if (docStatus.filename == "") {
        ipc.send('save-new-file');
    } else {
        saveFile(docStatus.filename);
    }
});


ipc.on('saveAs-file-dialog',(event)=>{
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
        jsonEditor.set(parsedJson);
        jsonViewer.set(parsedJson);
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