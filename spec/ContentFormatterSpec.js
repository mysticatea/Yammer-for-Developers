/* Yammer for Developers (y4d) v0.2.0
 * (C) 2012 Toru Nagashima <https://github.com/mysticatea>.
 */

/*global ContentFormatter, describe, it, expect*/
'use strict';

describe('ContentFormater:', function () {
  describe('format method', function () {
    var format = ContentFormatter.format;

    var inlineFormats = [
      {sign: '*', style: 'bold'},
      {sign: '/', style: 'italic'},
      {sign: '_', style: 'underline'},
      {sign: '-', style: 'delete'}
    ];
    var wrapWithSign = function (sign, content) {
      return sign + content + sign;
    };
    var wrapWithTag = function (style, content) {
      return '<span class="y4d-' + style + '">' + content + '</span>';
    };

    inlineFormats.forEach(function (f) {
      var sign        = f.sign;
      var style       = f.style;
      var signedFoo   = wrapWithSign(sign, 'foo');
      var formatedFoo = wrapWithTag(style, 'foo');

      describe('should convert to ' + style + '-style from ' + signedFoo + '(s)', function () {
        it('where inside of a line', function () {
          var result = format('bar bar ' + signedFoo + ' bar ' + signedFoo + ' ' + signedFoo + ' bar');
          expect(result).toBe('bar bar ' + formatedFoo + ' bar ' + formatedFoo + ' ' + formatedFoo + ' bar');
        });

        it('where head or tail of a line', function () {
          var result = format(signedFoo + ' bar ' + signedFoo);
          expect(result).toBe(formatedFoo + ' bar ' + formatedFoo);
        });

        it('decorate whole a line', function () {
          var result = format(signedFoo);
          expect(result).toBe(formatedFoo);
        });

        it('even if the decorated part has the "' + sign + '" without space(s).', function () {
          var decoratedPart = 'foo' + sign + 'foo';
          var result = format(wrapWithSign(sign, decoratedPart));
          expect(result).toBe(wrapWithTag(style, decoratedPart));
        });

        it('even if the decorated part has HTML tag(s)', function () {
          var decoratedPart = '<span data-test=" * / _ - " data-test2="">foo</span>';
          var result = format(wrapWithSign(sign, decoratedPart));
          expect(result).toBe(wrapWithTag(style, decoratedPart));
        });

        inlineFormats
          .filter(function (nf) { return nf.sign !== f.sign; })
          .forEach(function (nf) {
            var nsign  = nf.sign;
            var nstyle = nf.style;
            var nestWithSign = function (nestedPart) {
              return wrapWithSign(nsign, nestedPart);
            };
            var nestWithTag  = function (nestedPart) {
              return wrapWithTag(nstyle, nestedPart);
            };

            describe('when nested with ' + nsign + 'bar' + nsign + ', the ' + signedFoo, function () {
              it('where inside of a nested part', function () {
                var result = format(nestWithSign('bar bar ' + signedFoo + ' bar ' + signedFoo + ' ' + signedFoo + ' bar'));
                expect(result).toBe(nestWithTag('bar bar ' + formatedFoo + ' bar ' + formatedFoo + ' ' + formatedFoo + ' bar'));
              });

              it('where head or tail of a nested part', function () {
                var result = format(nestWithSign(signedFoo + ' bar ' + signedFoo));
                expect(result).toBe(nestWithTag(formatedFoo + ' bar ' + formatedFoo));
              });

              it('decorate whole a nested part', function () {
                var result = format(nestWithSign(signedFoo));
                expect(result).toBe(nestWithTag(formatedFoo));
              });
            });
          });
      });

      describe('should NOT convert to ' + style + '-style from ' + wrapWithSign(sign, 'foo') + '(s)', function () {
        it('if the decorated part has a line ending', function () {
          var result = format(wrapWithSign(sign, 'foo\nfoo'));
          expect(result).toBe(wrapWithSign(sign, 'foo<br>foo'));
        });

        it('if the decorated part has not the end sign', function () {
          var invalidText = wrapWithSign(sign, 'foo') + 'bar';
          var result      = format(invalidText);
          expect(result).toBe(invalidText);

          invalidText = sign + 'foo';
          result      = format(invalidText);
          expect(result).toBe(invalidText);

          invalidText = 'foo' + sign;
          result      = format(invalidText);
          expect(result).toBe(invalidText);
        });
      });

    });

    describe('should convert to strong-style from **foo**(s)', function () {
      var strongSignedFoo   = wrapWithSign('*', wrapWithSign('*', 'foo'));
      var strongFormatedFoo = wrapWithTag('bold', wrapWithTag('bold', 'foo'));

      it('where inside of a line', function () {
        var result = format('bar bar ' + strongSignedFoo + ' bar ' + strongSignedFoo + ' ' + strongSignedFoo + ' bar');
        expect(result).toBe('bar bar ' + strongFormatedFoo + ' bar ' + strongFormatedFoo + ' ' + strongFormatedFoo + ' bar');
      });

      it('where head or tail of a line', function () {
        var result = format(strongSignedFoo + ' bar ' + strongSignedFoo);
        expect(result).toBe(strongFormatedFoo + ' bar ' + strongFormatedFoo);
      });

      it('decorate whole a line', function () {
        var result = format(strongSignedFoo);
        expect(result).toBe(strongFormatedFoo);
      });
    });

    describe('should convert to code-style from `foo`(s)', function () {
      var code      = wrapWithSign('`', 'var hello = "world";');
      var formatted = wrapWithTag('code', '<span class="keyword">var</span> hello = <span class="string">"world"</span>;');

      it('where inside of a line', function () {
        var result = format('bar bar ' + code + ' bar ' + code + ' ' + code + ' bar');
        expect(result).toBe('bar bar ' + formatted + ' bar ' + formatted + ' ' + formatted + ' bar');
      });

      it('where head or tail of a line', function () {
        var result = format(code + ' bar ' + code);
        expect(result).toBe(formatted + ' bar ' + formatted);
      });

      it('decorate whole a line', function () {
        var result = format(code);
        expect(result).toBe(formatted);
      });

      it('where inside of a line -- "Highlight.js" has a bug.  highlightAuto() with the string "position:", "absolute", or "relative" don\'t close span tag.', function () {
        var before =
          '`position: absolute;` の座標の原点は、親要素、親の親、と辿っていって、最初に見' +
          'つかった `position:` が `relative` か `absolute` か `fixed` のブロック要' +
          '素の左上座標になります。\n' +
          'コンテナを `position: relative;` にしているのは、その場から動かさずに原点にす' +
          'るためです。';
        var after =
          '<span class="y4d-code"><span class="attribute">position</span>: <s' +
          'pan class="string">absolute;</span></span> の座標の原点は、親要素、親の親' +
          '、と辿っていって、最初に見つかった <span class="y4d-code">position:</span>' +
          ' が <span class="y4d-code">relative</span> か <span class="y4d-code' +
          '">absolute</span> か <span class="y4d-code"><span class="keyword">f' +
          'ixed</span></span> のブロック要素の左上座標になります。<br>コンテナを <span ' +
          'class="y4d-code"><span class="attribute">position</span>: <span cla' +
          'ss="string">relative;</span></span> にしているのは、その場から動かさずに原' +
          '点にするためです。';
        var result = format(before);
        expect(result).toBe(after);
      });
    });

    describe('should convert to code-block from ```foo```(s)', function () {
      var code =
        '```\n' +
        'var hello = "world";\n' +
        'var hello = "world";\n' +
        'var hello = "world";\n' +
        '```' ;
      var formatted =
        '<div class="y4d-code"><table><tr>' +
        '<td>1<br>2<br>3</td>' +
        '<td><span class="keyword">var</span> hello = <span class="string">"world"</span>;<br><span class="keyword">var</span> hello = <span class="string">"world"</span>;<br><span class="keyword">var</span> hello = <span class="string">"world"</span>;</td>' +
        '</tr></table></div>';

      it('where inside of a multi-line string.', function () {
        var result = format('bar bar\n' + code + '\nbar\n' + code + '\n' + code + '\nbar');
        expect(result).toBe('bar bar' + formatted + 'bar' + formatted + formatted + 'bar');
      });

      it('where head or tail of a multi-line string.', function () {
        var result = format(code + '\nbar\n' + code);
        expect(result).toBe(formatted + 'bar' + formatted);
      });

      it('decorate whole a multi-line string.', function () {
        var result = format(code);
        expect(result).toBe(formatted);
      });
    });

    describe('should NOT convert to code-block from ```foo```(s)', function () {
      var code =
        'var hello = "world";\n' +
        'var hello = "world";\n' +
        'var hello = "world";';
      var formatted =
        'var hello = "world";<br>' +
        'var hello = "world";<br>' +
        'var hello = "world";';

      it('if the decorated part has not the end sign', function () {
        var result = format('```\n' + code + '\n```bar');
        expect(result).toBe('```<br>' + formatted + '<br>```bar');

        result = format('```\n' + code + '```\nbar');
        expect(result).toBe('```<br>' + formatted + '```<br>bar');

        result = format('```\n' + code + '\n');
        expect(result).toBe('```<br>' + formatted);
      });
    });

  });
});
