import { Command } from "https://deno.land/x/cliffy@v1.0.0-rc.7/command/mod.ts";
import { colors } from "https://deno.land/x/cliffy@v1.0.0-rc.7/ansi/colors.ts";
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
