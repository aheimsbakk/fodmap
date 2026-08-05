// build.mjs — generate index.html, css/tokens.css, css/roles.css from
// config.json + data. It writes the three generated artifacts directly into
// the site directory (BLUEPRINT §12.2 deviation 16): merge the release
// folders oldest → newest, then render the document and the two generated
// stylesheet layers. The hand-authored document was retired at the end of
// the migration.
import { mkdirSync, writeFileSync, readFileSync } from "fs";
import { resolve, join } from "path";
import { listReleases, loadItems } from "./lib/merge.js";
import { renderDocument } from "./lib/render-html.js";
import { renderTokens } from "./lib/render-tokens.js";
import { renderRoleSectionCss } from "./lib/render-css.js";

const ROOT = resolve(import.meta.dirname, "..", "..");

export function build() {
  const cfg = JSON.parse(
    readFileSync(join(ROOT, "data", "config.json"), "utf8"),
  );
  const version = readFileSync(join(ROOT, "VERSION"), "utf8").trim();
  const sections = new Set(cfg.sections.map((s) => s.id));
  const releaseDirs = listReleases(join(ROOT, "data"));
  if (releaseDirs.length === 0) {
    throw new Error(
      "No release folders found under data/ (expected YYYY, YYYY-MM, or YYYY-MM-DD folders)",
    );
  }
  const items = loadItems(releaseDirs, sections);

  const html = renderDocument(cfg, items, version);
  const tokens = renderTokens(cfg);
  const roles = renderRoleSectionCss(cfg);
  return { html, tokens, roles, cfg, version };
}

// CLI entry: node scripts/build/build.mjs <out-dir>. The argv[1] guard keeps
// the CLI inert when the module is imported by tests (build.test.js).
const [, , outArg] = process.argv;
if (outArg && process.argv[1]?.endsWith("build.mjs")) {
  const outDir = resolve(outArg);
  const { html, tokens, roles } = build();
  mkdirSync(join(outDir, "css"), { recursive: true });
  writeFileSync(join(outDir, "index.html"), html, "utf8");
  writeFileSync(join(outDir, "css", "tokens.css"), tokens, "utf8");
  writeFileSync(join(outDir, "css", "roles.css"), roles, "utf8");
  console.log("Wrote index.html, css/tokens.css, css/roles.css to", outDir);
}
