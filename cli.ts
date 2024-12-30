#!/usr/bin/env -S deno run --allow-read --allow-net --allow-write

import { Command } from "jsr:@cliffy/command@1.0.0-rc.7";
import { command as markdown } from "./src/subcmd/markdown.ts";
import { command as vimdoc } from "./src/subcmd/vimdoc.ts";
import { ExitCode } from "./src/exitCode.ts";

async function main(): Promise<ExitCode> {
  const { cmd } = await new Command()
    .name("podeno")
    .usage("<command> [flags]")
    .description("Convert pod file to other format with highlight plugin.")
    .command("markdown", markdown)
    .command("vimdoc", vimdoc)
    .parse(Deno.args);

  cmd.showHelp();
  Deno.exit(1);
}

if (import.meta.main) {
  await main();
}
