const { ipcMain } = require('electron')

function init(opManager, winManager, scriptRunner) {
	ipcMain.on('toMain', (event, msg) => {
		console.log('[REND => MAIN]:', msg.command, msg.data)
		if (msg.command === 'runOperator') {
			const operator = msg.data
			if (operator) {
				event.reply('fromMain', {
					command: 'runningOperator',
					data: {}
				})
				scriptRunner.run(operator).then(() => {
					console.log('Script has run, can hide the window')
					winManager.toggleWindow()
				})
			}
		}
	})

	winManager.triggerShow = () => {
		opManager.load()
		const msg = {
			command: 'triggerShow',
			data: { operators: opManager.operators }
		}
		console.log('[MAIN => REND]:', msg.command, msg.data)
		winManager.win.webContents.send('fromMain', msg)
	}
}

module.exports = { init }