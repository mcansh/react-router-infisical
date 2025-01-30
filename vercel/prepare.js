import * as fsp from "node:fs/promises";

let fspOptions = { recursive: true };

await fsp.rm(".vercel", fspOptions).catch(() => {});
await fsp.mkdir(".vercel/output/static", fspOptions);

await fsp.cp("vercel/output/", ".vercel/output", fspOptions);
await Promise.all([
  fsp.cp("build/client/", ".vercel/output/static", fspOptions),
  fsp.cp("build/server/", ".vercel/output/functions/index.func", fspOptions),
]);
