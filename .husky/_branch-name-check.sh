#!/bin/sh

branch_name=$(git symbolic-ref --short HEAD)

pattern="^(feature|bugfix|hotfix|chore|refactor|test|doc)\/([a-zA-Z0-9]+-)?[a-z0-9\-]+$"

if ! echo "$branch_name" | grep -qE "$pattern"; then
  echo "❌ ERROR: Branch name '$branch_name' does not follow naming convention!"
  echo "Format: <type>/<optional issue number-><short description>"
  echo "Allowed types: feature, bugfix, hotfix, chore, refactor, test, doc"
  echo "Examples:"
  echo "  feature/user-login"
  echo "  bugfix/LA13-email-validation"
  echo "  refactor/cleanup-auth-flow"
  exit 1
fi