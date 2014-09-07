/* Yammer for Developers (y4d) v0.3.3
 * (C) 2012-2014 Toru Nagashima <https://github.com/mysticatea>.
 */
/*global Promise*/

'use strict';

var YammerAPI = (function () {
  var request = function (method, url, data) {
    return new Promise(function (deferred) {
      var xhr = new XMLHttpRequest();

      this.cancel = function () {
        if (xhr != null) {
          xhr.abort();
          xhr.onreadystatechange = null;
          xhr = null;
        }
      };

      xhr.open(method, url, true);
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
            var e = new Error(status + ' ' + xhr.statusText);
            e.status       = status;
            e.statusText   = xhr.statusText;
            e.responseText = xhr.responseText;
            deferred.reject(e);
          }

          if (xhr != null) {
            xhr.onreadystatechange = null;
            xhr = null;
          }
        }
      };

      if (data != null) {
        data = JSON.stringify(data);
        xhr.setRequestHeader('Content-Type', 'application/json');
      }

      xhr.send(data);
    });
  };

  return {
    newFeedObserver: function (latestMessageId) {
      var messageListeners = [];
      var errorListeners   = [];
      var currentPolling   = null;
      var closed           = false;
      var baseUri          = null;
      var token            = null;
      var channel          = null;
      var client           = null;
      var id               = 0;
      var self             = {
        onMessage: {
          addListener: function (listener) {
            messageListeners.push(listener);
            return self;
          },

          removeListener: function (listener) {
            var index = messageListeners.indexOf(listener);
            if (index >= 0) {
              messageListeners.splice(index, 1);
            }
            return self;
          }
        },

        onError: {
          addListener: function (listener) {
            errorListeners.push(listener);
            return self;
          },

          removeListener: function (listener) {
            var index = errorListeners.indexOf(listener);
            if (index >= 0) {
              errorListeners.splice(index, 1);
            }
            return self;
          }
        }
      };

      var isMessageData = function (json) {
        return json.data != null && json.data.type === 'message';
      };

      var isSuccessful = function (json) {
        return json.successful;
      };

      var emit = function (listeners, arg) {
        listeners.forEach(function (listener) {
          listener.call(self, arg);
        });
      };

      var getMyFeed = function (id) {
        var url = 'https://www.yammer.com/api/v1/messages/my_feed.json'
                + (id == null ? '' : '?newer_than=' + id);
        return (currentPolling = request('GET', url, null));
      };

      var postHandshake = function () {
        var url  = baseUri + 'handshake';
        var data =
          [
            {
              'ext'                     : {'token': token},
              'version'                 : '1.0',
              'minimumVersion'          : '0.9',
              'channel'                 : '/meta/handshake',
              'supportedConnectionTypes': ['long-polling'],
              'id'                      : ++id
            }
          ];
        return (currentPolling = request('POST', url, data));
      };

      var postSubscribe = function () {
        var url  = baseUri;
        var data =
          [
            {
              'channel'     : '/meta/subscribe',
              'subscription': '/feeds/' + channel + '/primary',
              'id'          : ++id,
              'clientId'    : client
            },
            {
              'channel'     : '/meta/subscribe',
              'subscription': '/feeds/' + channel + '/secondary',
              'id'          : ++id,
              'clientId'    : client
            }
          ];
        return (currentPolling = request('POST', url, data));
      };

      var postConnect = function () {
        var url  = baseUri + 'connect';
        var data =
          [
            {
              'channel'       : '/meta/connect',
              'connectionType': 'long-polling',
              'id'            : ++id,
              'clientId'      : client
            }
          ];
        return (currentPolling = request('POST', url, data));
      };

      var close = function () {
        if (closed === false) {
          closed = true;
          if (currentPolling != null) {
            currentPolling.cancel();
            currentPolling = null;
          }
        }
      };

      var next = function () {
        postConnect()
          .done(function (jsons) {
            if (closed === false) {
              // find message and emit
              jsons
                .filter(isMessageData)
                .forEach(function (json) {
                  var message = json.data.data;
                  emit(messageListeners, message);
                });

              // check success
              if (closed === false) {
                if (jsons.some(isSuccessful)) {
                  setTimeout(next, 0);
                }
                else {
                  close();
                  emit(errorListeners, new Error('Failed to Connect'));
                }
              }
            }
          })
          .fail(function (err) {
            if (closed === false) {
              close();
              emit(errorListeners, err);
            }
          });
      };

      var init = function (latestMessageId) {
        getMyFeed(latestMessageId)
          .then(function (json) {
            var rt  = json.meta.realtime;
            baseUri = rt.uri;
            token   = rt.authentication_token;
            channel = rt.channel_id;

            if (latestMessageId != null) {
              emit(messageListeners, json);
            }

            return postHandshake();
          })
          .then(function (jsons) {
            // I want save the clientId and return when find a successful data.
            for (var i = 0, end = jsons.length; i < end; ++i) {
              var json = jsons[i];
              if (json.successful) {
                client = json.clientId;

                return postSubscribe();
              }
            }

            return Promise.rejected(new Error('Failed to Handshake'));
          })
          .then(function (jsons) {
            if (jsons.some(isSuccessful)) {
              return next();
            }
            return Promise.rejected(new Error('Failed to Subscribe'));
          })
          .fail(function (err) {
            if (closed === false) {
              close();
              emit(errorListeners, err);
            }
          });
      };

      self.close = function () {
        close();
        return self;
      };

      self.restart = function (latestMessageId) {
        close();
        init(latestMessageId);
        return self;
      };

      init(latestMessageId);
      return self;
    }
  };

})();
