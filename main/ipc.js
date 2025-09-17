const { ipcMain } = require('electron')

function init(opManager, winManager, scriptRunner) {
	ipcMain.on('toMain', (event, msg) => {
		console.log('[REND => MAIN]:', msg.command, msg.data)
		if (msg.command === 'getOperators') {
			const operators = opManager.operators
			event.reply('fromMain', {
				command: 'sendOperators',
				data: operators
			})
		}
		if (msg.command === 'runOperator') {
			const operator = msg.data
			if (operator) {
				scriptRunner.run(operator).then(() => {
					console.log('Script has run, can hide the window')
					winManager.toggleWindow()
				})
			}
		}
	})

	winManager.triggerShow = () => {
		const msg = {
			command: 'triggerShow',
			data: {}
		}
		console.log('[MAIN => REND]:', msg.command, msg.data)
		winManager.win.webContents.send('fromMain', msg)
	}
}

module.exports = { init }