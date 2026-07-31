#!/usr/bin/env bash
# verify_codebase_sync.sh — verify that every physical path listed in
# CODEBASE.md section 1 exists on disk.
#
# Usage:
#   ./scripts/verify_codebase_sync.sh
#
# Exit codes:
#   0  all paths exist
#   1  one or more paths are missing (listed on stderr)
#
# Parses the nested box-drawing tree in CODEBASE.md. Each level occupies
# four columns ("│   " or spaces); the branch glyph is "├── " or "└── ".
# The path is the text after the glyph, up to the first whitespace
# (inline comments are ignored). Directories end with "/" and seed the
# nesting stack. The tree root "work/" maps to the repository root.

set -u

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
codebase="$repo_root/CODEBASE.md"

if [[ ! -f "$codebase" ]]; then
	echo "error: CODEBASE.md not found at $codebase" >&2
	exit 1
fi

missing=0
checked=0
stack=()

while IFS= read -r line; do
	# Match tree branch lines; skip headings, tables, and prose.
	if [[ ! "$line" =~ ^([│[:space:]]*)([├└]──[[:space:]]+)(.+)$ ]]; then
		continue
	fi

	prefix="${BASH_REMATCH[1]}"
	entry="${BASH_REMATCH[3]}"
	name="${entry%%[[:space:]]*}"

	# The tree root ("work/") has no branch glyph; everything else sits at
	# depth = number of four-column levels in the prefix.
	if [[ "$name" == "work/" ]]; then
		stack=()
		continue
	fi

	level=$((${#prefix} / 4))
	stack=("${stack[@]:0:$level}")

	rel=""
	for dir in "${stack[@]}"; do
		rel+="$dir"
	done
	rel+="$name"

	if [[ "$name" == *"/" ]]; then
		stack+=("$name")
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
