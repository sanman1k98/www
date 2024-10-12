// Adapted from https://github.com/withastro/astro
/** @type {import("prettier").Config} */
export default {
	printWidth: 100,
	semi: true,
	singleQuote: true,
	tabWidth: 2,
	useTabs: true,
	trailingComma: 'all',
	// Matches eslint `stylistic/arrow-paren` rule.
	arrowParens: 'always',
	plugins: [
		'prettier-plugin-astro',
	],
	overrides: [
		{
			files: ['.*', '*.md', '*.toml', '*.yml'],
			options: {
				useTabs: false,
			},
		},
		{
			files: ['**/*.astro'],
			options: {
				parser: 'astro',
				astroAllowShorthand: true,
				// Use eslint to lint and format frontmatter.
				astroSkipFrontmatter: true,
			},
		},
	],
};
