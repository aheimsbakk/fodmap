#!/usr/bin/env bash
# validate-changelog.sh — check that CHANGELOG.md's top version header
# matches VERSION and today's date.
#
# Usage:
#   ./scripts/validate-changelog.sh
#
# Exit codes:
#   0  header matches VERSION and date
#   1  validation failed (reason printed on stderr)

set -uo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
changelog="$repo_root/CHANGELOG.md"
version_file="$repo_root/VERSION"

if [[ ! -f "$changelog" ]]; then
	echo "error: CHANGELOG.md not found at $changelog" >&2
	exit 1
fi

if [[ ! -f "$version_file" ]]; then
	echo "error: VERSION not found at $version_file" >&2
	exit 1
fi

version="$(cat "$version_file")"
header="$(grep -m1 -E '^## \[' "$changelog" || true)"

if [[ -z "$header" ]]; then
	echo "error: no version header (## [x.y.z] - YYYY-MM-DD) found in CHANGELOG.md" >&2
	exit 1
fi

expected="## [$version] - $(date -u +%Y-%m-%d)"
if [[ "$header" != "$expected" ]]; then
	echo "error: expected header '$expected', found '$header'" >&2
	exit 1
fi

echo "ok: changelog header matches VERSION $version"
