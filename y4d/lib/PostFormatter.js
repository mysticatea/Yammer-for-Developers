/* Yammer for Developers (y4d) v0.3.2
 * (C) 2012 Toru Nagashima <https://github.com/mysticatea>.
 */

'use strict';

var PostFormatter = {
  format: (function () {
    var rCodePart      = /```.*?\n[\s\S]+?\n```|`.+?`?/g;
    var rIndent        = /^ +/mg;
    var rObstacleChars = /[#@\t]/g;
    var SpaceSeq       = '　　　　　　　　　　　　　　　　　　　　　　　　　　　　　　　　　';
    var OCMap          = {'#':'＃', '@':'＠', '\t':'    '};

    return function format (content) {
      return content.replace(rCodePart, function (code) {
        // avoid that the code create new topic.
        // and spaces convert to multibyte-spaces for readable by none y4d.
        return code
          .replace(rObstacleChars, function (c) { return OCMap[c]; })
          .replace(rIndent, function (s) { return SpaceSeq.slice(0, s.length); });
      });
    };
  })(),

  installTo: function (textarea) {
    textarea.addEventListener('blur', function () {
      var before = textarea.value;
      var after  = PostFormatter.format(before);
      if (after !== before) {
        textarea.value = after;
      }
    });
  }
};
