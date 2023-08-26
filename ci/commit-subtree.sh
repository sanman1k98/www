SUBTREE="$1"
BRANCH="$2"

# add static files to the index
git add --force "${SUBTREE}"

# create a new tree object and get its hash
tree_hash="$(git write-tree --prefix="${SUBTREE}/")"

# create commit and get its id
commit_id="$(git commit-tree --parent "${BRANCH}" --message 'ci: deploy' "${tree_hash}")"

# update branch to point to new commit
git update-ref "refs/heads/${BRANCH}" "${commit_id}"
