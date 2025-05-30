#!/bin/sh

# 匹配中文字符的正则表达式
CHINESE_REGEX='[\u4e00-\u9fa5]'

# 获取所有暂存的文件（非删除的、代码文件）
files=$(git diff --cached --name-only --diff-filter=ACM | grep -E '\.(ts|js|tsx|jsx|json|md|yml|yaml|html|css|scss|sh)$')

for file in $files; do
  if grep -q -P "$CHINESE_REGEX" "$file"; then
    echo "❌ ERROR: 中文字符检测失败：文件 $file 含有中文字符！"
    exit 1
  fi
done

exit 0
