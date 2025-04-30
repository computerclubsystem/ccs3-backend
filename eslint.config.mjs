import { defineConfig } from 'eslint/config';
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import stylisticJs from '@stylistic/eslint-plugin-js';

export default defineConfig([
    { ignores: ['**/*/dist/'] },
    { files: ['**/*.{js,mjs,cjs,ts,mts}'] },
    { files: ['**/*.{js,mjs,cjs,ts,mts}'], plugins: { js }, extends: ['js/recommended'] },
    tseslint.configs.stylistic,
    tseslint.configs.recommended,
    {
        files: ['**/*.{js,mjs,cjs,ts,mts}'],
        plugins: {
            '@stylistic/js': stylisticJs,
        },
        rules: {
            '@stylistic/js/semi': ['error', 'always'],
        },
    },
]);