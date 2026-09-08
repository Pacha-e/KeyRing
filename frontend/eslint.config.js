import js from '@eslint/js'
import pluginVue from 'eslint-plugin-vue'
import prettier from 'eslint-config-prettier'
import tseslint from 'typescript-eslint'
import globals from 'globals'

export default tseslint.config(
  // Salidas compiladas: el build de producción y los bundles que generan las
  // pruebas de .verify para poder ejecutarse en Node.
  {
    ignores: [
      'dist/**',
      'node_modules/**',
      '.verify/guards-dist/**',
      '.verify/ssr/**',
      '.verify/out-*.mjs',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...pluginVue.configs['flat/recommended'],
  prettier,
  {
    languageOptions: {
      globals: globals.browser,
      parserOptions: {
        // Parser TS dentro de los bloques <script lang="ts"> de los .vue
        parser: tseslint.parser,
      },
    },
    rules: {
      'vue/multi-word-component-names': 'off',
      // Convención del proyecto: un identificador con prefijo _ se descarta a propósito
      // (p. ej. al desestructurar una entidad para quedarse con el DTO sin su id).
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_', caughtErrorsIgnorePattern: '^_' },
      ],
    },
  },
)
