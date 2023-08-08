# Podeno

Convert pod file to other format by [podium](https://github.com/tani/podium).

This support to highlight like highlight.js, shiki etc.

## Required permissions

- `--allow-net`: to fetch `podium` from [https://github.com/tani/podium](https://github.com/tani/podium).
- `--allow-read`: to read input file.
- `--allow-write`: to write output file.

## Installation

If you execute below, you can execute `podeno`.

```shell
$ deno install --allow-net --allow-read --allow-write https://pax.deno.dev/Omochice/podeno/cli.ts
```

## Usage

If you want to convert pod to markdown named as `sample.pod`:

```shell
$ podeno markdown --in sample.pod
```

This tool has below commands:

- markdown
    - Convert pod text to markdown.
    - This command has some option:
        - `--in [path/to/pod]`: Use `path/to/pod` as input.
        - `--stdin`: Use stdin as input.
        - `--out [path/to/file]`: Write output to `path/to/file`. (optional)
        - `--highlight [highlight plugin name]`: Specify highlight plugin. (default: `"hljs"`)
    

- vimdoc
    - Convert pod text to vimdoc.
    - This command has some option:
        - `--in [path/to/pod]`: Use `path/to/pod` as input.
        - `--stdin`: Use stdin as input.
        - `--out [path/to/file]`: Write output to `path/to/file`. (optional)
    


See `deno run --allow-read --allow-net --allow-write podeno --help` more...

