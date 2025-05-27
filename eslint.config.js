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
            // TypeScript recommand
            '@typescript-eslint/adjacent-overload-signatures': 'error',
            '@typescript-eslint/ban-ts-comment': [
                'error', {
                    'ts-ignore': false,         // allow @ts-ignore
                    'ts-expect-error': true,    // @ts-expect-error work
                    'ts-nocheck': true,
                    'ts-check': false
                }],
            // Custom Rules
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
            ],
            // forbid console.log
            'no-console': 'error'
        }
    }
];
