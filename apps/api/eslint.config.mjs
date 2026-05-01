import globals from 'globals';

export default [
  {
    ignores: ['node_modules/', 'dist/', 'build/', '.turbo/', 'prisma/'],
  },
  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 2024,
      sourceType: 'module',
      globals: {
        ...globals.node,
      },
    },
    rules: {
      'no-unused-vars': 'off',
      'no-console': 'off',
    },
  },
];