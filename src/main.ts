#!/usr/bin/env deno run -A

import {
  Command,
  EnumType,
} from "https://deno.land/x/cliffy@v1.0.0-rc.2/command/mod.ts";
import { err, ok, Result } from "npm:neverthrow@6.0.0";
import { LuaFactory } from "npm:wasmoon@1.15.0";
import hljs from "npm:highlight.js@11.8.0";
import shiki from "npm:shiki@0.14.3";

const supportLanguages = {
  hljs: hljs.listLanguages(),
  shiki: shiki.BUNDLED_LANGUAGES.map((l) => [l.id, l.aliases ?? []]).flat(2),
} as const satisfies Record<string, string[]>;

const highlight = new EnumType(Object.keys(supportLanguages));

async function fetchPodiumSource(): Promise<Result<string, Error>> {
  const url = new URL(
    "https://raw.githubusercontent.com/tani/podium/main/lua/podium.lua",
  );
  const response = await fetch(url);
  if (!response.ok) {
    return err(new Error(response.statusText));
  }
  return ok(await response.text());
}

async function exec(
  source: string,
  languages: string[],
): Promise<Result<string, Error>> {
  const luaFactory = new LuaFactory();
  const lua = await luaFactory.createEngine();
  const shebang = "#!/usr/bin/env lua";
  const fetchResult = await fetchPodiumSource();
  if (fetchResult.isErr()) {
    return fetchResult;
  }
  const code = fetchResult.value.replace(
    shebang,
    "",
  );
  try {
    const pod = await lua.doString(code);
    const fence = "```";
    const EOL = Deno.build.os === "windows" ? "\r\n" : "\n";
    for (const language of languages) {
      pod.PodiumBackend.registerSimpleDataParagraph(
        "markdown",
        language,
        (arg: string) => {
          return [`${fence}${language}`, arg.trim(), fence].join(EOL);
        },
      );
    }

    return ok(pod.process("markdown", source));
  } catch (e: unknown) {
    return err(new Error("Fail in calling lua function", { cause: e }));
  } finally {
    lua.global.close();
  }
}

async function getSource(
  stdin: boolean,
  filename?: string,
): Promise<Result<string, Error>> {
  if (stdin) {
    const decoder = new TextDecoder();
    const buf: string[] = [];
    for await (const chunk of Deno.stdin.readable) {
      buf.push(decoder.decode(chunk));
    }
    return ok(buf.join(""));
  }
  if (filename === undefined) {
    return err(new Error(`filename must be specify`));
  }
  return ok(Deno.readTextFileSync(filename));
}

if (import.meta.main) {
  const { options } = await new Command()
    .name("sample")
    .type("highlight", highlight)
    .option("--in <in:string>", "input filepath", {
      conflicts: ["--stdin"],
      required: true,
    })
    .option("--stdin", "use stdin", {
      conflicts: ["in"],
      default: false,
      required: true,
    })
    .option("--out <out:string>", "output filename")
    .option("--highlight <highlight:highlight>", "highlight library name", {
      default: "hljs",
    })
    .parse(Deno.args);

  const r = await getSource(options.stdin, options.in);
  if (r.isErr()) {
    console.error(r.error);
    Deno.exit(1);
  }

  const rr = await exec(
    r.value,
    // @ts-ignore: umm...
    supportLanguages[options.highlight] ?? [],
  );
  if (rr.isErr()) {
    console.error(rr.error);
    Deno.exit(1);
  }

  if (options.out !== undefined) {
    Deno.writeTextFileSync(options.out, rr.value);
  } else {
    console.log(rr.value);
  }
}
