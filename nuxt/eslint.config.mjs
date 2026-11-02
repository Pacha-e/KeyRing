// --- External imports ---
import prettier from 'eslint-config-prettier';

// --- Internal imports ---
import withNuxt from './.nuxt/eslint.config.mjs';

// --- Exported configuration ---
export default withNuxt(
  { ignores: ['.browsers/**', '.cache/**', '.pnpm-home/**', '.pnpm-store/**', '.tmp/**'] },
  {
    rules: {
      // The course requires utilities and services as classes with static methods.
      '@typescript-eslint/no-extraneous-class': 'off',
      '@typescript-eslint/no-unused-vars': 'error',
      'import/order': [
        'error',
        {
          alphabetize: { caseInsensitive: true, order: 'asc' },
          groups: ['builtin', 'external', 'internal', ['parent', 'sibling', 'index']],
        },
      ],
      'no-unused-vars': 'off',
      'sort-imports': ['error', { ignoreDeclarationSort: true }],
      'vue/block-order': ['error', { order: ['script', 'template', 'style'] }],
    },
  },
).append(prettier);
