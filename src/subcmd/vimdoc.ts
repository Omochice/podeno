import { Command } from "jsr:@cliffy/command@1.0.0";
import { colors } from "jsr:@cliffy/ansi@1.0.0/colors";
import { ExitCode } from "../exitCode.ts";
import { execPodium } from "../lua.ts";
import { getInput } from "../getInput.ts";

export const command = new Command()
  .description("Convert pod to vimdoc.")
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
  .action(async (opt) => {
    await getInput({
      stdin: opt.stdin,
      // @ts-ignore: ensure by command
      in: opt.in,
    })
      .andThen((input) =>
        execPodium(
          input,
          "vimdoc",
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
