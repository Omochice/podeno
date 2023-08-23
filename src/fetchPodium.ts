import { err, ok, Result } from "npm:neverthrow@6.0.1-0";
import { join } from "https://deno.land/std@0.199.0/path/mod.ts";

const github = "https://raw.githubusercontent.com/";

const repo = "tani/podium";

const branch = "main";

const path = "lua/podium.lua";

/**
 * Fetch tani/podium
 *
 * @return Result of fetch
 */
export async function fetchPodium(): Promise<Result<string, Error>> {
  const url = new URL(join(github, repo, branch, path));
  const response = await fetch(url);
  if (!response.ok) {
    return err(new Error(response.statusText));
  }
  return ok(trimShebang(await response.text()));
}

function trimShebang(code: string): string {
  const shebang = "#!/usr/bin/env lua";
  return code.replace(shebang, "");
}
