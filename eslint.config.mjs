
import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';


export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    languageOptions: {
      parserOptions: { // add this object
        tsconfigRootDir: import.meta.dirname,
        project: ['./tsconfig.json'],
      },
    },
  },
  {
    rules: {
      '@typescript-eslint/no-inferrable-types': 'off',
      'no-useless-escape': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': 'warn'
    },
  },
  {
    ignores: [
      'dist',
      'docs',
      'test',
      '.yarn',
      '.pnp.loader.mjs',
      '.pnp.cjs',
    ],
  }
);
