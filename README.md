# Podeno

Convert pod file to other format with highlight plugin.

## Usage

If you want to convert pod to markdown named as `sample.pod`:

```shell
$ deno run --allow-read --allow-net --allow-write https://pax.deno.dev/Omochice/podeno markdown --in sample.pod
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
    


See `deno run --allow-read --allow-net --allow-write https://pax.deno.dev/Omochice/podeno --help` more...

