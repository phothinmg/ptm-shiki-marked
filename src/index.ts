import { MarkedExtension } from "marked";

type HighlightFunction = (code: string, language: any) => string;

export type Options = {
  shikiHighlight: HighlightFunction;
  shikiTwoslash?: HighlightFunction;
  colorizedBrackets?: HighlightFunction;
  codeContainer?: string;
};

export function shikiMarked({
  shikiHighlight,
  shikiTwoslash,
  colorizedBrackets,
  codeContainer,
}: Options): MarkedExtension {
  return {
    walkTokens(token) {
      if (token.type === "code") {
        const lanTexts: any[] = token.lang.split(" ");
        const lang = lanTexts[0];
        const isTwo =
          shikiTwoslash && lanTexts.length > 1 && lanTexts.includes("twoslash");
        const isBrackets =
          colorizedBrackets &&
          lanTexts.length > 1 &&
          lanTexts.includes("colorize-brackets");
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
