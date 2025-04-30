import { defineConfig } from 'eslint/config';
import globals from 'globals';
import js from '@eslint/js';
import tseslint from 'typescript-eslint';


export default defineConfig([
    { ignores: ['**/*/dist/'] },
    { files: ['**/*.{js,mjs,cjs,ts,mts}'] },
    { files: ['**/*.{js,mjs,cjs,ts,mts}'], languageOptions: { globals: globals.browser } },
    { files: ['**/*.{js,mjs,cjs,ts,mts}'], plugins: { js }, extends: ['js/recommended'] },
    tseslint.configs.recommended,
]);