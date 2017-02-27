/**
 * @author Toru Nagashima <https://github.com/mysticatea>
 * @copyright 2016 Toru Nagashima. All rights reserved.
 * See LICENSE file in root directory for full license.
 */
"use strict"

/*globals chrome */

//------------------------------------------------------------------------------
// Helpers
//------------------------------------------------------------------------------

const KEY_ENABLED = "notification-enabled"
const KEY_LATEST_MESSAGE_ID = "notification-latest-message-id"

//------------------------------------------------------------------------------
// Exports
//------------------------------------------------------------------------------

module.exports = {
    /**
     * The flag to enable desktop notification.
     * @type {boolean}
     */
    get enabled() {
        return localStorage.getItem(KEY_ENABLED) !== "false"
    },
    set enabled(value) {
        if (this.enabled === Boolean(value)) {
            return
        }

        localStorage.setItem(KEY_ENABLED, value ? "true" : "false")

        // Refresh.
        const bgPage = chrome.extension.getBackgroundPage()
        if (bgPage) {
            bgPage.location.reload()
        }
    },

    /**
     * The message ID which was received most recently.
     * @type {number}
     */
    get latestMessageId() {
        return Number(localStorage.getItem(KEY_LATEST_MESSAGE_ID)) || 0
    },
    set latestMessageId(value) {
        const number = Number(value)
        const valid = Number.isFinite(number) && number >= 0

        localStorage.setItem(KEY_LATEST_MESSAGE_ID, valid ? String(number) : "0")
    },
}
