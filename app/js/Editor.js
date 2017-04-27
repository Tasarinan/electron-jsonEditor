/**
 * Json editor wrapper class
 */

'use strict'

/**
 * Dependencies
 */

const { EventEmitter } = require('events')
const path = require('path')
const jq = require('node-jq')
const vm = require('vm')
const fs = require('fs')

/**
 * Editor options
 */

const defaultEditorOptions = {
    mode: 'tree',
    modes: ['code', 'tree'], // allowed modes
    onError: function(err) {
        alert(err.toString());
    },
    onChange: function() {

    },
    onModeChange: function(newMode, oldMode) {
        console.log('Mode switched from', oldMode, 'to', newMode);
    }
};

/**
 * Wrapper class for json editor
 */

class Editor extends EventEmitter {

    /**
     * Creates the input editor, sets a welcome message, and registers DOM events
     *
     * @param {Element} el The textarea element to use for CodeMirror instance
     * @param {jQuery} filter The filter input element
     */

    constructor(el, filter) {
        super()
        this.editor = new JSONEditor(el, defaultEditorOptions, {});
        this.filterEl = filter
            // Path to store data file so it can be read for jq (required for large input)
            // NOTE: the absolute path is too long to be parsed by jq in Windows
        if (process.platform === 'win32') {
            this.tmp = path.join('tmp', 'data.json')
        } else {
            this.tmp = path.resolve(__dirname, 'tmp', 'data.json')
        }
        // Handle functions that respond to input

        this.filterEl.addEventListener("keyup", () => {
            this.runFilter()
        })
    }


    /**
     * Set the theme dynamically
     * TODO
     * @param {String} theme The theme to set
     */

    setTheme(theme) {
        this.editor.setOption('theme', theme)
    }

    /**
     * Set the editor value dynamically
     *
     * @param {String} value The value to set
     */

    setValue(value) {
        this.editor.set(value)
        this.data = this.editor.get();
        this.emit('input-valid')
    }


    /**
     * Focus cursor in the filter input
     */

    focusFilter() {
        this.filterEl.focus()
    }

    /**
     * Parse raw input as JavaScript first, then JQ
     */

    runFilter() {

        // Set filter here so this function can be called externally
        const filter = this.filterEl.value

        // Ignore empty filters
        if (!filter || !filter.length) {
            this.emit('filter-empty')
            return
        }

        // Use the JavaScript vm to evaluate the filter with this context
        const script = `result = x${filter}`
        const context = {
            x: this.data,
            result: null
        }

        try {
            new vm.Script(script).runInNewContext(context)
            if (typeof context.result !== 'undefined') {
                this.emit('filter-valid', {
                    result: context.result,
                    type: 'js'
                })
            } else {
                this.emit('filter-invalid')
            }
        } catch (e) {
            fs.writeFileSync(this.tmp, JSON.stringify(this.data))

            // If JavaScript filter fails, run through jq
            jq.run(filter, this.tmp, {
                input: 'file',
                output: 'json'
            }).then((result) => {
                if (result === null) {

                    // jq returns null for incorrect keys, but we will count them as
                    // invalid
                    this.emit('filter-invalid')
                } else {

                    // The jq filter worked
                    this.emit('filter-valid', {
                        type: 'jq',
                        result
                    })
                }
            }).catch(() => {

                // jq filter failed
                this.emit('filter-invalid')
            })
        }
    }
}

/**
 * Exports
 */

module.exports = Editor