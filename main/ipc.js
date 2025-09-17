const { ipcMain } = require('electron')

function setupIPC(opManager) {
	ipcMain.on('toMain', (event, msg) => {
		console.log('[REND => MAIN]:', msg.command, msg.data)
		if (msg.command === 'getOperators') {
			const operators = opManager.operators
			event.reply('fromMain', {
				command: 'sendOperators',
				data: operators
			})
		}
	})
}

module.exports = { setupIPC }