/** End of line */
export const EOL = Deno.build.os === "windows" ? "\r\n" : "\n";

/**
 * Dedent string
 *
 * @param str target string
 * @return Dedented one
 * @example
 * ```ts
 * dedent("  sample\n  sample\n  sample")
 * // => "sample\nsample\nsample"
 * dedent(" sample\n  sample\n  sample")
 * // => "sample\n sample\n sample"
 * ```
 * @note from https://github.com/c4spar/deno-cliffy/blob/6f3ba2959f4d78973ec2a51bc8654df82556629d/command/_utils.ts#L139
 */
export function dedent(str: string): string {
  const lines = str.split(/\r?\n|\r/g);
  const headLength = Math.min(
    ...lines.map((l) => l.match(/^\s+/)?.[0].length ?? 0),
  );
  const re = new RegExp(`^\\s{${headLength}}`);
  return lines.map((l) => l.replace(re, "")).join(EOL);
}

/**
 * Indent string
 *
 * @param str target string
 * @param indentString string used for indent
 * @return indented one
 * @example
 * ```ts
 * indent("foo\nbar")
 * => "\tfoo\n\tbar"
 * indent("foo\nbar", "000")
 * => "000foo\n000bar"
 * ```
 */
export function indent(str: string, indentString = "\t"): string {
  const lines = str.split(/\r?\n|\r/g);
  return lines
    .map((l) => `${indentString}${l}`)
    .join(EOL)
    .trimEnd();
}
