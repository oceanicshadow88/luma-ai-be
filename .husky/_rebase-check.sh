#!/bin/sh

set -e

CURRENT_BRANCH=$(git symbolic-ref --short HEAD)

echo "📡 Fetching origin/develop..."
if ! git fetch origin develop; then
  echo "🔍 Checking if your branch is up to date with origin/develop..."
  echo "👉 Current branch: $CURRENT_BRANCH"
  echo "❌ Failed to fetch origin/develop. Please check network or remote settings."
  exit 1
fi

BASE=$(git merge-base "$CURRENT_BRANCH" origin/develop)
DEVELOP_HEAD=$(git rev-parse origin/develop)


if [ "$BASE" != "$DEVELOP_HEAD" ]; then
  echo "🔎 BASE: $BASE"
  echo "🔎 DEVELOP_HEAD: $DEVELOP_HEAD"
  echo "❌ Your branch is not based on the latest origin/develop."
  echo "➡️  Please run: git fetch origin && git rebase origin/develop"
  exit 1
fi

