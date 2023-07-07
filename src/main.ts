#!/usr/bin/env deno run -A

import yargs from "https://deno.land/x/yargs@v17.7.2-deno/deno.ts";
import { LuaFactory } from "npm:wasmoon@1.15.0";
import hljs from "npm:highlight.js@11.8.0";
import shiki from "npm:shiki@0.14.3";

const highlighter = {
  hljs: hljs.listLanguages(),
  shiki: shiki.BUNDLED_LANGUAGES.map((l) => [l.id, l.aliases ?? []]).flat(2),
} as const satisfies Record<string, string[]>;

async function fetchPodiumSource(): Promise<string> {
  const url = new URL(
    "https://raw.githubusercontent.com/tani/podium/main/lua/podium.lua",
  );
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(response.statusText);
  }
  return await response.text();
}

async function exec(source: string, languages: string[]) {
  const luaFactory = new LuaFactory();
  const lua = await luaFactory.createEngine();
  const shebang = "#!/usr/bin/env lua";
  const code = (await fetchPodiumSource()).replace(
    shebang,
    "",
  );
  try {
    const pod = await lua.doString(code);

    const fence = "```";
    for (const language of languages) {
      pod.PodiumBackend.registerSimpleDataParagraph(
        "markdown",
        language,
        (arg: string) => {
          return [`${fence}${language}`, arg, fence].join("\n");
        },
      );
    }

    return pod.process("markdown", source);
  } finally {
    lua.global.close();
  }
}

async function getSource(stdin: true): Promise<string>;
async function getSource(stdin: false, filename: string): Promise<string>;
async function getSource(stdin: boolean, filename?: string): Promise<string> {
  if (stdin) {
    const decoder = new TextDecoder();
    const buf: string[] = [];
    for await (const chunk of Deno.stdin.readable) {
      buf.push(decoder.decode(chunk));
    }
    return buf.join("");
  }
  if (filename === undefined) {
    return "";
  }
  return Deno.readTextFileSync(filename);
}

if (import.meta.main) {
  const args = yargs(Deno.args)
    .scriptName("sample")
    .strictCommands()
    .boolean("stdin")
    .options({
      in: {
        nargs: 1,
        string: true,
      },
      out: {
        nargs: 1,
        default: undefined,
        string: true,
      },
      highlighter: {
        choices: Object.keys(highlighter),
        default: "hljs",
      },
    })
    .conflicts("stdin", "in")
    .demandOption("stdin", "in")
    .help()
    .parse();

  const md = await exec(
    await getSource(args.stdin, args.in),
    // @ts-ignore: umm...
    highlighter[args.highlighter] ?? [],
  );

  if (args.out !== undefined) {
    Deno.writeTextFileSync(args.out, md);
  } else {
    console.log(md);
  }
}
