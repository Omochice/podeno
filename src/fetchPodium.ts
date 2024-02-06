import { errAsync, okAsync, ResultAsync } from "npm:neverthrow@6.1.0";
import { join } from "https://deno.land/std@0.209.0/url/join.ts";
import { is } from "https://deno.land/x/unknownutil@v3.15.0/mod.ts";
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
