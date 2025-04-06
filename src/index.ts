import { MarkedExtension } from "marked";
import * as shiki from "shiki";

export type ShikiMarkedOptions = {
  hightlighter: shiki.Highlighter;
  themes: {
    light: shiki.BundledTheme;
    dark: shiki.BundledTheme;
  };
  codeContainer?: string;
  transformers?: shiki.ShikiTransformer[];
  twoslashTransformers?: shiki.ShikiTransformer[];
  colorizedBracketsTransformers?: shiki.ShikiTransformer[];
};

/**
 * A marked extension for Shiki.js.
 *
 * @param {ShikiMarkedOptions} opts
 * @param {shiki.Highlighter} opts.hightlighter
 * @param {{light: shiki.BundledTheme, dark: shiki.BundledTheme}} opts.themes
 * @param {shiki.ShikiTransformer[]} opts.transformers
 * @param {shiki.ShikiTransformer[]} [opts.twoslashTransformers]
 * @param {shiki.ShikiTransformer[]} [opts.colorizedBracketsTransformers]
 * @param {string} [opts.codeContainer]
 * @returns {MarkedExtension}
 */
export function shikiMarked({
  hightlighter,
  themes,
  transformers,
  twoslashTransformers,
  colorizedBracketsTransformers,
  codeContainer,
}: ShikiMarkedOptions): MarkedExtension {
  const shikiHighlight = (code: string, lang: shiki.BundledLanguage) => {
    return hightlighter.codeToHtml(code, {
      lang: lang,
      themes: {
        light: themes.light,
        dark: themes.dark,
      },
      transformers: [...transformers],
    });
  };
  const colorizedBrackets = (code: string, lang: shiki.BundledLanguage) => {
    return hightlighter.codeToHtml(code, {
      lang: lang,
      themes: {
        light: themes.light,
        dark: themes.dark,
      },
      transformers: [...colorizedBracketsTransformers],
    });
  };
  const shikiTwoslash = (code: string, lang: shiki.BundledLanguage) => {
    return hightlighter.codeToHtml(code, {
      lang: lang,
      themes: {
        light: themes.light,
        dark: themes.dark,
      },
      transformers: [...twoslashTransformers],
    });
  };
  return {
    walkTokens(token) {
      if (token.type === "code") {
        const lanTexts: any[] = token.lang.split(" ");
        const lang = lanTexts[0];
        const isTwo = lanTexts.length > 1 && lanTexts.includes("twoslash");
        const isBrackets =
          lanTexts.length > 1 && lanTexts.includes("colorize-brackets");
        const code = token.text;
        const highlighted = isTwo
          ? shikiTwoslash(code, lang)
          : isBrackets
          ? colorizedBrackets(code, lang)
          : shikiHighlight(code, lang);
        const _html = !codeContainer
          ? highlighted
          : codeContainer
              .replace("%lang", highlighted)
              .replace("%code", highlighted);
        Object.assign(token, {
          type: "html",
          block: true,
          text: `${_html}\n`,
        });
      }
    },
  };
}
