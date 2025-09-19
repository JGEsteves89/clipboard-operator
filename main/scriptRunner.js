const path = require('path')
const fs = require('fs')
const { clipboard } = require('electron')
const { pathToFileURL } = require('url')

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
		// this ensures that the script is not cached
		const fileUrl = pathToFileURL(scriptPath).href + `?t=${Date.now()}`
		const script = await import(fileUrl)

		if (typeof script.run !== 'function') {
			console.log('No exported async function run(rawData: string): string on', scriptPath)
			return
		}


		console.log('Calling script.run()')
		try {
			const input = clipboard.readText()
			console.log('Running script with:')
			console.log('############')
			console.log(input.substring(0, 300) + (input.length > 300 ? '\n...' : ''))
			console.log('############')

			const result = await script.run(input)  // 👈 await here
			if (typeof result === 'string') {

				console.log('Returning script with:')
				console.log('############')
				console.log(result.substring(0, 300) + (result.length > 300 ? '\n...' : ''))
				console.log('############')

				clipboard.writeText(result)
				console.log('Script done, result copied to clipboard')

				if (clipboard.readText() !== result) {
					console.error('Something went wront when seeting the clipboard')
				}

			} else {
				console.error('Script did not return a string:', result)
			}
		} catch (err) {
			console.error('Error running script:', err)
		}
	}
}

module.exports = ScriptRunner
