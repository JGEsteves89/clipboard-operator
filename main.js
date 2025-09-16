const { app, BrowserWindow, Tray, Menu, globalShortcut } = require('electron/main')
const path = require('path')

let win = null

function toggleWindow() {
	if (!win) {
		win = new BrowserWindow({
			width: 300,
			height: 200,
			show: false,
			frame: false,
			alwaysOnTop: true
		})
		win.loadFile('index.html')
	}

	if (win.isVisible()) {
		win.hide()
	} else {
		win.show()
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