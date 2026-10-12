import js from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  { ignores: ["dist/", "node_modules/", "coverage/", "docs/"] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    languageOptions: {
      globals: {
        process: 'readonly',
        Buffer: 'readonly',
        console: 'readonly',
        globalThis: 'readonly',
        URL: 'readonly',
        Intl: 'readonly',
      },
    },
    rules: {
      'no-irregular-whitespace': 'off',
      'no-misleading-character-class': 'off',
    },
  },
  {
    files: ['examples/jest/**/*.js', 'examples/mocha/**/*.cjs'],
    languageOptions: {
      globals: {
        require: 'readonly',
        module: 'readonly',
        describe: 'readonly',
        test: 'readonly',
        it: 'readonly',
        expect: 'readonly',
      },
    },
    rules: {
      '@typescript-eslint/no-require-imports': 'off',
    },
  },
);
