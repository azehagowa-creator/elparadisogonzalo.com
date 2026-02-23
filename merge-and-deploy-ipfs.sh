#!/bin/bash

set -e

echo "🔄 Merging all branches into main..."

# Ensure you're on the latest main
git checkout main
git pull origin main

# Merge all branches into main (except main itself)
for branch in $(git branch --format="%(refname:short)" | grep -v main); do
  echo "🔀 Merging branch: $branch"
  git checkout "$branch"
  git pull origin "$branch"
  git checkout main
  git merge "$branch" --no-edit
done

# Push updated main
git push origin main

echo "🛠️ Building project..."
# Replace this with your actual frontend build command
npm install
npm run build

echo "🚀 Deploying to IPFS..."
# Replace with the correct path if different
npx ipfs-deploy ./build --pinata

# Optional: get CID and update Unstoppable Domain (if automated)
CID=$(ipfs-deploy ./build --pinata --only-hash | grep -oE 'Qm[1-9A-HJ-NP-Za-km-z]{44}')
echo "🧬 CID: $CID"

# If using UD API:
# curl -X PUT "https://unstoppable.domains/api/v1/domains/elparadisogonzalo.com" \
#      -H "Authorization: Bearer $UD_API_KEY" \
#      -H "Content-Type: application/json" \
#      -d "{\"records\":{\"ipfs.html.value\":\"$CID\"}}"

echo "✅ All branches merged, project deployed to IPFS with CID: $CID"
