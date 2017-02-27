/**
 * @author Toru Nagashima <https://github.com/mysticatea>
 * @copyright 2016 Toru Nagashima. All rights reserved.
 * See LICENSE file in root directory for full license.
 */
"use strict"

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

const NotificationState = require("../background/notification-state")

/*globals chrome, hoverDescriptionBox, notificationEnabled */

//------------------------------------------------------------------------------
// Main
//------------------------------------------------------------------------------

// i18n
for (const element of document.querySelectorAll("[data-i18n]")) {
    const key = element.getAttribute("data-i18n")
    const value = chrome.i18n.getMessage(key)
    if (value) {
        element.textContent = value
    }
}

// hover description
let currentText = ""
document.addEventListener("mousemove", () => {
    if (currentText !== "") {
        currentText = ""
        hoverDescriptionBox.textContent = ""
    }
})

for (const element of document.querySelectorAll("[data-hover-description]")) {
    const key = element.getAttribute("data-hover-description")
    const value = chrome.i18n.getMessage(key)
    if (value) {
        element.addEventListener("mousemove", (e) => { //eslint-disable-line no-loop-func
            e.stopPropagation()
            if (currentText !== value) {
                currentText = value
                hoverDescriptionBox.textContent = value
            }
        })
    }
}

// controls
notificationEnabled.checked = NotificationState.enabled
notificationEnabled.onchange = () => {
    NotificationState.enabled = notificationEnabled.checked
}
