import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist', 'dist-ssr']),
  {
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2022,
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    rules: {
      // Core no-unused-vars can't see JSX usage: allow components (PascalCase) and motion's `m`.
      'no-unused-vars': ['error', { varsIgnorePattern: '^(?:[A-Z_]|m$)', argsIgnorePattern: '^[A-Z_]' }],
    },
  },
  {
    // Build tooling and the prerender entry run in Node.
    files: ['*.config.js', 'vite-plugin-*.js', 'scripts/**/*.{js,mjs}', 'src/entry-server.jsx'],
    languageOptions: { globals: { ...globals.node } },
  },
  {
    // R3F's frame loop mutates three.js objects imperatively by design.
    files: ['src/components/three/**'],
    rules: { 'react-hooks/immutability': 'off' },
  },
  {
    // Non-component modules: fast-refresh boundaries don't apply.
    files: ['src/lib/**', 'src/entry-server.jsx'],
    rules: { 'react-refresh/only-export-components': 'off' },
  },
])
