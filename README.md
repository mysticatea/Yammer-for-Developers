# ![y4d](src/icon_128.png) Yammer for Developers (y4d)

y4d is [Google Chrome Extension](https://developer.chrome.com/extensions/) that works on [Yammer](https://yammer.com/).<br>
y4d provides syntax highlight for Yammer messages.

Before is:
![Before](https://dl.dropbox.com/u/5739705/y4d/before.png)

After is:
![After](https://dl.dropbox.com/u/5739705/y4d/after.png)


## 💿 Installation

From Chrome Web Store:

- [y4d - Chrome Web Store](https://chrome.google.com/webstore/detail/y4d/emnacjcchajajfmcfhgdfjhodkipafdh)

## 📖 Usage

* You can decorate your messages.
    * `*bold*`
    * `/italic/`
    * `_under line_`
    * `-through line-`
    * <code>\`small code\`</code>
* You can use the notation like GitHub for highlighted source codes.<br>
  <pre><code>\`\`\`js
var hello = "world";
\`\`\`
</code></pre>

## ❤ Special Thanks

y4d is using [highlight.js](https://highlightjs.org/) for the syntax highlighting.

## 💪 Contributing

Welcome to contributing!
Please use issues/PRs of GitHub.

### Development tools

This repository has some npm-scripts.

- `npm run build` creates this package into `<root>/y4d`. You can load this `y4d` directory as a chrome extension by Chrome developer tools.
- `npm run clean` removes temporary directories.
- `npm run coverage` opens the coverage report of the previous test by your default browser.
- `npm run watch` creates this package into `<root>/y4d` on every update of source code.
- `npm test` runs unit tests.
