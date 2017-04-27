'use strict'

/**
 * Dependencies
 */
const { ipcRenderer: ipc } = require('electron')
const Editor = require('./Editor')
const Output = require('./Output')
    /**
     * Layout container class
     *
     * Manages pages, tabs, settings
     */

class Layout {

    /**
     * Start application
     *
     * @param {Element} document The html document
     * @param {Object} settings Application settings coming from electron-config
     */

    constructor(input, settings) {
        this.settings = settings
        const theme = settings.get('theme')

        //this.container = container
        //this.container.innerHTML = defaultTab;
        this.container = document.getElementById("content-container");

        this.bottomWrapper = this.container.querySelector('.bottom-wrapper')
        this.leftPanel = this.container.querySelector('.panel-left')
        this.filterIcon = this.container.querySelector('.filter-icon')

        const editorEl = document.getElementById('json-input');
        const outputEl = document.getElementById('filter-output')
        const filterInput = this.container.querySelector('.filter-input')

        this.editor = new Editor(editorEl, filterInput)
        this.output = new Output(outputEl)
        if (input) {
            this.editor.setValue(input)
        }

        // Set page jQuery elements
        // this.bottomWrapper = $('.bottom-wrapper')
        this.editorWrapper = this.container.querySelector('.editor-wrapper')
            // this.leftPanel = this.container.querySelector('.panel-left')

        // Enable slider pane UI
        /* this.leftPanel.resizable({
             handleSelector: '.splitter',
             handles: 'e, w'
         })*/

        // Width percentage of the output panel
        this.outputWidthPercent = 50

        // Respond to valid input and key events
        this.handleEvents()

    }

    updateInput(input) {
        if (input) {
            this.editor.setValue(input)
        }
    }

    /**
     * Respond to events emitted from the editor
     */

    handleEvents() {

        // Show the bottom bar when valid input is detected

        this.editor.on('input-valid', () => {
            if (this.bottomWrapper.classList.contains('hidden')) {
                this.showBottomBar()
                this.editor.focusFilter()
            } else {

                // This enables live-updating the output as you edit the input
                this.editor.runFilter()
            }
        })

        // Show filter type on valid filter
        this.editor.on('filter-valid', (filter) => {
            //this.filterIcon.attr('src', `app/assets/images/${filter.type}.svg`)
            //  this.filterIcon.setAttribute("src", "./assets/imgs/`${filter.type}`.svg")
            this.output.show(filter.result)
            this.showRightPanel()
        })

        // Show generic filter icon when filter is invalid or empty
        this.editor.on('filter-invalid', () => {
            // this.filterIcon.attr('src', 'app/assets/images/no-filter.png')
            this.filterIcon.setAttribute("src", "./assets/imgs/no-filter.png")
        })

        // Hide right panel when filter is empty
        this.editor.on('filter-empty', () => {
            this.filterIcon.setAttribute("src", "./assets/imgs/no-filter.png");
            //this.filterIcon.attr('src', 'app/assets/images/no-filter.png')
            this.hideRightPanel()
        })

        // Update the panel width percent when it is dragged
        this.leftPanel.addEventListener('resize', () => {
            const containerWidth = Number(this.editorWrapper.css('width').replace('px', ''))
            const panelWidth = Number(this.leftPanel.css('width').replace('px', ''))
            this.outputWidthPercent = 100 * (panelWidth / containerWidth)
        })
    }

    /**
     * Show bottom bar with filter input
     */

    showBottomBar() {
        this.bottomWrapper.classList.remove('hidden')

        // Makes room for the bottom bar (fixes bug where you can't scroll to bottom)
        this.leftPanel.style.height = "calc(100% - 40px)"
    }

    /**
     * Show the right panel
     */

    showRightPanel() {
        this.leftPanel.style.width = `${this.outputWidthPercent}%`
    }

    /**
     * Show the left panel
     */

    hideRightPanel() {
        this.leftPanel.style.width = "100%"
    }

    /**
     * Sets the theme on both editors
     *
     * @param {String} theme
     */

    setTheme(theme) {
        this.settings.set('theme', theme)
        this.editor.setTheme(theme)
        this.output.setTheme(theme)
    }

    /**
     * Cleans up any outstanding listeners within itself and it's contained editor and output classes
     */

    destroy() {
        this.editor.destroy()
        this.output.destroy();
    }

}

/**
 * Export app
 */

module.exports = Layout