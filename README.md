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

You with y4d:
* can type decorated texts.
    * `*bold*`
    * `/italic/`
    * `_under line_`
    * `-through line-`
    * <code>\`small code\`</code>
* can use the notation like GitHub to type a highlighted source code.<br>
  <pre><code>\`\`\`js
var hello = "world";
\`\`\`
</code></pre>(to see the highlighted source code, requires that viewers use y4d)
* can convert automatically to multibyte-spaces from spaces and tab-characters
  on TextArea.<br>
  So viewers can see the indented source code even if not use y4d.


Special Thanks
--------------------------------------------------------------------------------

y4d uses [highlight.js](http://softwaremaniacs.org/soft/highlight/) for the
syntax highlighting.


License
--------------------------------------------------------------------------------

(C) 2012, Toru Nagashima, unser MIT License.
