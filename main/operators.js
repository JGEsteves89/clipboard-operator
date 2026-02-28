const path = require('path')
const fs = require('fs')

// Files in the bundled examples/ folder that are NOT synced to the user's workspace/examples/
// (they serve a different purpose and are handled separately)
const EXAMPLES_SYNC_EXCLUDE = new Set(['operators.json'])

class OperationsManager {
	constructor(operationsJSONPath) {
		this.path = operationsJSONPath
		this.operators = []
	}

	load() {
		const dir = path.dirname(this.path)
		if (!fs.existsSync(dir)) {
			console.log('Creating file paths for this app in', dir)
			fs.mkdirSync(dir, { recursive: true })
		}

		// Sync all files from the bundled examples/ folder to the user's workspace/examples/.
		// User scripts (files not present in the bundled examples/) are never touched.
		this._syncExamples(dir)

		// Create a default config.json if one doesn't exist yet (never overwrite)
		const configPath = path.join(dir, 'config.json')
		if (!fs.existsSync(configPath)) {
			const defaultConfig = { OPENROUTER_API_KEY: 'put your key here', model: 'x-ai/grok-4-fast' }
			fs.writeFileSync(configPath, JSON.stringify(defaultConfig, null, 2))
			console.log('Created default config.json at', configPath)
		}

		// Merge new example operators into the user's operators.json.
		// Operators already present (matched by name) are never modified.
		// User-added operators are never removed.
		this._mergeOperators()

		try {
			this.operators = JSON.parse(fs.readFileSync(this.path).toString())
		} catch (error) {
			throw new Error('Could not parse the operators file: ' + this.path + '\n' + error.toString())
		}
	}

	_mergeOperators() {
		const templatePath = path.join(__dirname, '..', 'examples', 'operators.json')
		if (!fs.existsSync(templatePath)) return

		const templateOperators = JSON.parse(fs.readFileSync(templatePath).toString())

		let userOperators = []
		if (fs.existsSync(this.path)) {
			userOperators = JSON.parse(fs.readFileSync(this.path).toString())
		}

		const existingNames = new Set(userOperators.map(op => op.operator))
		const toAdd = templateOperators.filter(op => !existingNames.has(op.operator))

		if (toAdd.length > 0) {
			const merged = [...userOperators, ...toAdd]
			fs.writeFileSync(this.path, JSON.stringify(merged, null, 2))
			console.log('Added new example operators:', toAdd.map(op => op.operator).join(', '))
		}
	}

	_syncExamples(userDataDir) {
		const examplesSrcDir = path.join(__dirname, '..', 'examples')
		if (!fs.existsSync(examplesSrcDir)) return

		const examplesDestDir = path.join(userDataDir, 'examples')

		// Walk every file in the bundled examples/ folder recursively
		const files = fs.readdirSync(examplesSrcDir, { recursive: true })
			.filter(f => {
				const fullPath = path.join(examplesSrcDir, f)
				return fs.statSync(fullPath).isFile() && !EXAMPLES_SYNC_EXCLUDE.has(path.basename(f))
			})

		for (const file of files) {
			const src = path.join(examplesSrcDir, file)
			const dest = path.join(examplesDestDir, file)
			const destDir = path.dirname(dest)

			if (!fs.existsSync(destDir)) {
				fs.mkdirSync(destDir, { recursive: true })
			}

			const srcContent = fs.readFileSync(src)

			// Only write if the file is new or its content has changed
			if (!fs.existsSync(dest) || !fs.readFileSync(dest).equals(srcContent)) {
				fs.writeFileSync(dest, srcContent)
				console.log('Synced example:', file)
			}
		}
	}
}

module.exports = OperationsManager
