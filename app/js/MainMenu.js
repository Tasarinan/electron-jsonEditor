'use strict'

/**
 * Dependencies
 */

const fs = require('fs')

const path = require('path')

const { remote } = require('electron')

const { Menu, BrowserWindow, dialog, shell, app } = remote

class MainMenu {

    /**
     * Create the main menu for the given app
     */

    constructor(layout, settings) {
            this.layout = layout
            this.settings = settings
            this.updateMenu()
        }
        /**
         *  Callback for when theme button is clicked.
         */

    themeClicked(menuItem) {
        this.settings.set('theme', menuItem.theme)
        this.layout.setTheme(menuItem.theme)
    }

    createTemplate() {

        const template = [{
                label: 'File',
                submenu: [{
                        label: 'Open File...',
                        accelerator: 'CmdOrCtrl+O',
                        click(item, focusedWindow) {
                            focusedWindow.webContents.send('open-file-dialog');
                        }
                    },
                    {
                        label: 'Open Recent',
                        accelerator: 'CommandOrControl+r',
                        submenu: this.createRecentSubMenu(this.updated),
                    },
                    {
                        label: 'Save File...',
                        accelerator: 'CmdOrCtrl+S',
                        click(item, focusedWindow) {
                            // We can't call saveFile(content) directly because we need to get
                            // the content from the renderer process. So, send a message to the
                            // renderer, telling it we want to save the file.
                            focusedWindow.webContents.send('save-file-dialog')
                        }
                    },
                    {
                        label: 'SaveAs File...',
                        accelerator: 'CmdOrCtrl+S',
                        click(item, focusedWindow) {
                            // We can't call saveFile(content) directly because we need to get
                            // the content from the renderer process. So, send a message to the
                            // renderer, telling it we want to save the file.
                            focusedWindow.webContents.send('saveAs-file-dialog')
                        }
                    }
                ]
            },
            {
                label: 'Edit',
                submenu: [{
                        label: 'Undo',
                        accelerator: 'CmdOrCtrl+Z',
                        role: 'undo'
                    },
                    {
                        label: 'Redo',
                        accelerator: 'Shift+CmdOrCtrl+Z',
                        role: 'redo'
                    },
                    {
                        type: 'separator'
                    },
                    {
                        label: 'Cut',
                        accelerator: 'CmdOrCtrl+X',
                        role: 'cut'
                    },
                    {
                        label: 'Copy',
                        accelerator: 'CmdOrCtrl+C',
                        role: 'copy'
                    },
                    {
                        label: 'Paste',
                        accelerator: 'CmdOrCtrl+V',
                        role: 'paste'
                    },
                    {
                        role: 'pasteandmatchstyle'
                    },
                    {
                        role: 'delete'
                    },
                    {
                        label: 'Select All',
                        accelerator: 'CmdOrCtrl+A',
                        role: 'selectall'
                    }
                ]
            },
            {
                label: 'Developer',
                submenu: [{
                        label: 'Reload',
                        accelerator: 'CmdOrCtrl+R',
                        click(item, focusedWindow) {
                            if (focusedWindow) focusedWindow.reload()
                        }
                    },
                    {
                        label: 'Toggle Developer Tools',
                        accelerator: process.platform === 'darwin' ?
                            'Alt+Command+I' : 'Ctrl+Shift+I',
                        click(item, focusedWindow) { if (focusedWindow) focusedWindow.webContents.toggleDevTools() }
                    }, {
                        label: 'Theme',
                        submenu: this.createThemeSubMenu()
                    }, {
                        role: 'togglefullscreen'
                    }
                ]
            },
            {
                role: 'window',
                submenu: [{
                        label: 'NewWindow...',
                        accelerator: 'CmdOrCtrl+W',
                        click(item, focusedWindow) {
                            if (focusedWindow) focusedWindow.webContents.send('new-window');
                        }
                    },
                    {
                        role: 'minimize'
                    },
                    {
                        role: 'close'
                    }
                ]
            },
            {
                role: 'help',
                submenu: [{
                    label: 'Learn More',
                    click() {
                        shell.openExternal('http://electron.atom.io')
                    }
                }]
            }

        ]

        if (process.platform === 'darwin') {
            const name = app.getName()
            template.unshift({
                label: name,
                submenu: [{
                        label: 'About ' + name,
                        role: 'about'
                    },
                    {
                        type: 'separator'
                    },
                    {
                        label: 'Services',
                        role: 'services',
                        submenu: []
                    },
                    {
                        type: 'separator'
                    },
                    {
                        label: 'Hide ' + name,
                        accelerator: 'Command+H',
                        role: 'hide'
                    },
                    {
                        label: 'Hide Others',
                        accelerator: 'Command+Alt+H',
                        role: 'hideothers'
                    },
                    {
                        label: 'Show All',
                        role: 'unhide'
                    },
                    {
                        type: 'separator'
                    },
                    {
                        label: 'Quit',
                        accelerator: 'Command+Q',
                        click() { app.quit() }
                    }
                ]
            })
        }
        return template
    }

    createRecentSubMenu(updated) {
        // give properties    
        const recentFiles = this.settings.get('recent')
        let files = [];
        recentFiles.forEach((filename) => {
            let mi = {}
            mi.label = filename
            mi.click = (menuItem) => {
                window.layout = this.layout
                this.layout.tabs.newTab(fs.readFileSync(filename, 'utf8'), 0, path.basename(filename), filename);
            }
            files.push(mi)
        })

        if (files.length > 0) {
            files.push({
                type: 'separator'
            })

            files.push({
                label: "Clear items",
                click: () => {
                    this.settings.set('recent', [])
                    this.updateMenu()
                }
            })
        }

        return files
    }

    /**
     * Create the theme sub menu. (Later versions can create this programmatically)
     */

    createThemeSubMenu() {
        const themes = [{
            label: 'Default',
            theme: 'default'
        }, {
            label: 'Elegant',
            theme: 'elegant'
        }, {
            label: 'Mdn-Like',
            theme: 'mdn-like'
        }, {
            label: 'Neat',
            theme: 'neat'
        }, {
            label: 'Neo',
            theme: 'neo'
        }, {
            label: 'Seti',
            theme: 'seti'
        }, {
            label: 'Zenburn',
            theme: 'zenburn'
        }]

        // give properties
        const selectedTheme = this.settings.get('theme')
        themes.forEach((i) => {
            const t = i
            t.type = 'radio'
            t.checked = (selectedTheme === t.theme)
            t.click = (menuItem) => {
                this.themeClicked(menuItem)
            }
        })
        return themes
    }


    updateMenu() {
        const template = this.createTemplate()

        // build menu
        Menu.setApplicationMenu(Menu.buildFromTemplate(template))
    }


}


/**
 * Export MainMenu
 */

module.exports = MainMenu