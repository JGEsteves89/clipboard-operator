const { Tray, Menu } = require('electron')
const path = require('path')

class TrayManager {
	constructor(windowManager) {
		this.windowManager = windowManager
		this.tray = null
	}

	init() {
		this.tray = new Tray(path.join(__dirname, '../icon.ico'))
		const contextMenu = Menu.buildFromTemplate([
			{ label: 'Show', click: () => this.windowManager.toggleWindow() },
			{ label: 'Quit', click: () => process.exit() }
		])
		this.tray.setToolTip('Clipboard Operator')
		this.tray.setContextMenu(contextMenu)

		this.tray.on('double-click', () => {
			this.windowManager.toggleWindow()
		})
	}
}

module.exports = TrayManager
