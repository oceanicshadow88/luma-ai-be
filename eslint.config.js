const typescriptParser = require('@typescript-eslint/parser');
const typescriptPlugin = require('@typescript-eslint/eslint-plugin');
const prettierPlugin = require('eslint-plugin-prettier');

const noCommentedCodeRule = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow commented-out code blocks like // const x = foo();',
    },
    schema: [],
    messages: {
      noCommentedCode:
        '❌ Prohibit submitting code blocks containing comments from development. Eg: // const x = foo(); Please delete or correct it.',
    },
  },
  create(context) {
    const sourceCode = context.getSourceCode();
    const codeKeywords = ['const', 'let', 'var', '=>', '{', '}'];
    const pattern = new RegExp(`\\b(${codeKeywords.join('|')})\\b`);

    return {
      Program() {
        const comments = sourceCode.getAllComments();
        comments.forEach(comment => {
          if (pattern.test(comment.value)) {
            context.report({
              loc: comment.loc,
              message:
                '❌ It is prohibited to submit comment blocks with code, such as variable declarations, conditional statements, etc. Please delete or correct them.',
            });
          }
        });
      },
    };
  },
};

const noDevNotesRule = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow committing code with TODO, FIXME, WTF comments',
      recommended: true,
    },
    messages: {
      foundDevNote:
        '❌ It is prohibited to submit comments with obvious development notes or questions, such as TODO, FIXME, WTF, etc. Please handle them before submitting.',
    },
  },
  create(context) {
    const sourceCode = context.getSourceCode();
    const devNotePatterns = [
      /\bTODO\b/i,
      /\bFIXME\b/i,
      /\bWTF\b/i,
      /\bHACK\b/i,
      /\bXXX\b/i,
      /\bBUG\b/i,
      /\bNOTE\b/i,
    ];

    return {
      Program() {
        const comments = sourceCode.getAllComments();
        comments.forEach(comment => {
          if (devNotePatterns.some(pattern => pattern.test(comment.value))) {
            context.report({
              loc: comment.loc,
              messageId: 'foundDevNote',
            });
          }
        });
      },
    };
  },
};

const localRulesPlugin = {
  rules: {
    'no-commented-code': noCommentedCodeRule,
    'no-dev-notes': noDevNotesRule,
  },
};

module.exports = [
  {
    files: ['**/*.ts', '**/*.js', '**/*.tsx', '**/*.jsx'],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        project: ['tsconfig.json', 'tsconfig.test.json'],
        sourceType: 'module',
      },
      globals: {
        node: true,
      },
    },
    plugins: {
      '@typescript-eslint': typescriptPlugin,
      prettier: prettierPlugin,
      local: localRulesPlugin,
    },
    rules: {
      // TypeScript recommended rules
      '@typescript-eslint/adjacent-overload-signatures': 'error',
      '@typescript-eslint/ban-ts-comment': [
        'error',
        {
          'ts-ignore': false, // allow @ts-ignore
          'ts-expect-error': true,
          'ts-nocheck': true,
          'ts-check': false,
        },
      ],
      // Custom Rules
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': ['error'],
      'prettier/prettier': 'error',
      'no-unused-vars': 'off',
      'no-console': 'error',
      'no-debugger': 'error',
      'local/no-commented-code': 'error',
      'local/no-dev-notes': 'error',
    },
  },
];
