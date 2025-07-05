import js from '@eslint/js';
import typescript from '@typescript-eslint/eslint-plugin';
import typescriptParser from '@typescript-eslint/parser';

export default [
	js.configs.recommended,
	{
		files: ['**/*.ts'],
		languageOptions: {
			parser: typescriptParser,
			parserOptions: {
				project: './tsconfig.json',
				sourceType: 'module',
				ecmaVersion: 2022,
			},
			globals: {
				setTimeout: 'readonly',
				clearTimeout: 'readonly',
				setInterval: 'readonly',
				clearInterval: 'readonly',
				global: 'readonly',
				process: 'readonly',
				Buffer: 'readonly',
				__dirname: 'readonly',
				__filename: 'readonly',
			},
		},
		plugins: {
			'@typescript-eslint': typescript,
		},
		rules: {
			...typescript.configs.recommended.rules,
			'@typescript-eslint/no-unused-vars': ['error', { 
				argsIgnorePattern: '^_',
				varsIgnorePattern: '^_',
			}],
			'@typescript-eslint/no-explicit-any': 'off',
			'@typescript-eslint/explicit-function-return-type': 'off',
			'@typescript-eslint/explicit-module-boundary-types': 'off',
			'@typescript-eslint/no-non-null-assertion': 'warn',
			'prefer-const': 'error',
			'no-var': 'error',
			'no-console': 'off',
			'no-debugger': 'error',
			'eqeqeq': ['error', 'always'],
			'curly': ['error', 'all'],
			'no-undef': 'off',
		},
	},
	{
		files: ['**/*.js'],
		languageOptions: {
			globals: {
				setTimeout: 'readonly',
				clearTimeout: 'readonly',
				setInterval: 'readonly',
				clearInterval: 'readonly',
				global: 'readonly',
				process: 'readonly',
				Buffer: 'readonly',
				__dirname: 'readonly',
				__filename: 'readonly',
			},
		},
		rules: {
			...js.configs.recommended.rules,
			'no-console': 'off',
			'no-debugger': 'error',
			'prefer-const': 'error',
			'no-var': 'error',
			'curly': ['error', 'all'],
		},
	},
	{
		ignores: [
			'dist/**',
			'node_modules/**',
			'*.d.ts',
			'coverage/**',
		],
	},
];
