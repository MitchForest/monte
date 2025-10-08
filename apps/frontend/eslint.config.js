import js from '@eslint/js';
import tseslint from '@typescript-eslint/eslint-plugin';
import tsparser from '@typescript-eslint/parser';
import solid from 'eslint-plugin-solid';
import prettier from 'eslint-config-prettier';

const projectConfig = {
  files: ['src/**/*.{ts,tsx}'],
  languageOptions: {
    parser: tsparser,
    parserOptions: {
      project: './tsconfig.json',
      tsconfigRootDir: import.meta.dirname,
      ecmaVersion: 2020,
      sourceType: 'module',
    },
  },
  rules: {
    'solid/no-destructure': 'off',
    'solid/components-return-once': 'off',
    'solid/prefer-for': 'off',
    'solid/reactivity': 'off',
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
  },
};

export default [
  {
    ignores: ['dist', 'node_modules'],
  },
  js.configs.recommended,
  ...tseslint.configs['flat/recommended-type-checked'],
  solid.configs['flat/typescript'],
  prettier,
  projectConfig,
];
