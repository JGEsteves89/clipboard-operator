const { globalShortcut } = require('electron')

class Shortcuts {
	constructor(windowManager) {
		this.windowManager = windowManager
	}
	enableEscapeKeyShortcut() {
		globalShortcut.register('Escape', () => {
			if (this.windowManager.win && this.windowManager.win.isVisible()) {
				this.windowManager.toggleWindow()
			}
		})
	}
	disableEscapeKeyShortcut() {
		globalShortcut.unregister('Escape')
	}
	init() {
		this.windowManager.disableEscapeKeyShortcut = this.disableEscapeKeyShortcut
		this.windowManager.enableEscapeKeyShortcut = this.enableEscapeKeyShortcut
		globalShortcut.register('Control+Shift+Space', () => {
			this.windowManager.toggleWindow()
		})
	}

	static unregisterAll() {
		globalShortcut.unregisterAll()
	}
}

module.exports = Shortcuts
