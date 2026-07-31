#!/usr/bin/env bash
# bump-version.sh — bump the version stored in VERSION by one step and sync
# it into the footer of src/index.html.
#
# Usage:
#   ./scripts/bump-version.sh [patch|minor|major]
#
# Step defaults to patch. Prints the new version. Creates VERSION with
# 0.0.0 when it does not exist yet. Replaces the "FODMAP vX.Y.Z" marker in
# src/index.html with the new version; fails when the marker is absent so
# VERSION and the page footer can never drift apart silently.

set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
version_file="$repo_root/VERSION"
index_file="$repo_root/src/index.html"
step="${1:-patch}"

# Footer marker: "FODMAP v<semver> // Kilder:". Checked before any write so
# a missing marker fails atomically: VERSION is never bumped without the
# footer being updatable, so the two can never drift apart silently.
marker_pattern='FODMAP v[0-9]+\.[0-9]+\.[0-9]+'
if ! grep -qE "$marker_pattern" "$index_file"; then
	echo "error: no \"FODMAP vX.Y.Z\" marker found in $index_file" >&2
	exit 1
fi

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
sed -i -E "s/$marker_pattern/FODMAP v$new_version/" "$index_file"

echo "$new_version"
