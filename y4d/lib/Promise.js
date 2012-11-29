/* Yammer for Developers (y4d) v0.3.0
 * (C) 2012 Toru Nagashima <https://github.com/mysticatea>.
 */
'use strict';

var Promise = function Promise (f) {
  var self          = this;
  var doneCallbacks = [];
  var failCallbacks = [];
  var state         = 0; /* 0=init, 1=done, 2=fail */
  var result        = null;

  self.done = function (doneCallback) {
    if (state === 0) {
      doneCallbacks.push(doneCallback);
    }
    if (state === 1) {
      doneCallback(result);
    }
    return self;
  };

  self.fail = function (failCallback) {
    if (state === 0) {
      failCallbacks.push(failCallback);
    }
    if (state === 2) {
      failCallback(result);
    }
    return self;
  };

  self.always = function (callback) {
    return self.done(callback).fail(callback);
  };

  self.then = function (doneCallback, failCallback) {
    return new Promise(function (deferred) {
      [
        [doneCallback, self.done, deferred.resolve],
        [failCallback, self.fail, deferred.reject ]
      ]
      .forEach(function (a) {
        var callback = a[0];
        var emit     = a[2];
        a[1](function (result) {
          if (callback != null) {
            result = callback(result);
            if (result != null &&
                typeof result.done === 'function' &&
                typeof result.fail === 'function' )
            {
              return result.done(deferred.resolve).fail(deferred.reject);
            }
          }
          emit(result);
        });
      });
    });
  };

  f.call(self, {
    resolve: function (_result) {
      if (state === 0) {
        state  = 1;
        result = _result;
        doneCallbacks.forEach(function (callback) { callback(_result); });
        doneCallbacks = failCallbacks = null;
      }
    },
    reject : function (_result) {
      if (state === 0) {
        state  = 2;
        result = _result;
        failCallbacks.forEach(function (callback) { callback(_result); });
        doneCallbacks = failCallbacks = null;
      }
    }
  });
};

Promise.resolved = function (result) {
  return new Promise(function (deferred) {
    deferred.resolve(result);
  });
};

Promise.rejected = function (result) {
  return new Promise(function (deferred) {
    deferred.reject(result);
  });
};
