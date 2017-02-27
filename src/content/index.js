/**
 * @author Toru Nagashima <https://github.com/mysticatea>
 * @copyright 2016 Toru Nagashima. All rights reserved.
 * See LICENSE file in root directory for full license.
 */
"use strict"

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

const ContentFormatter = require("./content-formatter")
const PostFormatter = require("./post-formatter")

//------------------------------------------------------------------------------
// Helpers
//------------------------------------------------------------------------------

const INPUT_CLASS = "yj-tapf-textarea"
const MESSAGE_CLASS = "yj-message-list-item--body-message"

/**
 * Setup specific elements by the given class name.
 *
 * @param {HTMLElement} container - The element to search the setup targets.
 * @param {string} className - The class name to search.
 * @param {function} format - The setup function.
 * @returns {void}
 */
function setup(container, className, format) {
    if (container.classList.contains(className)) {
        format(container)
    }
    else {
        for (const element of container.getElementsByClassName(className)) {
            format(element)
        }
    }
}

/**
 * Setup added elements if the elements have specific class name.
 *
 * @param {MutationRecord[]} mutations - The mutation records to setup.
 * @returns {void}
 */
function mutationHandler(mutations) {
    for (const mutation of mutations) {
        for (const node of mutation.addedNodes) {
            if (node.nodeType === Node.ELEMENT_NODE) {
                setup(node, INPUT_CLASS, PostFormatter.installTo)
                setup(node, MESSAGE_CLASS, ContentFormatter.formatElement)
            }
        }
    }
}

//------------------------------------------------------------------------------
// Main
//------------------------------------------------------------------------------

setup(document.body, INPUT_CLASS, PostFormatter.installTo)
setup(document.body, MESSAGE_CLASS, ContentFormatter.formatElement)
new MutationObserver(mutationHandler).observe(
    document.body,
    {childList: true, subtree: true}
)
