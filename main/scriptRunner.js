const path = require('path')
const fs = require('fs')
const { clipboard, dialog } = require('electron')
const { pathToFileURL } = require('url')

class ScriptRunner {
	constructor(operatorsPath, winManager) {
		this.operatorsPath = operatorsPath
		this.winManager = winManager
	}

	async run(operator) {
		console.log('Running script operator', operator.operator)

		const absolutePath = operator.script
		const relativeToExe = path.resolve(operator.script)
		const relativeOperators = path.resolve(path.join(path.dirname(this.operatorsPath), operator.script))

		let scriptPath = null

		for (const candidate of [absolutePath, relativeToExe, relativeOperators]) {
			if (fs.existsSync(candidate)) {
				scriptPath = candidate
				break
			}
		}

		if (!scriptPath) {
			this.winManager.hide()
			dialog.showMessageBoxSync({
				type: 'error',
				title: 'Script does not exist',
				message: 'The script you are trying to run could not be found',
				detail: "Checked paths:\n " + [absolutePath, relativeToExe, relativeOperators].join('\n'),
			})

			console.log('There is no such script:\n', [absolutePath, relativeToExe, relativeOperators].join('\n'))
			return
		}

		console.log('Preparing to run:', scriptPath)

		try {
			// this ensures that the script is not cached
			const fileUrl = pathToFileURL(scriptPath).href + `?t=${Date.now()}`
			const script = await import(fileUrl)

			if (typeof script.run !== 'function') {
				console.log('No exported async function run(rawData: string): string on', scriptPath)
				return
			}

			const input = clipboard.readText()
			console.log('Running script with:')
			console.log('############')
			console.log(input.substring(0, 300) + (input.length > 300 ? '\n...' : ''))
			console.log('############')

			const result = await script.run(input, { ...operator, _workspaceDir: path.dirname(this.operatorsPath) })
			if (typeof result === 'string') {

				console.log('Returning script with:')
				console.log('############')
				console.log(result.substring(0, 300) + (result.length > 300 ? '\n...' : ''))
				console.log('############')

				clipboard.writeText(result)
				console.log('Script done, result copied to clipboard')

				if (clipboard.readText() !== result) {
					console.error('Something went wrong when setting the clipboard')
				}

			} else {
				console.error('Script did not return a string:', result)
			}
		} catch (err) {
			console.error('Error running script:', err)
			dialog.showMessageBoxSync({
				type: 'error',
				title: 'Script Error',
				message: `Error running "${operator.operator}"`,
				detail: err.message || String(err),
			})
		}
	}
}

module.exports = ScriptRunner
