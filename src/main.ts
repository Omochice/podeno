import { Command } from "https://deno.land/x/cliffy@v1.0.0-rc.2/command/mod.ts";
import { command as markdown } from "./subcmd/markdown.ts";
import { command as vimdoc } from "./subcmd/vimdoc.ts";
import { ExitCode } from "./exitCode.ts";

export async function main(): Promise<ExitCode> {
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
