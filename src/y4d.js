/* Yammer for Developers (y4d) v0.3.3
 * (C) 2012-2014 Toru Nagashima <https://github.com/mysticatea>.
 */

/*global ContentFormatter, PostFormatter*/
'use strict';


var each = (function () {
  var forEach = [].forEach;
  return function (xs, f, thisObj) { forEach.call(xs, f, thisObj); };
})();


(function initializeTextArea () {
  var textareas = document.getElementsByClassName('yj-tapf-textarea');
  each(textareas, function(textarea) {
    PostFormatter.installTo(textarea);
  });
})();


(function initializeMessages () {
  var messages = document.getElementsByClassName('yj-message-list-item--body-message');
  each(messages, ContentFormatter.replaceContent);
})();


(function processOnInserted () {
  var MutationObserver = window.MutationObserver || window.WebKitMutationObserver;
  var observingTarget  = document;

  var observer = new MutationObserver(function (mutations) {
    each(mutations, function (mutation) {
      each(mutation.addedNodes, function (addedNode) {
        if (addedNode.nodeType === Node.ELEMENT_NODE) {
          // on textarea inserted.
          if (addedNode.tagName === 'TEXTAREA') {
            PostFormatter.installTo(addedNode);
          }
          else {
            var textareas = addedNode.getElementsByTagName('textarea');
            each(textareas, PostFormatter.installTo);
          }

          // on message inserted.
          if (addedNode.className.indexOf('yj-message-list-item--body-message') >= 0) {
            ContentFormatter.replaceContent(addedNode);
          }
          else {
            var messages = addedNode.getElementsByClassName('yj-message-list-item--body-message');
            each(messages, ContentFormatter.replaceContent);
          }
        }
      });
    });
  });

  observer.observe(observingTarget, {childList: true, subtree: true});

})();
