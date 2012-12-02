/* Yammer for Developers (y4d) v0.3.2
 * (C) 2012 Toru Nagashima <https://github.com/mysticatea>.
 */
/*global chrome*/
'use strict';

(function removeTheAlarmCreatedAtOldVersion () {
  var KEY_TIMER = 'notification-timer';
  var hasAlarm  = function (name, next) {
        chrome.alarms.getAll(function (alarms) {
          next( alarms.some(function (alarm) { return alarm.name === name; }) );
        });
      };

  hasAlarm(KEY_TIMER, function (exists) {
    if (exists) {
      chrome.alarms.clear(KEY_TIMER);
    }
  });

})();

var NotificationState = (function () {
  var KEY_ENABLED           = 'notification-enabled';
  var KEY_POPUP_TIMEOUT     = 'notification-popup-timeout';
  var KEY_LATEST_MESSAGE_ID = 'notification-latest-message-id';

  var storage         = localStorage;
  var enabled         = storage.getItem(KEY_ENABLED) !== 'false';
  var popupTimeout    = +storage.getItem(KEY_POPUP_TIMEOUT)    || 10000;
  var latestMessageId = storage.getItem(KEY_LATEST_MESSAGE_ID) || null;

  return {
    isEnabled: function () {
      return enabled;
    },

    setEnabled: function (val) {
      val = !!val;
      if (val !== enabled) {
        enabled = val;
        storage.setItem(KEY_ENABLED, val);
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
