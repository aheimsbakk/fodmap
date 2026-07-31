#!/usr/bin/env bash
# bump-version.sh — bump the version stored in VERSION by one step.
#
# Usage:
#   ./scripts/bump-version.sh [patch|minor|major]
#
# Step defaults to patch. Prints the new version. Creates VERSION with
# 0.0.0 when it does not exist yet.

set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
version_file="$repo_root/VERSION"
step="${1:-patch}"

if [[ ! -f "$version_file" ]]; then
	echo "0.0.0" >"$version_file"
fi

IFS='.' read -r major minor patch <"$version_file"

case "$step" in
patch) patch=$((patch + 1)) ;;
minor)
	minor=$((minor + 1))
	patch=0
	;;
major)
	major=$((major + 1))
	minor=0
	patch=0
	;;
*)
	echo "error: step must be patch, minor, or major" >&2
	exit 1
	;;
esac

new_version="$major.$minor.$patch"
echo "$new_version" >"$version_file"
echo "$new_version"
