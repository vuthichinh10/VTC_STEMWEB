const tseslint = require('@typescript-eslint/eslint-plugin');
const parser = require('@typescript-eslint/parser');
module.exports = [
  {
    files: ['src/**/*.{ts,tsx}'],
    languageOptions: { parser, parserOptions: { ecmaFeatures: { jsx: true } } },
    plugins: { '@typescript-eslint': tseslint },
    rules: { '@typescript-eslint/no-explicit-any': 'error' },
  },
];
