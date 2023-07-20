import { Command } from "https://deno.land/x/cliffy@v1.0.0-rc.2/command/mod.ts";
import { command as markdown } from "./subcmd/markdown.ts";
import { command as vimdoc } from "./subcmd/vimdoc.ts";
import { ExitCode } from "./exitCode.ts";

export async function main(): Promise<ExitCode> {
  await new Command()
    .name("podeno")
    .command("markdown", markdown)
    .command("vimdoc", vimdoc)
    .reset()
    .parse(Deno.args);

  Deno.exit(1);
}
