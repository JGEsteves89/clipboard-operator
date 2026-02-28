const { ipcMain, shell } = require('electron')
const path = require('path')

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
				}).catch((err) => {
					console.error('Unhandled error from scriptRunner:', err)
					winManager.hide()
				})
			}
		}
		if (msg.command === 'getOperators') {
			const reply = {
				command: 'triggerShow',
				data: { operators: opManager.operators }
			}
			console.log('[MAIN => REND]:', reply.command, reply.data)
			event.reply('fromMain', reply)
		}
		if (msg.command === 'openOperatorsFolder') {
			shell.openPath(path.dirname(opManager.path))
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
