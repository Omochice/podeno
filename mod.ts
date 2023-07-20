#!/usr/bin/env -S deno run --allow-read --allow-net --allow-write

import { main } from "./src/main.ts";

if (import.meta.main) {
  await main();
}
