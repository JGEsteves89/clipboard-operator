import js from "@eslint/js"
import globals from "globals"
import { defineConfig } from "eslint/config"

export default defineConfig([
	{
		files: ["**/*.{js,mjs,cjs}"],
		languageOptions: {
			globals: {
				...globals.browser,
				...globals.node,
			},
			sourceType: "module",
			ecmaVersion: "latest",
		},
		plugins: {
			js,
		},
		rules: {
			"no-unused-vars": "warn",
			"no-undef": "error",
			"semi": ["warn", "never"],
		},
		extends: [js.configs.recommended],
	},
])
