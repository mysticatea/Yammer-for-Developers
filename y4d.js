/* Yammer for Developers (y4d) v0.1.2
 * (C) 2012 Toru Nagashima <https://github.com/mysticatea>.
 */

/*global hljs*/
'use strict';

//==============================================================================

var each = (function () {
  var forEach = [].forEach;
  return function (xs, f, thisObj) { forEach.call(xs, f, thisObj); };
})();

//==============================================================================

var replaceCodeSyntax = (function () {
  var rCodePart     = /(?:<br> ?)?```(.*?)<br> ?(.+?)<br> ?```(?:<br>)?/g;
  var rReplaceChars = /　|＠|＃|<br> ?|&(?:lt|gt|amp);/g;
  var rExpandLink   = /<a class="expand-body yj-small" href="javascript:\/\/">expand&nbsp;»<\/a><span class="remaining-body" style="display:none;">/;
  var rLink         = /<a [^>]*>(.+?)<\/a>/g;
  var rYammerObject = /<span class="yammer-object" [^>]*>(.+?)<\/span>/g;

  var RCMap = {
    '　'   : ' ',
    '＠'   : '@',
    '＃'   : '#',
    '<br> ': '\n',
    '<br>' : '\n',
    '&lt;' : '<',
    '&gt;' : '>',
    '&amp;': '&'
  };

  var LangMap = [
    'python py',
    'ruby',
    'scala',
    'xml',
    'html',
    'markdown md',
    'css',
    'json',
    'javascript js',
    'coffeescript coffee',
    'http',
    'java',
    'cpp c++ c',
    'objectivec objective-c',
    'cs c#',
    'sql',
    'apache',
    'nginx',
    'diff',
    'dos bat cmd',
    'bash sh',
    'haskell hs'
  ].reduce(function (map, names_ssv) {
    var baseName = null;
    names_ssv.split(' ').forEach(function (name) {
      baseName  = baseName || name;
      map[name] = baseName;
    });
    return map;
  }, {});

  return function replaceCodeSyntax (dom) {
    // find and replace code syntax.
    var codeFound = false;
    var converted = dom.innerHTML.replace(rCodePart, function (_, lang, code) {
      codeFound = true;

      // remove expand link.
      // the link append to next this code tag if found.
      var expandLink = '';
      code = code.replace(rExpandLink, function (whole) {
        expandLink = whole;
        return '';
      });

      // unwrap yammer-object tags & a tags.
      code = code.replace(rLink,         function (_, c) { return c; });
      code = code.replace(rYammerObject, function (_, c) { return c; });
      // restore special charactors.
      code = code.replace(rReplaceChars, function (c) { return RCMap[c]; });

      // highlight.
      try {
        lang = lang && LangMap[lang];
        code = lang != null ? hljs.highlight(lang, code).value
               /* else */   : hljs.highlightAuto(code).value;
      }
      catch (err) {
        console.error('[y4d] Failed Syntax Highlight: ', err.message);
      }

      return '<pre class="y4d-code">' + code + '</pre>' + expandLink;
    });

    // assign if code found.
    if (codeFound) {
      dom.innerHTML = converted;
    }
  };
})();


//==============================================================================


var installIndentReplacement = (function () {
  var rCodePart      = /(?:^|\n)```.*?\n[\s\S]+?\n```(?:$|\n)?/g;
  var rIndent        = /^ +/mg;
  var rObstacleChars = /[#@]/g;
  var SpaceSeq       = '　　　　　　　　　　　　　　　　　　　　　　　　　　　　　　　';
  var OCMap          = {'#':'＃', '@':'＠'};

  return function installIndentReplacement (textarea) {
    textarea.addEventListener('blur', function () {
      // find and replace code syntax.
      var codeFound = false;
      var converted = textarea.value.replace(rCodePart, function (code) {
        codeFound = true;

        // avoid that the code create new topic.
        // and spaces convert to multibyte-spaces for readable by none y4d.
        return code
          .replace(rObstacleChars, function (c) { return OCMap[c]; })
          .replace(rIndent, function (spaces) {
            return SpaceSeq.slice(0, spaces.length);
          });
      });

      // assign if code found.
      if (codeFound) {
        textarea.value = converted;
      }
    });
  };
})(document);


//==============================================================================


(function initializeTextArea (doc, installIndentReplacement) {
  var textarea = doc.getElementById('yj-yam.ui.shared.TextAreaMockEditor');
  if (textarea != null) {
    installIndentReplacement(textarea);
  }

})(document, installIndentReplacement);


//==============================================================================


(function initializeMessages (doc, replaceCodeSyntax) {
  var messages = doc.getElementsByClassName('yj-message');
  each(messages, replaceCodeSyntax);

})(document, replaceCodeSyntax);


//==============================================================================


(function processOnInserted (win, doc, installIndentReplacement, replaceCodeSyntax) {
  var MutationObserver = win.MutationObserver || win.WebKitMutationObserver;
  var observingTarget  = doc.getElementById('main-column');

  var observer = new MutationObserver(function (mutations) {
    each(mutations, function (mutation) {
      each(mutation.addedNodes, function (addedNode) {
        if (addedNode.nodeType === 1) {
          // on textarea inserted.
          if (addedNode.tagName === 'TEXTAREA') {
            installIndentReplacement(addedNode);
          }
          else {
            var textareas = addedNode.getElementsByTagName('textarea');
            each(textareas, installIndentReplacement);
          }

          // on message inserted.
          if (addedNode.className.indexOf('yj-message') >= 0) {
            replaceCodeSyntax(addedNode);
          }
          else {
            var messages = addedNode.getElementsByClassName('yj-message');
            each(messages, replaceCodeSyntax);
          }
        }
      });
    });
  });

  observer.observe(
    observingTarget,
    {childList: true, subtree: true}
  );

})(window, document, installIndentReplacement, replaceCodeSyntax);
