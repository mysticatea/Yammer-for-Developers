/**
 * @author Toru Nagashima <https://github.com/mysticatea>
 * @copyright 2016 Toru Nagashima. All rights reserved.
 * See LICENSE file in root directory for full license.
 */
"use strict"

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

const hljs = require("highlight.js/lib/highlight")

hljs.registerLanguage("actionscript", require("highlight.js/lib/languages/actionscript"))
hljs.registerLanguage("apache", require("highlight.js/lib/languages/apache"))
hljs.registerLanguage("applescript", require("highlight.js/lib/languages/applescript"))
hljs.registerLanguage("cpp", require("highlight.js/lib/languages/cpp"))
hljs.registerLanguage("arduino", require("highlight.js/lib/languages/arduino"))
hljs.registerLanguage("armasm", require("highlight.js/lib/languages/armasm"))
hljs.registerLanguage("xml", require("highlight.js/lib/languages/xml"))
hljs.registerLanguage("bash", require("highlight.js/lib/languages/bash"))
hljs.registerLanguage("basic", require("highlight.js/lib/languages/basic"))
hljs.registerLanguage("bnf", require("highlight.js/lib/languages/bnf"))
hljs.registerLanguage("clojure", require("highlight.js/lib/languages/clojure"))
hljs.registerLanguage("cmake", require("highlight.js/lib/languages/cmake"))
hljs.registerLanguage("coffeescript", require("highlight.js/lib/languages/coffeescript"))
hljs.registerLanguage("cs", require("highlight.js/lib/languages/cs"))
hljs.registerLanguage("css", require("highlight.js/lib/languages/css"))
hljs.registerLanguage("markdown", require("highlight.js/lib/languages/markdown"))
hljs.registerLanguage("dart", require("highlight.js/lib/languages/dart"))
hljs.registerLanguage("diff", require("highlight.js/lib/languages/diff"))
hljs.registerLanguage("django", require("highlight.js/lib/languages/django"))
hljs.registerLanguage("dns", require("highlight.js/lib/languages/dns"))
hljs.registerLanguage("dockerfile", require("highlight.js/lib/languages/dockerfile"))
hljs.registerLanguage("dos", require("highlight.js/lib/languages/dos"))
hljs.registerLanguage("elixir", require("highlight.js/lib/languages/elixir"))
hljs.registerLanguage("elm", require("highlight.js/lib/languages/elm"))
hljs.registerLanguage("ruby", require("highlight.js/lib/languages/ruby"))
hljs.registerLanguage("erb", require("highlight.js/lib/languages/erb"))
hljs.registerLanguage("erlang-repl", require("highlight.js/lib/languages/erlang-repl"))
hljs.registerLanguage("erlang", require("highlight.js/lib/languages/erlang"))
hljs.registerLanguage("fsharp", require("highlight.js/lib/languages/fsharp"))
hljs.registerLanguage("go", require("highlight.js/lib/languages/go"))
hljs.registerLanguage("gradle", require("highlight.js/lib/languages/gradle"))
hljs.registerLanguage("groovy", require("highlight.js/lib/languages/groovy"))
hljs.registerLanguage("haml", require("highlight.js/lib/languages/haml"))
hljs.registerLanguage("handlebars", require("highlight.js/lib/languages/handlebars"))
hljs.registerLanguage("haskell", require("highlight.js/lib/languages/haskell"))
hljs.registerLanguage("hsp", require("highlight.js/lib/languages/hsp"))
hljs.registerLanguage("htmlbars", require("highlight.js/lib/languages/htmlbars"))
hljs.registerLanguage("http", require("highlight.js/lib/languages/http"))
hljs.registerLanguage("ini", require("highlight.js/lib/languages/ini"))
hljs.registerLanguage("java", require("highlight.js/lib/languages/java"))
hljs.registerLanguage("javascript", require("highlight.js/lib/languages/javascript"))
hljs.registerLanguage("json", require("highlight.js/lib/languages/json"))
hljs.registerLanguage("kotlin", require("highlight.js/lib/languages/kotlin"))
hljs.registerLanguage("less", require("highlight.js/lib/languages/less"))
hljs.registerLanguage("lisp", require("highlight.js/lib/languages/lisp"))
hljs.registerLanguage("lua", require("highlight.js/lib/languages/lua"))
hljs.registerLanguage("makefile", require("highlight.js/lib/languages/makefile"))
hljs.registerLanguage("perl", require("highlight.js/lib/languages/perl"))
hljs.registerLanguage("nginx", require("highlight.js/lib/languages/nginx"))
hljs.registerLanguage("objectivec", require("highlight.js/lib/languages/objectivec"))
hljs.registerLanguage("ocaml", require("highlight.js/lib/languages/ocaml"))
hljs.registerLanguage("php", require("highlight.js/lib/languages/php"))
hljs.registerLanguage("powershell", require("highlight.js/lib/languages/powershell"))
hljs.registerLanguage("puppet", require("highlight.js/lib/languages/puppet"))
hljs.registerLanguage("python", require("highlight.js/lib/languages/python"))
hljs.registerLanguage("r", require("highlight.js/lib/languages/r"))
hljs.registerLanguage("rust", require("highlight.js/lib/languages/rust"))
hljs.registerLanguage("scala", require("highlight.js/lib/languages/scala"))
hljs.registerLanguage("scheme", require("highlight.js/lib/languages/scheme"))
hljs.registerLanguage("scss", require("highlight.js/lib/languages/scss"))
hljs.registerLanguage("sql", require("highlight.js/lib/languages/sql"))
hljs.registerLanguage("stylus", require("highlight.js/lib/languages/stylus"))
hljs.registerLanguage("swift", require("highlight.js/lib/languages/swift"))
hljs.registerLanguage("yaml", require("highlight.js/lib/languages/yaml"))
hljs.registerLanguage("tex", require("highlight.js/lib/languages/tex"))
hljs.registerLanguage("typescript", require("highlight.js/lib/languages/typescript"))
hljs.registerLanguage("vbnet", require("highlight.js/lib/languages/vbnet"))
hljs.registerLanguage("vbscript", require("highlight.js/lib/languages/vbscript"))
hljs.registerLanguage("vim", require("highlight.js/lib/languages/vim"))

