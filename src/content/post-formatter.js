/**
 * @author Toru Nagashima <https://github.com/mysticatea>
 * @copyright 2016 Toru Nagashima. All rights reserved.
 * See LICENSE file in root directory for full license.
 */
"use strict"

//------------------------------------------------------------------------------
// Helpers
//------------------------------------------------------------------------------

const rCodePart = /```.*?\n[\s\S]+?\n```|`.+?`?/g
const rIndent = /^ +/mg
const rObstacleChars = /[#@\t]/g
const OCMap = {"#": "＃", "@": "＠", "\t": "    "}

/**
 * Formats the given text.
 *
 * @param {string} content - The text to format.
 * @returns {string} Formated text.
 */
function formatText(content) {
    return content.replace(rCodePart, (code) =>
        code.replace(rObstacleChars, (c) => OCMap[c])
            .replace(rIndent, (s) => "\u3000".repeat(s.length))
    )
}

/**
 * Setup formatter into the given textarea.
 * This formatter would make readable for non-y4d people.
 *
 * @param {HTMLTextAreaElement} element - The textarea element to setup.
 * @returns {void}
 */
function installTo(element) {
    element.addEventListener("blur", () => {
        const before = element.value
        const after = formatText(before)
        if (after !== before) {
            element.value = after
        }
    })
}

//------------------------------------------------------------------------------
// Exports
//------------------------------------------------------------------------------

module.exports = {
    formatText,
    installTo,
}
