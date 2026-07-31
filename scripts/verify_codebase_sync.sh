#!/usr/bin/env bash
# verify_codebase_sync.sh — verify that every physical path listed in
# CODEBASE.md exists on disk.
#
# Usage:
#   ./scripts/verify_codebase_sync.sh
#
# Exit codes:
#   0  all paths exist
#   1  one or more paths are missing (listed on stderr)
#
# Parses the directory tree in CODEBASE.md section 1. Each tree line
# starts with a box-drawing prefix ("├── " or "└── "); the path is the
# text after the prefix, up to the first whitespace. Inline comments
# after the path are ignored. The tree root "work/" maps to the
# repository root.

set -u

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
codebase="$repo_root/CODEBASE.md"

if [[ ! -f "$codebase" ]]; then
	echo "error: CODEBASE.md not found at $codebase" >&2
	exit 1
fi

missing=0
checked=0

while IFS= read -r line; do
	# Match tree lines only; skip everything else.
	if [[ ! "$line" =~ ^[├└]──[[:space:]]+ ]]; then
		continue
	fi

	# Extract the path: text after the prefix, up to the first whitespace.
	path="${line#*── }"
	path="${path%%[[:space:]]*}"

	# The tree root is "work/"; map it to the repository root.
	if [[ "$path" == "work/" || "$path" == "work" ]]; then
		rel="."
	elif [[ "$path" == work/* ]]; then
		rel="${path#work/}"
	else
		echo "warning: path outside tree root, skipping: $path" >&2
		continue
	fi

	checked=$((checked + 1))
	if [[ ! -e "$repo_root/$rel" ]]; then
		echo "missing: $rel" >&2
		missing=$((missing + 1))
	fi
done <"$codebase"

if [[ "$missing" -gt 0 ]]; then
	echo "error: $missing of $checked paths in CODEBASE.md are missing" >&2
	exit 1
fi

echo "ok: all $checked paths in CODEBASE.md exist"
