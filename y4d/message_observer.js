/* Yammer for Developers (y4d) v0.3.3
 * (C) 2012-2014 Toru Nagashima <https://github.com/mysticatea>.
 */
/*global YammerAPI, NotificationState*/
'use strict';

var N        = window.webkitNotifications;
var popup401 = null;

var findRef = function (references, type, id) {
  for (var i = 0, end = references.length; i < end; ++i) {
    var reference = references[i];
    if (reference.type === type && reference.id === id) {
      return reference;
    }
  }
  return null;
};

var notify = {
  '401': function () {
    if (popup401 == null) {
      popup401 = N.createHTMLNotification('notification/401.html');
      popup401.onclose = function () { popup401 = null; };
      popup401.show();
    }
  },

  'update': function (message, references) {
    var user = findRef(references, 'user', message.sender_id);
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
  return function (message) {
    return message
        && notify.hasOwnProperty(message.message_type)
        && message.sender_type === 'user'
        && message.sender_id   !== currentUserId;
  };
};


YammerAPI
  .newFeedObserver(NotificationState.getLatestMessageId())
  .onMessage.addListener(function (json) {
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
  .onError.addListener(function (err) {
    var observer = this;
    if (navigator.onLine) {
      if (err.status === 401) {
        notify['401']();
      }
      else {
        console.warn('unknown error:', err);
      }
      setTimeout(function () {
        observer.restart(NotificationState.getLatestMessageId());
      }, 300000);
    }
    else {
      document.body.ononline = function () {
        document.body.ononline = null;
        observer.restart(NotificationState.getLatestMessageId());
      };
    }
  });
