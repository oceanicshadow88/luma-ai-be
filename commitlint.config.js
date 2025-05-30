module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [2, 'always', [
      'feat', 'fix', 'docs', 'style', 'refactor', 'test', 'chore', 'revert', 'hotfix', 'bugfix'
    ]],
    'subject-empty': [2, 'never'],
    'header-max-length': [2, 'always', 72],
  },
};
