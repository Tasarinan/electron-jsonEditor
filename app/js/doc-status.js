const remote = require('electron').remote;
const dialog = remote.dialog;
const fs = require('fs');
const path = require('path');

var docStatus = {
    filename: "",
    modified: false
};
module.exports.docStatus = docStatus;