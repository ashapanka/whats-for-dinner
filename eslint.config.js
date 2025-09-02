import angular from '@angular-eslint/eslint-plugin';
import angularTemplate from '@angular-eslint/eslint-plugin-template';
import jsdoc from 'eslint-plugin-jsdoc';

export default [
  {
    files: ['**/*.ts'],
    languageOptions: {
      parserOptions: {
        project: true,
        tsconfigRootDir: __dirname,
      },
    },
    plugins: {
      '@angular-eslint': angular,
      jsdoc,
    },
    rules: {
      // Angular rules
      '@angular-eslint/component-class-suffix': ['error', { suffixes: ['Component'] }],
      '@angular-eslint/directive-class-suffix': ['error', { suffixes: ['Directive'] }],
      '@angular-eslint/no-empty-lifecycle-method': 'warn',

      // TypeScript rules
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/explicit-function-return-type': 'off',

      // Style rules
      'curly': 'error',
      'eqeqeq': ['error', 'smart'],

      // --- JSDoc rules for mandatory documentation ---
      'jsdoc/require-jsdoc': ['error', {
        require: {
          FunctionDeclaration: true,
          MethodDefinition: true,
          ClassDeclaration: true,
          ArrowFunctionExpression: true
        }
      }],
      'jsdoc/check-tag-names': 'error',
      'jsdoc/check-indentation': 'error',
      'jsdoc/require-param': 'error',
      'jsdoc/require-returns': 'error'
    },
  },
  {
    files: ['**/*.html'],
    plugins: {
      '@angular-eslint/template': angularTemplate,
    },
    rules: {
      '@angular-eslint/template/no-negated-async': 'error',
    },
  },
];
