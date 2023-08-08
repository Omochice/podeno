import { err, ok, Result } from "npm:neverthrow@6.0.1-0";

/**
 * Fetch tani/podium
 *
 * @return Result of fetch
 */
export async function fetchPodium(): Promise<Result<string, Error>> {
  const url = new URL(
    "https://raw.githubusercontent.com/tani/podium/main/lua/podium.lua",
  );
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
