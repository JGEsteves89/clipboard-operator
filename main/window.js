const { BrowserWindow } = require('electron')
const path = require('path')

class WindowManager {
	constructor(width, height, debug) {
		this.win = null
		this.state = 'start'
		this.width = width
		this.height = height
		this.debug = debug
		this.triggerShow = null // overrided by ipc
		this.disableEscapeKeyShortcut = null  // overrided by shortkey
		this.enableEscapeKeyShortcut = null // overrided by shortkey
	}

	toggleWindow() {
		if (!this.win) this.createWindow()

		console.log('Togling window')
		if (this.win.isVisible()) {
			console.log('Will hide window')
			this.state = 'hide'
			this.win.hide()

			// release escape global short ckey
			if (this.disableEscapeKeyShortcut) {
				this.disableEscapeKeyShortcut()
			}
		} else {
			console.log('Will show window')
			this.state = 'show'

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
				contextIsolation: process.env.NODE_ENV !== 'development', // Already implied but ensure it's explicit
				nodeIntegration: process.env.NODE_ENV === 'development' // Disable node integration
			}
		})

		this.win.loadFile('renderer/index.html')

		this.win.on('blur', () => {
			if (this.debug) return
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
