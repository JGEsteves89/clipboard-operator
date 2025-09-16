const { app, BrowserWindow, Tray, Menu, globalShortcut } = require('electron/main')
const path = require('path')

const STATES = {
	SHOW: 0,
	HIDE: 0,
}

const state = {
	state: STATES.HIDE,
	win: null
}

function toggleWindow() {
	if (!state.win) {
		state.win = new BrowserWindow({
			width: 300,
			height: 200,
			show: false,
			frame: false,
			alwaysOnTop: true
		})
		state.win.loadFile('index.html')
	}

	if (state.win.isVisible()) {
		state.win.hide()
	} else {
		state.win.show()
	}
}

const createWindow = () => {
	const tray = new Tray(path.join(__dirname, 'icon.ico'))
	const contextMenu = Menu.buildFromTemplate([
		{ label: 'Show', click: () => toggleWindow() },
		{ label: 'Quit', click: () => app.quit() }
	])
	tray.setToolTip('Copy to prompt')
	tray.setContextMenu(contextMenu)

	// Register global shortcut (Ctrl+Shift+Space for example)
	globalShortcut.register('Control+Shift+Space', () => {
		toggleWindow()
	})

}

app.whenReady().then(() => {
	createWindow()

	app.on('activate', () => {
		if (BrowserWindow.getAllWindows().length === 0) {
			createWindow()
		}
	})
})

app.on('window-all-closed', () => {
	if (process.platform !== 'darwin') {
		app.quit()
	}
})

app.on('will-quit', () => {
	globalShortcut.unregisterAll()
})