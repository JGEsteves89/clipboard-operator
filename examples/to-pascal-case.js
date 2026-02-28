/**
 * Converts clipboard text to PascalCase.
 * Each word's first letter is uppercased, rest lowercased.
 * Splits on spaces, underscores, and hyphens.
 *
 * Example: "hello world" => "HelloWorld"
 * Example: "some_variable_name" => "SomeVariableName"
 */
export async function run(input) {
	return input
		.trim()
		.split(/[\s_\-]+/)
		.filter(word => word.length > 0)
		.map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
		.join('')
}
