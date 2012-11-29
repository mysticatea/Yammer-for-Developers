/* Yammer for Developers (y4d) v0.3.0
 * (C) 2012 Toru Nagashima <https://github.com/mysticatea>.
 */
/*global Promise*/

'use strict';

var YammerAPI = (function () {
  var getJson = function (url) {
    return new Promise(function (deferred) {
      var xhr = new XMLHttpRequest();
      xhr.open('GET', url, true);
      xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
          var status = xhr.status;
          if (status >= 200 && status < 300) {
            try {
              var content = JSON.parse(xhr.responseText) || [];
              deferred.resolve(content);
            }
            catch (e) {
              deferred.reject(e);
            }
          }
          else {
            var e = new Error(status);
            e.status       = status;
            e.statusText   = xhr.statusText;
            e.responseText = xhr.responseText;
            deferred.reject(e);
          }
          xhr.onreadystatechange = null;
        }
      };
      xhr.send(null);
    });
  };

  return {
    getMyFeedNewerThan: function (id) {
      return getJson(
        'https://www.yammer.com/api/v1/messages/my_feed.json'
        + (id == null ? '' : '?newer_than=' + id)
      );
    }
  };

})();