//------------------------------------------------------------------------------
// Helpers
//------------------------------------------------------------------------------

const rBR = /<br> ?/g
const rLN = /\n/g
const rOpenSign = /<|\n```([^\n]*)\n|([\s({[<、。])([`*/_-])/g
const rCloseTag = />/g
const rCloseInline = {
    "`": /[\n<]|`[\s,.!?:;)}\]>）、。]/g,
    "*": /[\n<]|\*[\s,.!?:;)}\]>）、。]/g,
    "/": /[\n<]|\/[\s,.!?:;)}\]>）、。]/g,
    "_": /[\n<]|_[\s,.!?:;)}\]>）、。]/g,
    "-": /[\n<]|-[\s,.!?:;)}\]>）、。]/g,
}
const rCloseCodeBlock = /\n```\n/g
const rCodeBlockWithLN = /<\/div>\n/g
const rReplaceChars = /[\u3000＠＃\t]|&(?:[lg]t|amp);|<[^>]+>/g
const rExcapeChars = /[<>&]/g
const rSpanOpen = /<span/g
const rSpanClose = /<\/span/g
const rExpandLink = /<a class="expand-body yj-small" href="javascript:\/\/">.+?<\/a><span class="remaining-body" style="display:none;">/
// const rCollapseLink = /<\/span>&nbsp;<a class="collapse-body yj-small" href="javascript:\/\/" style="display:none;">.+?<\/a>/

const RCMap = {
    "\u3000": " ",
    "＠": "@",
    "＃": "#",
    "\t": "    ",
    "&lt;": "<",
    "&gt;": ">",
    "&amp;": "&",
}
const EscMap = {
    "<": "&lt;",
    ">": "&gt;",
    "&": "&amp;",
}
const LangMap = {
    "htm": "xml",
    "objective-c": "objectivec",
    "m": "objectivec",
    "c#": "cs",
}
const DecorationMap = {
    "`": (content) => wrapTag("span", "code", content, highlight),
    "*": (content) => wrapTag("span", "bold", content, formatText),
    "/": (content) => wrapTag("span", "italic", content, formatText),
    "_": (content) => wrapTag("span", "underline", content, formatText),
    "-": (content) => wrapTag("span", "delete", content, formatText),
}

/**
 * Checks whether the given pattern matches the given text after the given index.
 *
 * @param {RegExp} pattern - The pattern to check.
 * @param {number} i - The start index to check.
 * @param {string} content - The target text to check.
 * @returns {RegExpExecArray|null} The result of matching.
 */
function match(pattern, i, content) {
    pattern.lastIndex = i
    return pattern.exec(content)
}

/**
 * Gets the index that the given pattern matched the given text after the given index.
 * If no matched, it returns `content.length`.
 *
 * @param {RegExp} pattern - The pattern to get.
 * @param {number} i - The start index to get.
 * @param {string} content - The target text to get.
 * @returns {number} The index of matched.
 */
function skipUntil(pattern, i, content) {
    pattern.lastIndex = i
    return pattern.test(content) ? pattern.lastIndex : content.length
}

/**
 * Counts the ranges that the given pattern matched the given text.
 *
 * @param {RegExp} pattern - The pattern to get.
 * @param {string} content - The target text to get.
 * @returns {number} The number of matched.
 */
function count(pattern, content) {
    pattern.lastIndex = 0

    let i = 0
    while (pattern.test(content)) {
        ++i
    }
    return i
}

/**
 * Applies highlight to the given code.
 *
 * @param {string} rawCode - The code to apply.
 * @param {string|null} rawLang - The language name of highlight.
 * @returns {string} Highlighted code.
 */
function highlight(rawCode, rawLang) {
    const code = rawCode
        .replace(rReplaceChars, (c) => (c.charAt(0) === "<") ? "" : RCMap[c])
        .trim()
    const lang = (rawLang && LangMap[rawLang.toLowerCase()])

    try {
        // highlight.
        const highlighted = lang
            ? hljs.highlight(lang, code).value
            : hljs.highlightAuto(code).value

        // validation.
        const open = count(rSpanOpen, highlighted)
        const close = count(rSpanClose, highlighted)
        if (open === close) {
            return highlighted
        }
        throw new Error(`Invalid Highlight: open_tags=${open}, close_tags=${close}`)
    }
    catch (err) {
        console.warn("[y4d] Failed Syntax Highlight: ", err.message, "\n", code) //eslint-disable-line no-console

        // escape the code (because failed to escape in highlight)
        return code.replace(rExcapeChars, (c) => EscMap[c])
    }
}

/**
 * Creates the string of line numbers.
 *
 * @param {string} code - The source code to count lines.
 * @returns {string} The string of line numbers.
 */
function makeLineNumbers(code) {
    let result = "1"
    let number = 1

    rLN.lastIndex = 0
    while (rLN.test(code)) {
        result += `\n${++number}`
    }
    return result
}

/**
 * Wraps the given string by the given tag.
 * If expand links exist in the string, this moves it to after the end tag.
 *
 * @param {string} tag - The tag name to wrap.
 * @param {string} kind - The class name of the tag to wrap.
 * @param {string} rawContent - The string to be wrapped.
 * @param {function} processContent - The function to format the content.
 * @returns {string} Wrapped string.
 */
function wrapTag(tag, kind, rawContent, processContent) {
    // remove expand link.
    // the link append to next of this tag if found.
    rExpandLink.lastIndex = 0
    let expandLink = ""
    const content = rawContent.replace(rExpandLink, (whole) => {
        expandLink = whole
        return ""
    })

    // process the content and wrap tag.
    return `<${tag} class="y4d-${kind}">${processContent(content)}</${tag}>${expandLink}`
}

/**
 * Formats the given string as a code block.
 *
 * @param {string|null} lang - The language name to make a code block.
 * @param {number} head - The start index in the content to make a code block.
 * @param {string} content - The whole text to format.
 * @returns {{index: number, result: string}} The result of formating.
 * The `index` property is the next index to continue formating.
 * The `result` property is the string of new code block.
 */
function processCodeBlock(lang, head, content) {
    // slice `i` to the end of code-block.
    const m = match(rCloseCodeBlock, head, content)
    const index = m ? m.index + m[0].length - 1 : content.length
    const result = wrapTag(
        "div",
        "code",
        content.slice(head, m ? m.index : content.length),
        (code) => {
            const body = highlight(code, lang)
            const numbers = makeLineNumbers(body)
            return `<table><tr><td>${numbers}</td><td>${body}</td></tr></table>`
        }
    )

    return {index, result}
}

/**
 * Formats the given string as an inline decoration.
 *
 * @param {string} prespace - The spaces followed by the inline decoration.
 * @param {string} sign - The sign of declaration.
 * @param {number} head - The start index in the content to make a decoration.
 * @param {string} content - The whole text to format.
 * @returns {{index: number, result: string}} The result of formating.
 * The `index` property is the next index to continue formating.
 * The `result` property is the string of new code block.
 */
function processInlineElement(prespace, sign, head, content) {
    const rClose = rCloseInline[sign]
    let i = head
    let end = content.length

    while (i < end) {
        const m = match(rClose, i, content)
        if (m == null) {
            i = end
        }
        else if (m[0] === "\n") {
            i = m.index
            end = m.index
        }
        else if (m[0] === "<") {
            // enter tag. skip until exit.
            i = skipUntil(rCloseTag, m.index + m.length, content)
        }
        else if (m.index === head) {
            // empty.
            i = m.index + m.length
            end = m.index + m.length
        }
        else {
            // closer found.
            const inlineContent = content.slice(head, m.index)
            const index = m.index + m.length
            const result = prespace + DecorationMap[sign](inlineContent)

            return {index, result}
        }
    }

    // closer not found.
    const index = end
    const result = prespace + sign + content.slice(head, end)

    return {index, result}
}

/**
 * Formats the given text.
 *
 * @param {string} rawContent - The text to format.
 * @returns {string} Formated text.
 */
function formatText(rawContent) {
    const content = `\n${rawContent.replace(rBR, "\n")}\n`
    const end = content.length
    let i = 0
    let head = 0
    let result = ""

    rOpenSign.lastIndex = 0
    while (i < end) {
        const m = match(rOpenSign, i, content)
        if (m != null) {
            i = rOpenSign.lastIndex

            // Skip inside tags.
            if (m[0] === "<") {
                i = skipUntil(rCloseTag, i, content)
                continue
            }

            const pair = (m[1] != null)
                ? processCodeBlock(m[1], i, content)
                : processInlineElement(m[2], m[3], i, content)
            if (pair == null) {
                result = content
                break
            }

            result += content.slice(head, m.index)
            result += pair.result
            i = pair.index
            head = pair.index
        }
        else {
            // rearch the end.
            result += content.slice(head)
            i = end
            head = end
        }
    }

    return result
        .trim()
        .replace(rCodeBlockWithLN, "</div>")
        .replace(rLN, "<br>")
}

/**
 * Replaces the text content of the given HTMLElement.
 * This rewrites the content of the element directly.
 *
 * @param {HTMLElement} element - The element to format.
 * @returns {void}
 */
function formatElement(element) {
    // If the element has `truncated-body` and `remaining-body`,
    // have to replace these element's content.
    const truncatedBody = element.querySelector(".truncated-body")
    const remainingBody = element.querySelector(".remaining-body")
    if (truncatedBody && remainingBody) {
        formatElement(truncatedBody)
        formatElement(remainingBody)
    }
    else {
        const before = element.innerHTML
        const after = formatText(before)
        if (after !== before) {
            element.innerHTML = after
        }
    }
}

//------------------------------------------------------------------------------
// Exports
//------------------------------------------------------------------------------

module.exports = {
    formatText,
    formatElement,
}
