const { BrowserWindow } = require('electron')
const path = require('path')

class WindowManager {
	constructor(width, height) {
		this.win = null
		this.state = 'start'
		this.width = width
		this.height = height
	}

	toggleWindow() {
		if (!this.win) this.createWindow()

		if (this.win.isVisible()) {
			this.state = 'hide'
			this.win.hide()
		} else {
			this.state = 'show'
			this.win.show()
			this.win.focus()
		}
	}

	createWindow() {
		this.win = new BrowserWindow({
			width: this.width,
			height: this.height,
			show: false,
			alwaysOnTop: true,
			skipTaskbar: true,
			transparent: true,
			resizable: false,
			frame: false,
			webPreferences: {
				preload: path.join(__dirname, '../preload/preload.js')
			}
		})

		this.win.loadFile('renderer/index.html')

		this.win.on('blur', () => {
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
