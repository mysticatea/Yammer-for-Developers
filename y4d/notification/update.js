/* Yammer for Developers (y4d) v0.3.0
 * (C) 2012 Toru Nagashima <https://github.com/mysticatea>.
 */
/*global ContentFormatter,NotificationState*/
'use strict';

(function () {
  // load data
  var data =
    location.search
    .slice(1)
    .split('&')
    .reduce(function (data, pair) {
      var eq    = pair.indexOf('=');
      var key   = pair.slice(0, eq);
      var val   = decodeURIComponent(pair.slice(eq + 1));
      data[key] = val;
      return data;
    }, {});

  // find placeholders
  var d          = document;
  var eContainer = d.getElementById('container');
  var eIcon      = d.getElementById('icon');
  var eName      = d.getElementById('name');
  var eBody      = d.getElementById('body');

  // init content
  eIcon.src       = data.user_icon;
  eName.innerHTML = data.user_name;
  eBody.innerHTML = ContentFormatter.format(data.content);

  // init links
  var openLink = function (url) {
    return function (e) {
      e.preventDefault();
      e.stopPropagation();
      window.open(url, '_blank');
      window.close();
    };
  };
  eContainer.onclick = openLink(data.url);
  eIcon.onclick      = openLink(data.user_url);
  eName.onclick      = openLink(data.user_url);

  [].forEach.call(eBody.querySelectorAll('a'), function (eLink) {
    eLink.onclick = openLink(eLink.href);
  });

  // no leaks
  eContainer = null;
  eIcon      = null;
  eName      = null;
  eBody      = null;
})();

// close later
setTimeout(function () { window.close(); }, NotificationState.getPopupTimeout());
