import { LuaFactory } from "npm:wasmoon@1.15.0";
import { err, ok, Result } from "npm:neverthrow@6.0.1-0";
import { SupportLanguage } from "./supportLanguage.ts";
import { converter, highlightableLanguages, Highlighter } from "./highlight.ts";
import { fetchPodium } from "./fetchPodium.ts";

export async function execPodium(
  inputString: string,
  convertTo: SupportLanguage,
  option?: {
    highlighter?: Highlighter;
  },
): Promise<Result<string, Error>> {
  const code = await fetchPodium();
  if (code.isErr()) {
    return err(new Error("fetch error", { cause: code.error }));
  }

  const mergedOption = { highlighter: "hljs", ...option };
  const filetypes = highlightableLanguages
    .get(mergedOption.highlighter) ?? [];
  const luaFactory = new LuaFactory();
  const lua = await luaFactory.createEngine();

  try {
    const pod = await lua.doString(code.value);
    for (const ft of filetypes) {
      pod.PodiumBackend.registerSimpleDataParagraph(
        convertTo,
        ft,
        converter[convertTo](ft),
      );
    }
    return ok(pod.process(convertTo, inputString));
  } catch (e: unknown) {
    return err(new Error("Fail in calling lua function", { cause: e }));
  } finally {
    lua.global.close();
  }
}
