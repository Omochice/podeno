import { err, Ok, ok, Result } from "npm:neverthrow@6.0.1-0";

type Option = {
  stdin: true;
} | {
  stdin: false;
  in: string;
};

/**
 * Get input string from file or stdin
 */
export async function getInput(option: Option): Promise<Result<string, Error>> {
  return await (option.stdin ? fromStdin() : fromFile(option.in));
}

async function fromStdin(): Promise<Ok<string, never>> {
  const decoder = new TextDecoder();
  const buf: string[] = [];
  for await (const chunk of Deno.stdin.readable) {
    buf.push(decoder.decode(chunk));
  }
  return ok(buf.join(""));
}

async function fromFile(filename: string): Promise<Result<string, Error>> {
  try {
    return ok(await Deno.readTextFile(filename));
  } catch (e: unknown) {
    return err(new Error(`File: ${filename} is missing`, { cause: e }));
  }
}
