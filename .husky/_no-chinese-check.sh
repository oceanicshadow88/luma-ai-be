#!/bin/sh

CHINESE_REGEX='[一-龥]'

files=$(git diff --cached --name-only --diff-filter=ACM | grep -E '\.(ts|js|tsx|jsx|json|md|yml|yaml|html|css|scss|sh)$'| grep -v '^.husky/')

if [ -z "$files" ]; then
  exit 0
fi

for file in $files; do
  if grep -q "$CHINESE_REGEX" "$file"; then
    echo "❌ ERROR: Chinese characters detected in staged file: $file"
    echo "Please remove Chinese characters before committing."
    exit 1
  fi
done

exit 0