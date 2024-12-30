import { errAsync, okAsync, ResultAsync } from "npm:neverthrow@8.1.1";
import { join } from "jsr:@std/url@0.225.1/join";
import { is } from "jsr:@core/unknownutil@4.3.0";
import { toError } from "./error.ts";

const github = "https://raw.githubusercontent.com/";

const repo = "tani/podium";

const branch = "main";

const path = "lua/podium.lua";

/**
 * Fetch tani/podium
 *
 * @return Result of fetch
 */
export function fetchPodium(): ResultAsync<string, Error> {
  const url = join(github, repo, branch, path);
  return ResultAsync.fromPromise(
    fetch(url),
    toError(`Failed to fetch podium from ${url.href}`),
  )
    .andThen((r) => r.ok ? okAsync(r) : errAsync(r))
    .andThen((r) =>
      ResultAsync.fromPromise(
        r.text(),
        toError("Failed to extract text from Response"),
      )
    )
    .andThen((r: unknown) =>
      is.String(r)
        ? okAsync(trimShebang(r))
        : errAsync(toError(`Extracted is not string: ${r}`)(r))
    )
    .mapErr((r: Response | Error): Error => {
      if (r instanceof Error) {
        return r;
      }
      return toError([`${r.status}`, r.statusText].join(" "))(r);
    });
}

function trimShebang(code: string): string {
  const shebang = "#!/usr/bin/env lua";
  return code.replace(shebang, "");
}
