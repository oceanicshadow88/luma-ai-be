#!/bin/sh

cd "$(git rev-parse --show-toplevel)" || {
  echo "❌ Failed to cd to repo root."
  exit 1
}

git diff --cached --quiet && {
  echo "ℹ️ No staged files to check."
  exit 0
}

CHINESE_REGEX='[一-龥]'
has_chinese=0

check_file_for_chinese() {
  file="$1"
  if grep -q "$CHINESE_REGEX" "$file"; then
    echo "❌ The file contains Chinese: $file"
    grep --color=always -n "$CHINESE_REGEX" "$file"
    has_chinese=1
  fi
}

for file in $(git diff --cached --name-only --diff-filter=ACM | grep -E '\.(ts|js|tsx|jsx|json|md|yml|yaml|html|css|scss|sh)$' | grep -v '^.husky/'); do
  check_file_for_chinese "$file"
done

if [ "$has_chinese" -eq 1 ]; then
  echo "🚫 Commit aborted due to Chinese characters."
  exit 1
fi

exit 0
