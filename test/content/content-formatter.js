/**
 * @author Toru Nagashima <https://github.com/mysticatea>
 * @copyright 2016 Toru Nagashima. All rights reserved.
 * See LICENSE file in root directory for full license.
 */
"use strict"

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

const assert = require("assert")
const ContentFormatter = require("../../src/content/content-formatter")

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

describe("ContentFormater:", () => {
    describe("format method", () => {
        const expandLink = "<a class=\"expand-body yj-small\" href=\"javascript://\">expand&nbsp;»</a><span class=\"remaining-body\" style=\"display:none;\">"
        const collapseLink = "</span>&nbsp;<a class=\"collapse-body yj-small\" href=\"javascript://\" style=\"display:none;\">«&nbsp;collapse</a>"
        const expandLinkJp = "<a class=\"expand-body yj-small\" href=\"javascript://\">展開&nbsp;»</a><span class=\"remaining-body\" style=\"display:none;\">"
        const collapseLinkJp = "</span>&nbsp;<a class=\"collapse-body yj-small\" href=\"javascript://\" style=\"display:none;\">«&nbsp;折り畳む</a>"
        const format = ContentFormatter.formatText
        const inlineFormats = [
            {sign: "*", style: "bold"},
            {sign: "/", style: "italic"},
            {sign: "_", style: "underline"},
            {sign: "-", style: "delete"},
        ]

        /**
         * Wrap the given text with the given sign character.
         * @param {string} sign The sign to wrap.
         * @param {string} content The target text.
         * @returns {string} The wrapped text.
         */
        function wrapWithSign(sign, content) {
            return sign + content + sign
        }

        /**
         * Wrap the given text with the tag which has the given class.
         * @param {string} style The class to wrap.
         * @param {string} content The target text.
         * @returns {string} The wrapped text.
         */
        function wrapWithTag(style, content) {
            return `<span class="y4d-${style}">${content}</span>`
        }

        for (const f of inlineFormats) {
            const sign = f.sign
            const style = f.style
            const signedFoo = wrapWithSign(sign, "foo")
            const formatedFoo = wrapWithTag(style, "foo")

            describe(`should convert to ${style}-style from ${signedFoo}(s)`, () => {
                it("where inside of a line", () => {
                    const result = format(`bar bar ${signedFoo} bar ${signedFoo} ${signedFoo} bar`)
                    assert(result === `bar bar ${formatedFoo} bar ${formatedFoo} ${formatedFoo} bar`)
                })

                it("where head or tail of a line", () => {
                    const result = format(`${signedFoo} bar ${signedFoo}`)
                    assert(result === `${formatedFoo} bar ${formatedFoo}`)
                })

                it("decorate whole a line", () => {
                    const result = format(signedFoo)
                    assert(result === formatedFoo)
                })

                it(`even if the decorated part has the "${sign}" without space(s).`, () => {
                    const decoratedPart = `foo${sign}foo`
                    const result = format(wrapWithSign(sign, decoratedPart))
                    assert(result === wrapWithTag(style, decoratedPart))
                })

                it("even if the decorated part has HTML tag(s)", () => {
                    const decoratedPart = "<span data-test=\" * / _ - \" data-test2=\"\">foo</span>"
                    const result = format(wrapWithSign(sign, decoratedPart))
                    assert(result === wrapWithTag(style, decoratedPart))
                })

                for (const nf of inlineFormats.filter(nf => nf.sign !== f.sign)) { //eslint-disable-line no-shadow
                    const nsign = nf.sign
                    const nstyle = nf.style

                    describe(`when nested with ${nsign}bar${nsign}, the ${signedFoo}`, () => {
                        it("where inside of a nested part", () => {
                            const result = format(wrapWithSign(nsign, `bar bar ${signedFoo} bar ${signedFoo} ${signedFoo} bar`))
                            assert(result === wrapWithTag(nstyle, `bar bar ${formatedFoo} bar ${formatedFoo} ${formatedFoo} bar`))
                        })

                        it("where head or tail of a nested part", () => {
                            const result = format(wrapWithSign(nsign, `${signedFoo} bar ${signedFoo}`))
                            assert(result === wrapWithTag(nstyle, `${formatedFoo} bar ${formatedFoo}`))
                        })

                        it("decorate whole a nested part", () => {
                            const result = format(wrapWithSign(nsign, signedFoo))
                            assert(result === wrapWithTag(nstyle, formatedFoo))
                        })
                    })
                }

                it("if the decorated part has an expand link, then moves the link to out of the decorated part", () => {
                    const result = format(`${wrapWithSign(sign, `foo${expandLink}foo`)} bar${collapseLink}`)
                    assert(result === `${wrapWithTag(style, "foofoo") + expandLink} bar${collapseLink}`)
                })

                it("if the decorated part has an expand link, then moves the link to out of the decorated part (language: jp)", () => {
                    const result = format(`${wrapWithSign(sign, `foo${expandLinkJp}foo`)} bar${collapseLinkJp}`)
                    assert(result === `${wrapWithTag(style, "foofoo") + expandLinkJp} bar${collapseLinkJp}`)
                })
            })

            describe(`should NOT convert to ${style}-style from ${wrapWithSign(sign, "foo")}(s)`, () => {
                it("if the decorated part has a line ending", () => {
                    const result = format(wrapWithSign(sign, "foo\nfoo"))
                    assert(result === wrapWithSign(sign, "foo<br>foo"))
                })

                it("if the decorated part has not the end sign", () => {
                    let invalidText = `${wrapWithSign(sign, "foo")}bar`
                    let result = format(invalidText)
                    assert(result === invalidText)

                    invalidText = `${sign}foo`
                    result = format(invalidText)
                    assert(result === invalidText)

                    invalidText = `foo${sign}`
                    result = format(invalidText)
                    assert(result === invalidText)
                })

                it("if the decorated part is empty", () => {
                    const result = format(wrapWithSign(sign, ""))
                    assert(result === wrapWithSign(sign, ""))
                })
            })
        }

        describe("should convert to strong-style from **foo**(s)", () => {
            const strongSignedFoo = wrapWithSign("*", wrapWithSign("*", "foo"))
            const strongFormatedFoo = wrapWithTag("bold", wrapWithTag("bold", "foo"))

            it("where inside of a line", () => {
                const result = format(`bar bar ${strongSignedFoo} bar ${strongSignedFoo} ${strongSignedFoo} bar`)
                assert(result === `bar bar ${strongFormatedFoo} bar ${strongFormatedFoo} ${strongFormatedFoo} bar`)
            })

            it("where head or tail of a line", () => {
                const result = format(`${strongSignedFoo} bar ${strongSignedFoo}`)
                assert(result === `${strongFormatedFoo} bar ${strongFormatedFoo}`)
            })

            it("decorate whole a line", () => {
                const result = format(strongSignedFoo)
                assert(result === strongFormatedFoo)
            })
        })

        describe("should convert to code-style from `foo`(s)", () => {
            const code = wrapWithSign("`", "var hello = \"world\";")
            const formatted = wrapWithTag("code", "<span class=\"hljs-keyword\">var</span> hello = <span class=\"hljs-string\">\"world\"</span>;")

            it("where inside of a line", () => {
                const result = format(`bar bar ${code} bar ${code} ${code} bar`)
                assert(result === `bar bar ${formatted} bar ${formatted} ${formatted} bar`)
            })

            it("where head or tail of a line", () => {
                const result = format(`${code} bar ${code}`)
                assert(result === `${formatted} bar ${formatted}`)
            })

            it("decorate whole a line", () => {
                const result = format(code)
                assert(result === formatted)
            })

            it("where inside of a line -- \"Highlight.js\" has a bug.  highlightAuto() with the string \"position:\", \"absolute\", or \"relative\" don't close span tag.", () => {
                const beforeText =
                    "`position: absolute;` の座標の原点は、親要素、親の親、と辿っていって、最初に見つかった `position:` が `relative` か `absolute` か `fixed` のブロック要素の左上座標になります。\nコンテナを `position: relative;` にしているのは、その場から動かさずに原点にするためです。"
                const afterText =
                    "<span class=\"y4d-code\"><span class=\"hljs-attribute\">position</span>: absolute;</span> の座標の原点は、親要素、親の親、と辿っていって、最初に見つかった <span class=\"y4d-code\"><span class=\"hljs-built_in\">position</span>:</span> が <span class=\"y4d-code\">relative</span> か <span class=\"y4d-code\">absolute</span> か <span class=\"y4d-code\"><span class=\"hljs-keyword\">fixed</span></span> のブロック要素の左上座標になります。<br>コンテナを <span class=\"y4d-code\"><span class=\"hljs-attribute\">position</span>: relative;</span> にしているのは、その場から動かさずに原点にするためです。"
                const result = format(beforeText)
                assert(result === afterText)
            })
        })

        describe("should convert to code-block from ```foo```(s)", () => {
            const code = "```\nvar hello = \"world\";\nvar hello = \"world\";\nvar hello = \"world\";\n```"
            const formatted = "<div class=\"y4d-code\"><table><tr><td>1<br>2<br>3</td><td><span class=\"hljs-keyword\">var</span> hello = <span class=\"hljs-string\">\"world\"</span>;<br><span class=\"hljs-keyword\">var</span> hello = <span class=\"hljs-string\">\"world\"</span>;<br><span class=\"hljs-keyword\">var</span> hello = <span class=\"hljs-string\">\"world\"</span>;</td></tr></table></div>"

            it("where inside of a multi-line string.", () => {
                const result = format(`bar bar\n${code}\nbar\n${code}\n${code}\nbar`)
                assert(result === `bar bar${formatted}bar${formatted}${formatted}bar`)
            })

            it("where head or tail of a multi-line string.", () => {
                const result = format(`${code}\nbar\n${code}`)
                assert(result === `${formatted}bar${formatted}`)
            })

            it("decorate whole a multi-line string.", () => {
                const result = format(code)
                assert(result === formatted)
            })
        })
    })
})
