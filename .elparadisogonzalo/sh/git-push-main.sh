#!/bin/bash

set -e  # Exit on error

BRANCH="main"
REPO_URL="git@github.com:koagonzalo11/elparadisogonzalo-monorepo.git"

echo "🔄 Switching to $BRANCH branch..."
git checkout -B $BRANCH

echo "📥 Pulling latest from $REPO_URL..."
git pull --rebase origin $BRANCH || echo "⚠️  Nothing to pull or remote empty"

echo "📦 Staging all changes..."
git add .

echo "📝 Committing with timestamp..."
git commit -m "🚀 Auto-push: $(date -u +'%Y-%m-%dT%H:%M:%SZ')" || echo "✅ Nothing new to commit"

echo "🚀 Pushing to $REPO_URL..."
git push origin $BRANCH || git push -u origin $BRANCH
