import importPlugin from 'eslint-plugin-import'
import prettierPlugin from 'eslint-plugin-prettier'
import simpleImportSort from 'eslint-plugin-simple-import-sort'

import cjsConfig from './eslintrc/cjs.mjs'
import esmConfig from './eslintrc/esm.mjs'
import tsConfig from './eslintrc/ts.mjs'

export default [
  {
    ignores: [
      'build/**/*',
      '.husky/**/*',
      'coverage/**/*',
      'node_modules',
      'packages/*/build/**/*',
      'packages/*/dist/**/*',
      'packages/*/out/**/*',
      'packages/*/node_modules/**/*',
      'packages/*/.next/**/*',
      'packages/*/public/**/*.js', // 忽略 public 目录下的 JS 构建产物
      'dist/**/*',
      'gh-pages/**/*',
      '**/*.wasm',
      '**/*.cpp',
    ],
  },
  {
    languageOptions: {
      globals: {
        process: 'readonly',
        module: 'readonly',
        require: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        exports: 'readonly',
      },
    },
    plugins: {
      'eslint-plugin-import': importPlugin,
      'eslint-plugin-prettier': prettierPlugin,
      'simple-import-sort': simpleImportSort,
    },
    rules: {
      'max-len': [
        'error',
        {
          code: 180,
          tabWidth: 2,
          ignoreTemplateLiterals: true,
          ignoreUrls: true,
          ignoreStrings: true,
        },
      ],
      semi: ['error', 'never'],
      'no-console': 'warn', // 警告使用 console，如确实需要使用请添加 eslint-disable-next-line no-console
      'simple-import-sort/imports': 'error',
      'simple-import-sort/exports': 'error',
      'eslint-plugin-import/first': 'off',
      'eslint-plugin-import/newline-after-import': 'off',
      'eslint-plugin-import/no-duplicates': 'warn',
      'eslint-plugin-import/no-extraneous-dependencies': [
        'warn',
        {
          devDependencies: [
            '**/*.spec.ts',
            '**/*/jest.config.*.ts',
            'eslintrc/**/*.mjs',
            'scripts/**/*.mjs',
            'jest/**/*.ts',
            '.cz-config.js',
            'eslint.config.mjs',
            '**/eslint.config.mjs',
            '**/vite.config.js',
            '**/vite.config.ts',
            'playwright.config.ts',
            '__e2etests__/**/*.ts',
          ],
        },
      ],
    },
  },
  ...tsConfig,
  ...cjsConfig,
  ...esmConfig,
]
