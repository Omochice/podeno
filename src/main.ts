#!/usr/bin/env deno run -A

import {
  Command,
  EnumType,
} from "https://deno.land/x/cliffy@v1.0.0-rc.2/command/mod.ts";
import { colors } from "https://deno.land/x/cliffy@v1.0.0-rc.2/ansi/colors.ts";
import { err, Ok, ok, Result } from "npm:neverthrow@6.0.0";
import { LuaFactory } from "npm:wasmoon@1.15.0";
import hljs from "npm:highlight.js@11.8.0";
import shiki from "npm:shiki@0.14.3";

const supportLanguages = {
  hljs: hljs.listLanguages(),
  shiki: shiki.BUNDLED_LANGUAGES.map((l) => [l.id, l.aliases ?? []]).flat(2),
} as const satisfies Record<string, string[]>;
type Highlighter = keyof typeof supportLanguages;

const highlight = new EnumType<Highlighter>(["shiki", "hljs"]);

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
  try {
    return ok(Deno.readTextFileSync(filename));
  } catch (e: unknown) {
    return err(new Error(`File: ${filename} is missing`, { cause: e }));
  }
}

const ExitCode = {
  Success: 0,
  Failure: 1,
} as const;
type ExitCode = typeof ExitCode[keyof typeof ExitCode];

type CommandLineOption = {
  stdin: true;
  out?: string;
} | {
  in: string;
  stdin: false;
  out?: string;
};

type MarkdownOption = {
  to: "markdown";
  highlighter: keyof typeof supportLanguages;
};

type VimdocOption = {
  to: "vimdoc";
};

type Option = (MarkdownOption | VimdocOption) & CommandLineOption;

async function exec(option: Option): Promise<Result<string, Error>> {
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

  const sourceResult =
    await (option.stdin
      ? getSource(option.stdin)
      : getSource(option.stdin, option.in));
  if (sourceResult.isErr()) {
    return sourceResult;
  }

  try {
    const pod = await lua.doString(code);
    const fence = "```";
    const EOL = Deno.build.os === "windows" ? "\r\n" : "\n";
    if (option.to === "markdown") {
      for (const language of supportLanguages[option.highlighter]) {
        pod.PodiumBackend.registerSimpleDataParagraph(
          "markdown",
          language,
          (arg: string) => {
            console.log("hi", arg);
            return [`${fence}${language}`, arg.trim(), fence].join(EOL);
          },
        );
      }
    }
    return ok(pod.process(option.to, sourceResult.value));
  } catch (e: unknown) {
    return err(new Error("Fail in calling lua function", { cause: e }));
  } finally {
    lua.global.close();
  }
}

async function hoge(option: Option): Promise<Ok<string, Error>> {
  const result = await exec(option);
  if (result.isErr()) {
    throw result.error;
  }
  return result;
}

async function main(): Promise<ExitCode> {
  const markdown = new Command()
    .error((err, cmd) => {
      console.error(colors.red(err.message));
      cmd.showHelp();
      Deno.exit(ExitCode.Failure);
    })
    .type("highlight", highlight)
    .option(
      "--in <in:string>",
      "input filepath",
      {
        conflicts: ["--stdin"],
        required: true,
      },
    )
    .option(
      "--stdin",
      "use stdin",
      {
        conflicts: ["in"],
        default: false,
        required: true,
      },
    )
    .option(
      "--out <out:string>",
      "output filename",
    )
    .option(
      "--highlight <highlight:highlight>",
      "highlight library name",
      {
        default: "hljs",
      },
    )
    .action(async (opt) => {
      const res = await hoge({
        to: "markdown",
        ...opt,
        // @ts-ignore: unko
        highlighter: opt.highlight,
      });
      console.log(res.value);
    });
  const vimdoc = new Command()
    .error((err, cmd) => {
      console.error(colors.red(err.message));
      cmd.showHelp();
      Deno.exit(ExitCode.Failure);
    })
    .option(
      "--in <in:string>",
      "input filepath",
      {
        conflicts: ["--stdin"],
        required: true,
      },
    )
    .option(
      "--stdin",
      "use stdin",
      {
        conflicts: ["in"],
        default: false,
        required: true,
      },
    )
    .option(
      "--out <out:string>",
      "output filename",
    )
    .action((opt) => {
      throw new Error("sample vimdoc");
    });

  await new Command()
    .name("sample")
    .command("markdown", markdown)
    .command("vimdoc", vimdoc)
    .reset()
    .parse(Deno.args);

  Deno.exit(0);
  // console.log(options, cmd);
  // const { options } = opt;
  const r = await getSource(options.stdin, options.in);
  if (r.isErr()) {
    console.error(r.error);
    return ExitCode.Failure;
  }

  const rr = await exec(
    r.value,
    // @ts-ignore: umm...
    supportLanguages[options.highlight] ?? [],
  );
  if (rr.isErr()) {
    console.error(rr.error);
    return ExitCode.Failure;
  }

  if (options.out !== undefined) {
    Deno.writeTextFileSync(options.out, rr.value);
  } else {
    console.log(rr.value);
  }
  return ExitCode.Success;
}

if (import.meta.main) {
  Deno.exit(await main());
}
