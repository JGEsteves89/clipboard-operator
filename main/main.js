const { app, dialog } = require('electron')
const path = require('path')

const DEBUG = process.env.NODE_ENV === "development"
const WIDTH = 350
const HEIGHT = 300
const OPERATIONS_PATH = path.join(app.getPath('userData'), 'workspace', 'operators.json')

if (DEBUG) {
	try {
		require("electron-reloader")(module, { debug: true, watchRenderer: true })
		console.log("Hot reload ENABLED ✓")
	} catch (err) {
		console.error("Hot reload error:", err)
	}
}

const OperationsManager = require('./operators')
const WindowManager = require('./window')
const TrayManager = require('./tray')
const Shortcuts = require('./shortcuts')
const ipc = require('./ipc')
const ScriptRunner = require('./scriptRunner')

app.whenReady().then(() => {
	const opManager = new OperationsManager(OPERATIONS_PATH)
	const winManager = new WindowManager(WIDTH, HEIGHT, DEBUG)
	const trayManager = new TrayManager(winManager)
	const shortcuts = new Shortcuts(winManager)
	const runner = new ScriptRunner(OPERATIONS_PATH, winManager)

	trayManager.init()
	shortcuts.init()
	ipc.init(opManager, winManager, runner)

	winManager.toggleWindow()
})

app.on('activate', () => {
	if (WindowManager.getWindowsCount() === 0) {
		const winManager = new WindowManager()
		winManager.toggleWindow()
	}
})

app.on('window-all-closed', () => {
	if (process.platform !== 'darwin') app.quit()
})

app.on('will-quit', () => {
	Shortcuts.unregisterAll()
})

process.on('uncaughtException', (error) => {
	console.error('An uncaught error occurred:', error)

	// Show a message box
	dialog.showMessageBoxSync({
		type: 'error',
		title: 'Unexpected Error',
		message: 'An unexpected error occurred. The app will close.',
		detail: error.stack || error.message,
	})

	// Exit the app
	app.exit(1)
})