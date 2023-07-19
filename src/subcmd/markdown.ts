import { Command } from "https://deno.land/x/cliffy@v1.0.0-rc.2/command/mod.ts";
import { colors } from "https://deno.land/x/cliffy@v1.0.0-rc.2/ansi/colors.ts";
import { ExitCode } from "../exitCode.ts";
import { execPodium } from "../lua.ts";
import { highlight } from "../highlight.ts";
import { getInput } from "../getInput.ts";

export const command = new Command()
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
    const inputResult = await getInput({
      stdin: opt.stdin,
      // @ts-ignore: ensure by command
      in: opt.in,
    });
    if (inputResult.isErr()) {
      throw inputResult.error;
    }
    const podiumResult = await execPodium(
      inputResult.value,
      "markdown",
      {
        // @ts-ignore: ensure by command
        highlighter: opt.highlight,
      },
    );
    if (podiumResult.isErr()) {
      throw podiumResult.error;
    }
    console.log(podiumResult.value);
    Deno.exit(ExitCode.Success);
  });
