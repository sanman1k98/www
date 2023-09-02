#!/bin/sh
set -euo pipefail

# TODO: consolidate deployment scripts

# Copy the GitHub Workflow into the directory containing
# the built files
cp -R "./.github" "./dist/"

# Commit subtree to the "deploy" branch
./commit-subtree.sh "dist" "deploy"
