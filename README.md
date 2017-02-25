Yammer for Developers (y4d)
================================================================================

y4d is [Google Chrome Extension](https://developer.chrome.com/extensions/) that
runs in [Yammer](https://yammer.com/).<br>
y4d is the code formater and highlighter in Yammer's messages.

We cannot use source codes readable in Yammer's messages (at 2012/11/06).<br>
So, y4d works to format and highlight in there!

Before is:
![Before](https://dl.dropbox.com/u/5739705/y4d/before.png)

After is:
![After](https://dl.dropbox.com/u/5739705/y4d/after.png)


Features
--------------------------------------------------------------------------------

* You can type decorated texts.
    * `*bold*`
    * `/italic/`
    * `_under line_`
    * `-through line-`
    * <code>\`small code\`</code>
* You can use the notation like GitHub for highlighted source codes.<br>
  <pre><code>\`\`\`js
var hello = "world";
\`\`\`
</code></pre>(Require y4d in order to see the highlighted source code)
* To display indents without y4d, y4d converts spaces to multibyte-spaces when
  submit messages.

Install
--------------------------------------------------------------------------------

You can install from Chrome Web Store.

https://chrome.google.com/webstore/detail/y4d/emnacjcchajajfmcfhgdfjhodkipafdh


Special Thanks
--------------------------------------------------------------------------------

y4d uses [highlight.js](http://softwaremaniacs.org/soft/highlight/) for the
syntax highlighting.


License
--------------------------------------------------------------------------------

(C) 2012, Toru Nagashima, unser MIT License.