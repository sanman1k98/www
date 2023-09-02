#!/bin/sh
set -euo pipefail

# TODO: consolidate deployment scripts

bun run build

# Copy the GitHub Workflow into the directory containing
# the built files
cp -R "./.github" "./dist/"

# Commit subtree to the "deploy" branch
./scripts/commit-subtree.sh "dist" "deploy"
