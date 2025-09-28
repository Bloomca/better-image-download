import * as esbuild from "esbuild";
import { writeFile, readFile, rm } from "node:fs/promises";
import * as path from "node:path";

import { fileURLToPath } from "url";

const CHROME_DIR = "chrome";
const FIREFOX_DIR = "firefox";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

await cleanDistDirectory();

await buildTypeScriptFiles(CHROME_DIR);
await buildTypeScriptFiles(FIREFOX_DIR);

await writeManifest(CHROME_DIR);
await writeManifest(FIREFOX_DIR);

/**
 * Chrome and Firefox manifests are slightly different, so we generate
 * them separately
 */
async function writeManifest(type) {
  const manifestPath = path.join(__dirname, "src", "manifest.json");
  const manifest = JSON.parse(
    await readFile(new URL(manifestPath, import.meta.url))
  );

  if (type === CHROME_DIR) {
    delete manifest.background.scripts;
  } else {
    delete manifest.background.service_worker;
  }

  writeFile(
    path.join(__dirname, "dist", type, "manifest.json"),
    JSON.stringify(manifest, null, 2)
  );
}

function cleanDistDirectory() {
  return rm(path.join(__dirname, "dist"), { recursive: true, force: true });
}

function buildTypeScriptFiles(type) {
  return esbuild.build({
    entryPoints: ["src/main.ts"],
    bundle: true,
    outdir: `dist/${type}`,
  });
}
