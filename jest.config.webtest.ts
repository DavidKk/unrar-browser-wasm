import type { Config } from '@jest/types'
import fs from 'fs'
import JSON5 from 'json5'
import path from 'path'
import { pathsToModuleNameMapper } from 'ts-jest'
import type { CompilerOptions } from 'typescript'

const tsconfigFile = path.join(__dirname, './tsconfig.json')
const tsconfigContent = fs.readFileSync(tsconfigFile, 'utf-8')
const { compilerOptions } = JSON5.parse<{ compilerOptions: CompilerOptions }>(tsconfigContent)
const tsconfigPaths = compilerOptions?.paths

// 构建模块名称映射
const moduleNameMapper: Record<string, string> = {
  '^../index.js$': '<rootDir>/index.js',
}

if (tsconfigPaths) {
  Object.assign(
    moduleNameMapper,
    pathsToModuleNameMapper(tsconfigPaths, {
      prefix: '<rootDir>',
    })
  )
}

export default (): Config.InitialOptions => ({
  preset: 'ts-jest/presets/js-with-ts-esm',
  testEnvironment: 'jsdom',
  testMatch: ['<rootDir>/__webtests__/**/*.spec.ts?(x)'],
  extensionsToTreatAsEsm: ['.ts'],
  moduleNameMapper,
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        useESM: true,
      },
    ],
  },
  transformIgnorePatterns: [
    '<rootDir>/node_modules/(?!(@babel|@jest|@testing-library|ansi-escapes|ansi-regex|ansi-styles|chalk|char-regex|ci-info|color|color-convert|color-name|cssom|cssstyle|data-urls|decimal.js|domexception|escodegen|esprima|html-encoding-sniffer|is-potential-custom-element-name|jest|jest-environment-jsdom|jsdom|levn|lodash|lodash-es|ms|node-notifier|optionator|parse5|prelude-ls|pretty-format|saxes|source-map|stack-utils|symbol-tree|tough-cookie|tr46|type-check|type-detect|unicode-canonical-property-names-ecmascript|unicode-match-property-ecmascript|unicode-match-property-value-ecmascript|unicode-property-aliases-ecmascript|w3c-hr-time|w3c-xmlserializer|webidl-conversions|whatwg-encoding|whatwg-mimetype|whatwg-url|word-wrap|xml-name-validator|xmlchars)/)',
  ],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  // 启用实验性VM模块以支持ES模块
  globals: {
    'ts-jest': {
      useESM: true,
    },
  },
})
