import { LuaFactory } from "npm:wasmoon@1.16.0";
import { errAsync, okAsync, ResultAsync } from "npm:neverthrow@8.1.1";
import { SupportLanguage } from "./supportLanguage.ts";
import { converter, highlightableLanguages, Highlighter } from "./highlight.ts";
import { fetchPodium } from "./fetchPodium.ts";
import { toError } from "./error.ts";

export function execPodium(
  inputString: string,
  convertTo: SupportLanguage,
  option?: {
    highlighter?: Highlighter;
  },
): ResultAsync<string, Error> {
  const luaFactory = new LuaFactory();
  return ResultAsync.combine([
    ResultAsync.fromPromise(
      luaFactory.createEngine(),
      toError("Failed to create lua vm"),
    ),
    fetchPodium(),
  ])
    .andThen(([lua, code]) => {
      const mergedOption = { highlighter: "hljs", ...option };
      const filetypes = highlightableLanguages
        .get(mergedOption.highlighter) ?? [];
      // NOTE: use try-catch-finally because of need to use `finally`
      try {
        const pod = lua.doStringSync(code);
        for (const ft of filetypes) {
          pod.PodiumBackend.registerSimpleDataParagraph(
            convertTo,
            ft,
            converter[convertTo](ft),
          );
        }
        return okAsync(pod.process(convertTo, inputString));
      } catch (e) {
        return errAsync(
          new Error("Fail in calling lua function", { cause: e }),
        );
      } finally {
        lua.global.close();
      }
    });
}
