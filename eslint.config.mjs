import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { FlatCompat } from '@eslint/eslintrc';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

export default [
  ...compat.extends('next/core-web-vitals'),
  ...compat.extends('prettier'),
  ...compat.plugins('prettier'),
  {
    rules: {
      'prettier/prettier': 'error',
      // '@typescript-eslint/no-unused-vars': 'warn',
      'react-hooks/exhaustive-deps': 'warn',
      // '@typescript-eslint/no-explicit-any': 'warn',
      // 其他规则...
    },
  },
];
