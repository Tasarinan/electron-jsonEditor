/**
 * Controls the output pane
 */

'use strict'

// Default CodeMirror options for output editor
const defaultEditorOptions = {
    mode: 'code',
    onError: function(err) {
        alert(err.toString());
    }
};

/**
 * Read-only CodeMirror editor wrapper
 */

class Output {

    /**
     * @param {Element} el The element to use for the CodeMirror object
     */

    constructor(el) {
        this.output = new JSONEditor(el, defaultEditorOptions, {});
        el.querySelector(".jsoneditor-menu").style.display = "none";
    }

    /**
     * Formats and displays output
     *
     * @param {Object} data The data object to format and display
     */

    show(data) {
        let output = null
        if (typeof data === 'string') {
            output = JSON.parse(data)
        } else {
            output = data;
        }
        this.output.set(output)
    }

    /**
     * Sets the theme dynamically
     *
     * @param {String} theme
     */

    setTheme(theme) {
        this.output.setOption('theme', theme)
    }

}

/**
 * Exports
 */

module.exports = Output