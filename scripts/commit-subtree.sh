#!/bin/sh
set -euo pipefail

# TODO: use `getopt` or `getopts` to parse args to script
SUBTREE="$1"
BRANCH="$2"

# check if the directory exists
if [[ ! -d "${SUBTREE}" ]]; then
  echo "Directory \"${SUBTREE}\" does not exist"
  exit 1
fi

# add static files to the index
git add --force "${SUBTREE}"

# create a new tree object and get its hash
tree_hash="$(git write-tree --prefix="${SUBTREE}/")"

# create commit and get its id
commit_id="$(git commit-tree --gpg-sign -p "${BRANCH}" -m 'ci: deploy' "${tree_hash}")"

# update branch to point to new commit
git update-ref "refs/heads/${BRANCH}" "${commit_id}"

# show commit stats
git show --stat "${BRANCH}"

# remove the static files from the index
git rm -r --quiet --cached "${SUBTREE}"
