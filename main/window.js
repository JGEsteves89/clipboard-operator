const { BrowserWindow } = require('electron')
const path = require('path')

class WindowManager {
	constructor(width, height, debug) {
		this.win = null
		this.state = 'start'
		this.width = width
		this.height = height
		this.debug = debug
		this.triggerShow = null // overridden by ipc
		this.disableEscapeKeyShortcut = null  // overridden by shortcuts
		this.enableEscapeKeyShortcut = null // overridden by shortcuts
		this._lastShownAt = 0
	}

	hide() {
		console.log('Will hide window')
		this.state = 'hide'
		this.win.webContents.send('fromMain', { command: 'windowWillHide' })
		this.win.hide()

		// release escape global shortcut key
		if (this.disableEscapeKeyShortcut) {
			this.disableEscapeKeyShortcut()
		}
	}

	show() {
		console.log('Will show window')
		this.state = 'show'
		this._lastShownAt = Date.now()

		// trigger clean up and input focus
		if (this.triggerShow) {
			this.triggerShow()
		}

		this.win.show()
		this.win.focus()

		// make escape work to exit
		if (this.enableEscapeKeyShortcut) {
			this.enableEscapeKeyShortcut()
		}
	}

	toggleWindow() {
		if (!this.win) this.createWindow()

		console.log('Toggling window')
		if (this.win.isVisible()) {
			this.hide()
		} else {
			this.show()
		}
	}

	createWindow() {
		this.win = new BrowserWindow({
			width: this.width,
			height: this.height,
			show: false,
			alwaysOnTop: true,
			skipTaskbar: true,
			resizable: false,
			maximizable: false,
			fullscreen: false,
			frame: false,
			transparent: true,
			webPreferences: {
				preload: path.join(__dirname, '../preload/preload.js'),
				sandbox: process.env.NODE_ENV !== 'development',
				contextIsolation: true, // Already implied but ensure it's explicit
				nodeIntegration: false
			}
		})

		this.win.loadFile('renderer/index.html')

		this.win.on('blur', () => {
			if (this.debug) return
			if (Date.now() - this._lastShownAt < 300) return
			if (this.win && this.win.isVisible()) this.toggleWindow()
		})

		if (process.env.NODE_ENV === 'development') {
			this.win.webContents.openDevTools({ mode: 'detach' })
		}
	}

	static getWindowsCount() {
		return BrowserWindow.getAllWindows().length
	}
}

module.exports = WindowManager
