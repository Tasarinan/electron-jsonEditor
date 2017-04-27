/**
 * The Tab class wraps the logic for the page DOM. It creates the input and
 * output editors, and responds to their events.
 */

'use strict'

/**
 * Dependencies
 */

const defaultTab = require('./system/default-tab')
const Editor = require('./Editor')
const Output = require('./Output')

/**
 * Creates input and output editors, sets the horizontal slider, and
 * registers DOM events
 */

class Tab {

    /**
     * Initiate a tab
     *
     * @param {Element} container
     */

    constructor(container, tabId, tabName, filename) {
        this.tabId = tabId;
        this.filename = filename;
        this.tabName = tabName || "&nbsp;";
        //this.container = container
        //this.container.innerHTML = defaultTab;
        this.container = document.getElementById("editorContainer");

        this.bottomWrapper = this.container.querySelector('.bottom-wrapper')
        this.leftPanel = this.container.querySelector('.panel-left')
        this.filterIcon = this.container.querySelector('.filter-icon')

        const editorEl = document.getElementById('json-input');
        const outputEl = document.getElementById('filter-output')
        const filterInput = this.container.querySelector('.filter-input')

        this.editor = new Editor(editorEl, filterInput)
        this.output = new Output(outputEl)

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

    get tabId() {
        return this.tabId;
    }

    /**
     * Creates tab html
     *
     */

    //static generateTabHeaderTemplate(tabId, tabName, filename) {
    generateTabHeader() {
        let tabMarkup = (this.filename === undefined) ?
            `<a href="#tab-${this.tabId}">${ this.tabId + " [no name]"}</a>` :
            `<a href="#tab-${this.tabId}" title="${this.filename}">${ this.tabName }</a>`
        return `
      <li data-tab="${this.tabId}">
        ${ tabMarkup }
        <span class="ui-icon ui-icon-close" role="presentation">Remove Tab</span>
      </li>
    `
    }

    /**
     * Generate tab content html
     *
     * @param {Integer} tabId
     */

    static generateTabContentTemplate(tabId) {
        return `<div id="tab-${tabId}" class="tab-content"></div>`
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
            this.filterIcon.setAttribute("src", "../asserts/imgs/${filter.type}.svg")
            this.output.show(filter.result)
            this.showRightPanel()
        })

        // Show generic filter icon when filter is invalid or empty
        this.editor.on('filter-invalid', () => {
            // this.filterIcon.attr('src', 'app/assets/images/no-filter.png')
            this.filterIcon.setAttribute("src", "../asserts/imgs/no-filter.png")
        })

        // Hide right panel when filter is empty
        this.editor.on('filter-empty', () => {
            this.filterIcon.setAttribute("src", "../asserts/imgs/no-filter.png");
            //this.filterIcon.attr('src', 'app/assets/images/no-filter.png')
            this.hideRightPanel()
        })

        // Update the panel width percent when it is dragged
        this.leftPanel.on('resize', () => {
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
        this.leftPanel.style.width = "`${this.outputWidthPercent}%`"
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
 * Exports
 */

module.exports = Tab