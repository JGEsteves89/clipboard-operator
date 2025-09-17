const { globalShortcut } = require('electron')

class Shortcuts {
	constructor(windowManager) {
		this.windowManager = windowManager
	}

	init() {
		globalShortcut.register('Control+Shift+Space', () => {
			this.windowManager.toggleWindow()
		})

		globalShortcut.register('Escape', () => {
			if (this.windowManager.win && this.windowManager.win.isVisible()) {
				this.windowManager.toggleWindow()
			}
		})
	}

	static unregisterAll() {
		globalShortcut.unregisterAll()
	}
}

module.exports = Shortcuts
