import { EnumType } from "jsr:@cliffy/command@1.0.0-rc.7";
import hljs from "npm:highlight.js@11.11.1";
import { bundledLanguagesInfo } from "npm:shiki@2.4.1/bundle/full";
import { SupportLanguage } from "./supportLanguage.ts";
import { EOL, indent } from "./indent.ts";

export const highlightableLanguages = new Map([
  ["hljs", hljs.listLanguages()],
  [
    "shiki",
    bundledLanguagesInfo
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
