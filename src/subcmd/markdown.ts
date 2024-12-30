import { Command } from "jsr:@cliffy/command@1.0.0-rc.7";
import { colors } from "jsr:@cliffy/ansi@1.0.0-rc.7/colors";
import { ExitCode } from "../exitCode.ts";
import { execPodium } from "../lua.ts";
import { highlight } from "../highlight.ts";
import { getInput } from "../getInput.ts";

export const command = new Command()
  .description("Convert pod to markdown.")
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
    await getInput({
      stdin: opt.stdin,
      // @ts-ignore: ensure by command
      in: opt.in,
    })
      .andThen((input) =>
        execPodium(
          input,
          "markdown",
          {
            // @ts-ignore: ensure by command
            highlighter: opt.highlight,
          },
        )
      )
      .match(
        (result) => {
          if (typeof opt.out === "string") {
            Deno.writeTextFileSync(opt.out, result);
          } else {
            console.log(result);
          }
          Deno.exit(ExitCode.Success);
        },
        (err) => {
          throw err;
        },
      );
  });
