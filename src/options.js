/* Yammer for Developers (y4d) v0.3.3
 * (C) 2012-2014 Toru Nagashima <https://github.com/mysticatea>.
 */
/*global chrome, NotificationState*/
'use strict';

(function initialization (doc) {
  var each = (function () {
    var forEach = [].forEach;
    return function (xs, f, thisObj) { forEach.call(xs, f, thisObj); };
  })();

  // i18n
  each(doc.querySelectorAll('[data-i18n]'), function (el) {
    var key = el.getAttribute('data-i18n');
    var val = chrome.i18n.getMessage(key);
    if (val) {
      el.textContent = val;
    }
  });

  // hover description
  var box         = doc.getElementById('hover-description-box');
  var currentText = '';
  doc.addEventListener('mousemove', function () {
    if (currentText !== '') {
      box.textContent = currentText = '';
    }
  });
  each(doc.querySelectorAll('[data-hover-description]'), function (el) {
    var key = el.getAttribute('data-hover-description');
    var val = chrome.i18n.getMessage(key);
    if (val) {
      el.addEventListener('mousemove', function (e) {
        e.stopPropagation();
        if (currentText !== val) {
          box.textContent = currentText = val;
        }
      });
    }
  });

  // controls
  var initCheckBox = function (id, callback) {
    var el     = doc.getElementById(id);
    el.checked = NotificationState.isEnabled();
    el.addEventListener('change', callback, false);
  };

  initCheckBox('notification-enabled', function () {
    NotificationState.setEnabled(this.checked);
  });

})(document);
