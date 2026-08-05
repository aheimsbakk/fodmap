#!/usr/bin/env bash
# build.sh — build the site from the content data into a directory.
#
# Runs the build pipeline (scripts/build/build.mjs) and prints a summary
# of the generated page: version, section/item counts, change markers,
# and the written files with their sizes.
#
# The generated files are committed, so you normally run this after
# changing data/ (see docs/data-lifecycle.md §2.4). The site directory
# defaults to src/, which is also the directory the Pages workflow
# deploys.
#
# Usage:
#   ./scripts/build.sh            # build into src/ (default)
#   ./scripts/build.sh <out-dir>  # build into <out-dir> (relative to the
#                                 # repository root, or an absolute path)
#   ./scripts/build.sh --help     # show this help
#
# Requirements: bash, node >= 20 (the build uses the standard library
# only; no npm install needed).
#
# Exit codes:
#   0  build succeeded, all three artifacts written
#   1  argument, environment, or build failure (reason on stderr)

set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

usage() {
	# Print the header comment block (everything after the shebang up to
	# the first code line) as the help text.
	awk 'NR > 1 { if ($0 ~ /^#/) { sub(/^# ?/, ""); print } else exit }' "${BASH_SOURCE[0]}"
}

if [[ "${1:-}" == "-h" || "${1:-}" == "--help" ]]; then
	usage
	exit 0
fi

if [[ $# -gt 1 ]]; then
	echo "error: too many arguments (expected at most one out-dir)" >&2
	usage >&2
	exit 1
fi

# Node version gate: build.mjs uses import.meta.dirname (Node >= 20.11).
if ! command -v node >/dev/null 2>&1; then
	echo "error: node not found. Install Node.js >= 20 and try again." >&2
	exit 1
fi
node_major="$(node -p 'Number(process.versions.node.split(".")[0])')"
if ((node_major < 20)); then
	echo "error: node $node_major is too old; the build needs Node.js >= 20" >&2
	exit 1
fi

# Resolve the out-dir: an absolute path is used as-is, anything else is
# relative to the repository root, so the script works from any working
# directory. The build creates the directory when it does not exist yet.
if [[ "${1:-}" == /* ]]; then
	out_dir="${1:-}"
else
	out_dir="$repo_root/${1:-src}"
fi
if [[ -e "$out_dir" && ! -d "$out_dir" ]]; then
	echo "error: out-dir exists but is not a directory: $out_dir" >&2
	exit 1
fi

start=$(date +%s)
node "$repo_root/scripts/build/build.mjs" "$out_dir"
elapsed=$(($(date +%s) - start))

# The build output is not prettier-formatted. Format the artifacts with
# the project's prettier (dev dependency) when it is installed, so the
# regenerated files match the committed formatting and the git diff
# stays readable. Without it the build still succeeds; the files are
# simply unformatted.
if [[ -x "$repo_root/node_modules/.bin/prettier" ]]; then
	"$repo_root/node_modules/.bin/prettier" --write \
		"$out_dir/index.html" "$out_dir/css/tokens.css" "$out_dir/css/roles.css" >/dev/null
else
	needs_format=1
fi

# The build prints its own write line; verify all three artifacts exist
# and are non-empty before summarizing.
artifacts=("index.html" "css/tokens.css" "css/roles.css")
for artifact in "${artifacts[@]}"; do
	if [[ ! -s "$out_dir/$artifact" ]]; then
		echo "error: build finished but $out_dir/$artifact is missing or empty" >&2
		exit 1
	fi
done

index="$out_dir/index.html"
version="$(cat "$repo_root/VERSION")"
sections="$(grep -o 'class="category-heading' "$index" | wc -l)"
items="$(grep -o 'class="item"' "$index" | wc -l)"
new="$(grep -o 'data-change="new"' "$index" | wc -l)"
moved="$(grep -o 'data-change="moved"' "$index" | wc -l)"
updated="$(grep -o 'data-change="updated"' "$index" | wc -l)"

echo
echo "Build ok ($elapsed s) — version $version"
printf "  %-9s %s\n" "sections:" "$sections"
printf "  %-9s %s\n" "items:" "$items"
printf "  %-9s %s\n" "new:" "$new"
printf "  %-9s %s\n" "moved:" "$moved"
printf "  %-9s %s\n" "updated:" "$updated"
echo "  wrote:"
for artifact in "${artifacts[@]}"; do
	size="$(LC_ALL=C du -h "$out_dir/$artifact" | cut -f1)"
	printf "    %-22s %s\n" "${out_dir#$repo_root/}/$artifact" "$size"
done

echo
if [[ -n "${needs_format:-}" ]]; then
	echo "note: prettier not installed; run 'npm install' and 'npm run format' to format the generated files" >&2
fi
echo "Preview: python3 -m http.server 8000 --directory $out_dir"
