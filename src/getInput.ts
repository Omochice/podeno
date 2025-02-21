import { ResultAsync } from "npm:neverthrow@8.2.0";
import { toError } from "./error.ts";

type Option = {
  stdin: true;
} | {
  stdin: false;
  in: string;
};

/**
 * Get input string from file or stdin
 */
export function getInput(option: Option): ResultAsync<string, Error> {
  return (option.stdin ? fromStdin() : fromFile(option.in));
}

function fromStdin(): ResultAsync<string, Error> {
  const r = new Response(Deno.stdin.readable);
  return ResultAsync.fromPromise(
    r.text(),
    toError("Failed to load from stdin"),
  );
}

function fromFile(filename: string): ResultAsync<string, Error> {
  return ResultAsync.fromPromise(
    Deno.readTextFile(filename),
    toError(`File: ${filename} is missing`),
  );
}
