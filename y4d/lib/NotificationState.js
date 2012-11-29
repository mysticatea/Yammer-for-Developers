/* Yammer for Developers (y4d) v0.3.1
 * (C) 2012 Toru Nagashima <https://github.com/mysticatea>.
 */
/*global chrome*/
'use strict';

var NotificationState = (function () {
  var KEY_ENABLED           = 'notification-enabled';
  var KEY_POLLING_INTERVAL  = 'notification-polling-interval';
  var KEY_POPUP_TIMEOUT     = 'notification-popup-timeout';
  var KEY_LATEST_MESSAGE_ID = 'notification-latest-message-id';
  var KEY_TIMER             = 'notification-timer';

  var storage         = localStorage;
  var enabled         = storage.getItem(KEY_ENABLED) !== 'false';
  var pollingInterval = +storage.getItem(KEY_POLLING_INTERVAL) || 300000;
  var popupTimeout    = +storage.getItem(KEY_POPUP_TIMEOUT)    || 6000;
  var latestMessageId = storage.getItem(KEY_LATEST_MESSAGE_ID);

  var hasAlarm = function (name, next) {
    chrome.alarms.getAll(function (alarms) {
      next( alarms.some(function (alarm) { return alarm.name === name; }) );
    });
  };

  // reset observing
  var resetTimer = function (next) {
    hasAlarm(KEY_TIMER, function (exists) {
      if (exists) {
        chrome.alarms.clear(KEY_TIMER);
      }
      if (enabled) {
        chrome.alarms.create(
          KEY_TIMER,
          {delayInMinutes: pollingInterval / 60000} );
      }
      if (next != null) {
        next();
      }
    });
  };

  return {
    KEY_TIMER : KEY_TIMER,
    resetTimer: resetTimer,

    isEnabled: function () {
      return enabled;
    },

    setEnabled: function (val) {
      val = !!val;
      if (val !== enabled) {
        enabled = val;
        storage.setItem(KEY_ENABLED, val);
        resetTimer();
      }
    },

    getPollingInterval: function () {
      return pollingInterval;
    },

    setPollingInterval: function (val) {
      val = +val;
      if (val !== pollingInterval) {
        pollingInterval = val;
        storage.setItem(KEY_POLLING_INTERVAL, val);
        resetTimer();
      }
    },

    getPopupTimeout: function () {
      return popupTimeout;
    },

    setPopupTimeout: function (val) {
      val = +val;
      if (val !== popupTimeout) {
        popupTimeout = val;
        storage.setItem(KEY_POPUP_TIMEOUT, val);
      }
    },

    getLatestMessageId: function () {
      return latestMessageId;
    },

    setLatestMessageId: function (val) {
      val = +val;
      if (val !== latestMessageId) {
        latestMessageId = val;
        storage.setItem(KEY_LATEST_MESSAGE_ID, val);
      }
    }
  };
})();
