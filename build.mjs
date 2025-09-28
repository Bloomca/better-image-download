import * as esbuild from "esbuild";
import { writeFile, readFile } from "node:fs/promises";
import * as path from "node:path";

import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// duplication, but it is fast enough not to worry about it
await esbuild.build({
  entryPoints: ["src/main.ts"],
  bundle: true,
  outdir: "dist/chrome",
});

await esbuild.build({
  entryPoints: ["src/main.ts"],
  bundle: true,
  outdir: "dist/firefox",
});

await writeManifest("chrome");
await writeManifest("firefox");

/**
 * Chrome and Firefox manifests are slightly different, so we generate
 * them separately
 */
async function writeManifest(type) {
  const staticDir = path.join(__dirname, "src", "static");
  const manifestPath = path.join(staticDir, "manifest.json");
  const manifest = JSON.parse(
    await readFile(new URL(manifestPath, import.meta.url))
  );

  if (type === "chrome") {
    delete manifest.background.scripts;
  } else {
    delete manifest.background.service_worker;
  }

  writeFile(
    path.join(__dirname, "dist", type, "manifest.json"),
    JSON.stringify(manifest, null, 2)
  );
}
