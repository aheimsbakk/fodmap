// build.mjs — generate index.html, css/tokens.css, css/roles.css from
// config.json + data. During the spike it writes to a directory OUTSIDE src so
// the output can be diffed against the hand-authored files before the blueprint
// is updated.
import { mkdirSync, writeFileSync, readFileSync } from "fs";
import { resolve, join } from "path";
import { loadItems } from "./lib/merge.js";
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
  const items = loadItems([join(ROOT, "data", "2021")], sections);

  const html = renderDocument(cfg, items, version);
  const tokens = renderTokens(cfg);
  const roles = renderRoleSectionCss(cfg);
  return { html, tokens, roles, cfg, version };
}

// CLI entry: node scripts/build.mjs <out-dir>
const [, , outArg] = process.argv;
if (outArg) {
  const outDir = resolve(outArg);
  const { html, tokens, roles } = build();
  mkdirSync(join(outDir, "css"), { recursive: true });
  writeFileSync(join(outDir, "index.html"), html, "utf8");
  writeFileSync(join(outDir, "css", "tokens.css"), tokens, "utf8");
  writeFileSync(join(outDir, "css", "roles.css"), roles, "utf8");
  console.log("Wrote index.html, css/tokens.css, css/roles.css to", outDir);
}
