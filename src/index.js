/**
 * Inspired by https://github.com/bent10/marked-extensions/tree/main/packages/shiki
 * @license MIT
 */

/** @typedef {(code:string,language:string)=> string} HighlightFunction */

/**
 * @typedef Options
 * @property {HighlightFunction} highlight
 * @property {HighlightFunction} [twoslash]
 * @property {string} [codeContainer]
 */

/**
 * Returns a marked extension that highlights fenced code blocks using the given
 * highlighter function(s).
 *
 * @param {Options} options
 * @param {HighlightFunction} options.highlight
 * The function to use for highlighting. This function receives a code string and
 * a language string as arguments and should return the highlighted code as a string.
 * @param {HighlightFunction} [options.twoslash]
 * An optional second highlighter that will be used for code blocks that include
 * the "twoslash" keyword in their language string. This function is called with the
 * same arguments as the highlighter function.
 * @param {string} [options.codeContainer]
 * An optional string that can be used to wrap the highlighted code. This string
 * should include the placeholders "%code" and "%lang". The highlighted code will
 * be inserted in place of "%code" and the language string will be inserted in
 * place of "%lang".
 * @returns {import("marked").MarkedExtension}
 */
export function shikiMarked({ highlight, twoslash, codeContainer }) {
  return {
    walkTokens(token) {
      if (token.type === "code") {
        /** @type {string[]} */
        const lanTexts = token.lang.split(" ");
        const lang = lanTexts[0];
        const isTwo =
          twoslash && lanTexts.length > 1 && lanTexts.includes("twoslash");
        const code = token.text;
        const highlighted = isTwo
          ? twoslash(code, lang)
          : highlight(code, lang);
        const html = !codeContainer
          ? highlighted
          : codeContainer.replace("%code", highlighted).replace("%lang", lang);
        Object.assign(token, {
          type: "html",
          block: true,
          text: `${html}\n`,
        });
      }
    },
  };
}
