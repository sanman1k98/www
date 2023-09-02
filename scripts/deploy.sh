#!/bin/sh
set -euo pipefail

# TODO: consolidate deployment scripts

# TODO: exit early if working directory is dirty

# Build the site for static deployment
bun run build

# Copy the GitHub Workflow into the directory containing
# the built files
cp -R "./.github" "./dist/"

# Commit subtree to the "deploy" branch
./scripts/commit-subtree.sh "dist" "deploy"
