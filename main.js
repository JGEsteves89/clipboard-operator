const { app, BrowserWindow, Tray, Menu, globalShortcut } = require('electron/main')
const path = require('path')

const DEBUG = true

const STATES = {
	START: 1,
	SHOW: 2,
	HIDE: 3,
}

const state = {
	state: STATES.START,
	win: null
}

function toggleWindow() {
	if (!state.win) {
		state.state = STATES.SHOW
		state.win = new BrowserWindow({
			width: 275,
			height: 70,
			show: false,
			frame: false,
			alwaysOnTop: true,
			skipTaskbar: true // do not show on windows taskbar
		})
		state.win.loadFile('index.html')
		if (DEBUG) state.win.webContents.openDevTools({ mode: 'detach' })
	}

	// Hide when the window loses focus (click outside)
	state.win.on('blur', () => {
		if (DEBUG) return
		if (state.win && state.win.isVisible()) {
			toggleWindow()
		}
	})

	if (state.win.isVisible()) {
		state.state = STATES.HIDE
		state.win.hide()
	} else {
		state.state = STATES.SHOW
		state.win.show()
		state.win.focus()  // make sure the window has focus
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
	globalShortcut.register('Escape', () => {
		if (state.win && state.win.isVisible()) {
			toggleWindow()
		}
	})

	toggleWindow()
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