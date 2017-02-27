/**
 * @author Toru Nagashima <https://github.com/mysticatea>
 * @copyright 2016 Toru Nagashima. All rights reserved.
 * See LICENSE file in root directory for full license.
 */
"use strict"

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

const co = require("co")
const EventTargetShim = require("event-target-shim")

//------------------------------------------------------------------------------
// Helpers
//------------------------------------------------------------------------------

/**
 * Sends an ajax request.
 *
 * @param {CancelToken} ct - The cancel token.
 * @param {string} method - The HTTP method to request.
 * @param {string} url - The URL to request.
 * @param {data|null} data - The data of request body.
 * @returns {Promise<object[]>} The promise which will get fulfilled after request.
 */
function request(ct, method, url, data) {
    if (ct.canceled) {
        return Promise.reject(new Error("cancel"))
    }
    return new Promise((resolve, reject) => {
        let xhr = new XMLHttpRequest()

        /**
         * Abort XHR.
         * @returns {void}
         */
        function cancel() {
            if (xhr != null) {
                xhr.abort()
            }
        }

        /**
         * Dispose XHR.
         * @returns {void}
         */
        function dispose() {
            if (xhr != null) {
                xhr.onload = null
                xhr.onerror = null
                xhr = null
                ct.removeEventListener("cancel", cancel)
            }
        }

        ct.addEventListener("cancel", cancel)

        xhr.onload = () => {
            const status = xhr.status

            if (status >= 200 && status < 300) {
                try {
                    resolve(JSON.parse(xhr.responseText) || [])
                }
                catch (e) {
                    reject(e)
                }
            }
            else {
                const err = new Error(`${status} ${xhr.statusText}`)
                err.status = status
                err.statusText = xhr.statusText
                err.responseText = xhr.responseText
                reject(err)
            }

            dispose()
        }
        xhr.onerror = () => {
            reject(new Error("network error"))
            dispose()
        }
        xhr.onabort = () => {
            resolve([])
            dispose()
        }

        xhr.open(method, url, true)

        if (data != null) {
            xhr.setRequestHeader("Content-Type", "application/json")
            xhr.send(JSON.stringify(data))
        }
        else {
            xhr.send()
        }
    })
}

/**
 * Waits some seconds.
 *
 * @returns {Promise<void>} The promise which will get fulfilled after some seconds.
 */
function idle() {
    return new Promise(resolve => setTimeout(resolve, 10000))
}

/**
 * Gets my feed.
 * @param {CancelToken} ct The cancel token.
 * @param {number} latestMessageId The last received message ID.
 * @returns {Promise<object>} The promise which will get fulfilled after request.
 */
function getMyFeed(ct, latestMessageId) {
    const url = `https://www.yammer.com/api/v1/messages/my_feed.json${
        latestMessageId ? `?newer_than=${latestMessageId}` : ""
    }`
    return request(ct, "GET", url, null)
}

/**
 * Handshake for realtime notifications.
 * @param {CancelToken} ct The cancel token.
 * @param {string} baseUri The URI of the rt end-point.
 * @param {string} token The authentication token of the rt end-point.
 * @param {number} serialNo The serial number of requests.
 * @returns {Promise<object>} The promise which will get fulfilled after request.
 */
function handshake(ct, baseUri, token, serialNo) {
    const url = `${baseUri}handshake`
    const data = [
        {
            ext: {token},
            version: "1.0",
            minimumVersion: "0.9",
            channel: "/meta/handshake",
            supportedConnectionTypes: ["long-polling"],
            id: serialNo,
        },
    ]
    return request(ct, "POST", url, data).then(messages => {
        for (const message of messages) {
            if (message.successful) {
                return message.clientId
            }
        }
        return null
    })
}

/**
 * Handshake for realtime notifications.
 * @param {CancelToken} ct The cancel token.
 * @param {string} baseUri The URI of the rt end-point.
 * @param {string} channel The channel of the rt end-point.
 * @param {string} client The client of the rt end-point.
 * @param {number} serialNo The serial number of requests.
 * @returns {Promise<object>} The promise which will get fulfilled after request.
 */
