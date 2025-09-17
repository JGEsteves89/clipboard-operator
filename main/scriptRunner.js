const path = require('path')
const fs = require('fs')
const { clipboard } = require('electron')

class ScriptRunner {
	constructor(scriptsPath) {
		this.scriptsPath = scriptsPath
	}

	async run(operator) {
		console.log('Running script operator', operator.operator)

		const scriptPath = path.join(this.scriptsPath, operator.script)
		if (!fs.existsSync(scriptPath)) {
			console.log('There is no such script', scriptPath)
			return
		}

		const script = require(scriptPath)
		if (typeof script.run !== 'function') {
			console.log('No exported async function run(rawData: string): string on', scriptPath)
			return
		}

		console.log('Calling script.run()')
		try {
			const input = clipboard.readText()
			console.log('Running script with "', input.substring(0, 300) + '"')
			const result = await script.run(input)  // 👈 await here
			if (typeof result === 'string') {
				console.log('Returning script with "', result.substring(0, 300) + '"')
				clipboard.writeText(result)
				console.log('Script done, result copied to clipboard')
			} else {
				console.error('Script did not return a string:', result)
			}
		} catch (err) {
			console.error('Error running script:', err)
		}
	}
}

module.exports = ScriptRunner
