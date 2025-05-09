// import typescriptParser from '@typescript-eslint/parser';
// import typescriptPlugin from '@typescript-eslint/eslint-plugin';
// import prettierPlugin from 'eslint-plugin-prettier';

const typescriptParser = require('@typescript-eslint/parser');
const typescriptPlugin = require('@typescript-eslint/eslint-plugin');
const prettierPlugin = require('eslint-plugin-prettier');

module.exports = [
    {
        files: ['**/*.ts'],
        languageOptions: {
            parser: typescriptParser,
            parserOptions: {
                project: ['tsconfig.json', 'tsconfig.test.json'],
                sourceType: 'module'
            },
            globals: {
                node: true
            }
        },
        plugins: {
            '@typescript-eslint': typescriptPlugin,
            'prettier': prettierPlugin
        },
        rules: {
            // TypeScript 推荐规则
            '@typescript-eslint/adjacent-overload-signatures': 'error',
            '@typescript-eslint/ban-ts-comment': 'error',
            // 添加其他你需要的推荐规则...

            // 你的自定义规则
            '@typescript-eslint/interface-name-prefix': 'off',
            '@typescript-eslint/explicit-function-return-type': 'off',
            '@typescript-eslint/explicit-module-boundary-types': 'off',
            '@typescript-eslint/no-explicit-any': 'warn',
            'prettier/prettier': 'error',
            'no-unused-vars': 'off',
            '@typescript-eslint/no-unused-vars': [
                'error',
                {
                    argsIgnorePattern: '^_',
                    varsIgnorePattern: '^_'
                }
            ]
        }
    }
];