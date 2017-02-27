/**
 * @author Toru Nagashima <https://github.com/mysticatea>
 * @copyright 2016 Toru Nagashima. All rights reserved.
 * See LICENSE file in root directory for full license.
 */
"use strict"

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

const NotificationState = require("./notification-state")
const YammerAPI = require("./yammer-api")

/*globals chrome */

//------------------------------------------------------------------------------
// Helpers
//------------------------------------------------------------------------------

/**
 * Notifier.
 */
class Notifier {
    /**
     * Initialize the notifier.
     */
    constructor() {
        this.shown401 = false

        chrome.notifications.onClosed.addListener(id => {
            if (id === "401") {
                this.shown401 = false
            }
        })

        chrome.notifications.onClicked.addListener(id => {
            if (id === "401" || id === "moreMessages") {
                window.open("https://www.yammer.com/", "_blank")
                chrome.notifications.clear(id)
            }
            else if (id) {
                window.open(id, "_blank")
                chrome.notifications.clear(id)
            }
        })
    }

    /**
     * Show the 401 popup.
     * @returns {void}
     */
    show401() {
        if (this.shown401) {
            return
        }
        this.shown401 = true

        chrome.notifications.create("401", {
            type: "basic",
            title: "401 Unauthorized",
            message: "Please login to Yammer.",
            iconUrl: "icon_128.png",
            isClickable: true,
        })
    }

    /**
     * Show a message.
     * @param {object} message - The message object to show.
     * @param {object[]} references - Meta data to show.
     * @returns {void}
     */
    showMessage(message, references) {
        if (this.shown401) {
            chrome.notifications.clear("401")
        }

        const user = references.find(reference =>
            reference.type === "user" &&
            reference.id === message.sender_id
        )
        chrome.notifications.create(message.web_url, {
            type: "basic",
            title: (user && user.full_name) || "(unknown)",
            message: message.body.plain || "(no message)",
            iconUrl: (user && user.mugshot_url) || "icon_128.png",
            isClickable: Boolean(message.web_url),
        })
    }

    /**
     * Show the popup to notify there are more messages.
     * @returns {void}
     */
    showMoreMessages() {
        if (this.shown401) {
            chrome.notifications.clear("401")
        }

        chrome.notifications.create("moreMessages", {
            type: "basic",
            title: "There are more messages.",
            message: "Please check on Yammer.",
            iconUrl: "icon_128.png",
            isClickable: true,
        })
    }
}

//------------------------------------------------------------------------------
// Main
//------------------------------------------------------------------------------

if (!NotificationState.enabled) {
    return
}

const notifier = new Notifier()
const observer = new YammerAPI.FeedObserver(NotificationState.latestMessageId)

observer.addEventListener("messages", ({data}) => {
    const meta = data.meta
    const messages = data.messages
    const references = data.references
    const currentUserId = meta && meta.current_user_id

    if (Array.isArray(messages) && currentUserId != null) {
        if (messages.length > 0) {
            NotificationState.latestMessageId = messages[0].id
        }
        const filtered = messages.filter(message =>
            message &&
            message.message_type === "update" &&
            message.sender_type === "user" &&
            message.sender_id !== currentUserId
        )

        // notify from older to newer.
        for (const message of filtered.slice(0, 5).reverse()) {
            notifier.showMessage(message, references)
        }

        // notify more messages.
        if (filtered.length > 5) {
            notifier.showMoreMessages()
        }
    }
})

observer.addEventListener("error", ({error}) => {
    if (window.navigator.onLine) {
        if (error.status === 401) {
            notifier.show401()
        }
        else {
            //eslint-disable-next-line no-console
            console.error("unknown error:", error)
        }

        setTimeout(() => {
            observer.restart(NotificationState.latestMessageId)
        }, 300000)
    }
    else {
        document.body.ononline = function() {
            document.body.ononline = null
            observer.restart(NotificationState.latestMessageId)
        }
    }
})
