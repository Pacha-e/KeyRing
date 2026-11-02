// --- External imports ---
import js from '@eslint/js';
import prettier from 'eslint-config-prettier';
import pluginVue from 'eslint-plugin-vue';
import globals from 'globals';
import tseslint from 'typescript-eslint';

// --- Constants ---
const importOrder = {
  create(context) {
    let previous;
    return {
      ImportDeclaration(node) {
        if (node.specifiers.length === 0) return;
        const source = node.source.value;
        const internal =
          source.startsWith('.') || source.startsWith('@/') || source.startsWith('~/');
        if (
          previous &&
          (previous.internal > internal ||
            (previous.internal === internal && previous.source.localeCompare(source) > 0))
        ) {
          context.report({
            node,
            message: 'Sort external imports before internal imports, alphabetically.',
          });
        }
        previous = { internal, source };
      },
    };
  },
};

// --- Exported members ---
export default tseslint.config(
  {
    ignores: ['dist/**', 'node_modules/**', 'playwright-report/**', 'test-results/**'],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...pluginVue.configs['flat/recommended'],
  prettier,
  {
    languageOptions: {
      globals: { ...globals.browser, ...globals.node },
      parserOptions: { parser: tseslint.parser },
    },
    plugins: { import: { rules: { order: importOrder } } },
    rules: {
      // The course requires static utility and service classes.
      '@typescript-eslint/no-extraneous-class': 'off',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_', caughtErrorsIgnorePattern: '^_' },
      ],
      'import/order': 'error',
      'sort-imports': ['error', { ignoreDeclarationSort: true }],
      'vue/block-order': ['error', { order: ['script', 'template', 'style'] }],
      'vue/multi-word-component-names': 'off',
    },
  },
);