function subscribe(ct, baseUri, channel, client, serialNo) {
    const url = baseUri
    const data = [
        {
            channel: "/meta/subscribe",
            subscription: `/feeds/${channel}/primary`,
            id: serialNo,
            clientId: client,
        },
        {
            channel: "/meta/subscribe",
            subscription: `/feeds/${channel}/secondary`,
            id: serialNo,
            clientId: client,
        },
    ]
    return request(ct, "POST", url, data)
}

/**
 * Handshake for realtime notifications.
 * @param {CancelToken} ct The cancel token.
 * @param {string} baseUri The URI of the rt end-point.
 * @param {string} client The client of the rt end-point.
 * @param {number} serialNo The serial number of requests.
 * @returns {Promise<object>} The promise which will get fulfilled after request.
 */
function connect(ct, baseUri, client, serialNo) {
    const url = `${baseUri}connect`
    const data = [
        {
            channel: "/meta/connect",
            connectionType: "long-polling",
            id: serialNo,
            clientId: client,
        },
    ]
    return request(ct, "POST", url, data)
}

/**
 * The cancellation token.
 * This will notify cancel requests.
 */
class CancelToken extends EventTargetShim("cancel") {
    /**
     * Initializes new token.
     */
    constructor() {
        super()
        this.canceled = false
    }

    /**
     * Requests to cancel.
     * @event CancelToken#cancel
     * @returns {void}
     */
    cancel() {
        if (!this.canceled) {
            this.canceled = true
            this.dispatchEvent({type: "cancel"})
        }
    }
}

/**
 * The feed observer.
 * This will notify new feed.
 */
class FeedObserver extends EventTargetShim("message", "error") {
    /**
     * Initialize new feed observer.
     * @param {number} latestMessageId - The message ID which was received most recently.
     */
    constructor(latestMessageId) {
        super()
        this._ct = null
        this._mainLoop(latestMessageId)
    }

    /**
     * Running main loop.
     *
     * @event FeedObserver#message
     * @event FeedObserver#error
     * @param {number} latestMessageId - The message ID which was received most recently.
     * @returns {void}
     */
    _mainLoop(latestMessageId) {
        co(function* () {
            const ct = new CancelToken()
            let serialNo = 0
            this._ct = ct
            try {
                // Get the first feed and the information of realtime stream.
                const myFeed = yield getMyFeed(ct, latestMessageId)
                if (ct.canceled) {
                    return
                }
                const rt = myFeed.meta.realtime
                const baseUri = rt.uri
                const token = rt.authentication_token
                const channel = rt.channel_id

                if (latestMessageId != null) {
                    this.dispatchEvent({type: "messages", data: myFeed})
                }

                // Handshake to register this client.
                const client = yield handshake(ct, baseUri, token, ++serialNo)
                if (ct.canceled) {
                    return
                }
                if (!client) {
                    throw new Error("Failed to handshake")
                }

                // Start to subscribe.
                const subscriptions = yield subscribe(ct, baseUri, channel, client, ++serialNo)
                if (ct.canceled) {
                    return
                }
                if (!subscriptions.some(subscription => subscription.successful)) {
                    throw new Error("Failed to subscribe")
                }

                // Start the main loop.
                while (!ct.canceled) {
                    const items = yield connect(ct, baseUri, client, ++serialNo)
                    if (ct.canceled) {
                        return
                    }
                    if (!items.some(item => item.successful)) {
                        throw new Error("Failed to connect")
                    }

                    for (const item of items) {
                        if (item.data != null && item.data.type === "message") {
                            const messages = item.data.data
                            this.dispatchEvent({type: "messages", data: messages})
                        }
                    }

                    yield idle()
                }
            }
            catch (error) {
                console.error(error.stack) //eslint-disable-line no-console

                this.dispatchEvent({type: "error", error})
                this.close()
            }
        }.bind(this))
    }

    /**
     * Restarts to observe.
     *
     * @param {number} latestMessageId - The message ID which was received most recently.
     * @returns {void}
     */
    restart(latestMessageId) {
        this.close()
        this._mainLoop(latestMessageId)
    }

    /**
     * Closes this observer.
     *
     * @returns {void}
     */
    close() {
        if (this._ct != null) {
            this._ct.cancel()
            this._ct = null
        }
    }
}

module.exports = {FeedObserver}
