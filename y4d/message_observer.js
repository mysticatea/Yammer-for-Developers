/* Yammer for Developers (y4d) v0.3.1
 * (C) 2012 Toru Nagashima <https://github.com/mysticatea>.
 */
/*global chrome, YammerAPI, NotificationState*/
'use strict';

var N        = window.webkitNotifications;
var popup401 = null;

var notify = {
  '401': function () {
    if (popup401 == null) {
      popup401 = N.createHTMLNotification('notification/401.html');
      popup401.onclose = function () { popup401 = null; };
      popup401.show();
    }
  },

  'update': function (message, references) {
    // find user
    var user = references.reduce(function (result, reference) {
      if (result == null
          && reference.type === 'user'
          && reference.id === message.sender_id )
      {
        result = reference;
      }
      return result;
    }, null);

    // make data
    var data = [
      'user_url='  + encodeURIComponent(user.web_url),
      'user_name=' + encodeURIComponent(user.full_name),
      'user_icon=' + encodeURIComponent(user.mugshot_url),
      'url='       + encodeURIComponent(message.web_url),
      'content='   + encodeURIComponent(message.body.rich)
    ].join('&');

    // show notification
    N.createHTMLNotification('notification/update.html?' + data).show();
  }
};

var isNotifiableMessage = function (currentUserId) {
  var count = 6;
  return function (message) {
    return message
        && notify.hasOwnProperty(message.message_type)
        && message.sender_type === 'user'
        && message.sender_id   !== currentUserId //excludes mine
        && (--count) >= 0 ;                      //excludes many many.
  };
};


chrome.runtime.onInstalled.addListener(function() {
  NotificationState.resetTimer();
});

chrome.alarms.onAlarm.addListener(function(alarm) {
  var state = NotificationState;

  if (alarm && alarm.name === state.KEY_TIMER) {
    YammerAPI
      .getMyFeedNewerThan(state.getLatestMessageId())
      .done(function (json) {
        if (popup401 != null) {
          popup401.cancel();
        }

        // notification
        var meta          = json.meta;
        var messages      = json.messages;
        var references    = json.references;
        var currentUserId = meta && meta.current_user_id;
        if (Array.isArray(messages) && currentUserId != null) {
          if (messages.length > 0) {
            NotificationState.setLatestMessageId(messages[0].id);
          }

          // notify from older to newer.
          messages = messages.filter(isNotifiableMessage(currentUserId));
          messages.reverse();
          messages.forEach(function (message) {
            notify[message.message_type](message, references);
          });
        }
      })
      .fail(function (err) {
        if (err.status === 401) {
          notify['401']();
        }
        else if (navigator.onLine) {
          console.warn('unknown error:', err);
        }
      })
      .always(function () {
        // next
        NotificationState.resetTimer();
      });
  }
});
