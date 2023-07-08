#!/usr/bin/env deno run -A

import {
  Command,
  EnumType,
} from "https://deno.land/x/cliffy@v1.0.0-rc.2/command/mod.ts";
import { LuaFactory } from "npm:wasmoon@1.15.0";
import hljs from "npm:highlight.js@11.8.0";
import shiki from "npm:shiki@0.14.3";

const supportLanguages = {
  hljs: hljs.listLanguages(),
  shiki: shiki.BUNDLED_LANGUAGES.map((l) => [l.id, l.aliases ?? []]).flat(2),
} as const satisfies Record<string, string[]>;

const highlight = new EnumType(Object.keys(supportLanguages));

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
  const { options } = await new Command()
    .name("sample")
    .type("highlight", highlight)
    .option("--in <in:string>", "input filepath", {
      conflicts: ["--stdin"],
      required: true,
    })
    .option("--stdin [stdin:boolean]", "use stdin", {
      conflicts: ["in"],
      default: false,
      required: true,
    })
    .option("--out <out:string>", "output filename")
    .option("--highlight <highlight:highlight>", "highlight library name", {
      default: "hljs",
    })
    .parse(Deno.args);

  const md = await exec(
    await getSource(options.stdin, options.in),
    // @ts-ignore: umm...
    supportLanguages[options.highlight] ?? [],
  );

  if (options.out !== undefined) {
    Deno.writeTextFileSync(options.out, md);
  } else {
    console.log(md);
  }
}
