import { EnumType } from "https://deno.land/x/cliffy@v1.0.0-rc.3/command/mod.ts";
import hljs from "npm:highlight.js@11.9.0";
import shiki from "npm:shiki@0.14.7";
import { SupportLanguage } from "./supportLanguage.ts";
import { EOL, indent } from "./indent.ts";

export const highlightableLanguages = new Map([
  ["hljs", hljs.listLanguages()],
  [
    "shiki",
    shiki.BUNDLED_LANGUAGES
      .map((l) => [l.id, l.aliases ?? []])
      .flat(2),
  ],
]);

const Highlighter = ["shiki", "hljs"] as const;
export type Highlighter = typeof Highlighter[number];

export const highlight = new EnumType(Highlighter);

const fence = "```";

export const converter: Record<
  SupportLanguage,
  (ft: string) => (text: string) => string
> = {
  markdown: (ft: string) => {
    return (text: string) =>
      [`${fence}${ft}`, text.trim(), fence, "", ""].join(EOL);
  },
  vimdoc: (_ft: string) => {
    return (text: string) => {
      return [`>`, indent(text.trim()), `<`, "", ""].join(EOL);
    };
  },
};
