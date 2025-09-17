const { app } = require('electron')

const DEBUG = process.env.NODE_ENV === "development"
const WIDTH = 350
const HEIGHT = 300
const OPERATIONS_PATH = 'C:\\Users\\engjg\\dev\\copy-to-prompt\\operators.json'

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

app.whenReady().then(() => {
	const opManager = new OperationsManager(OPERATIONS_PATH)
	const winManager = new WindowManager(WIDTH, HEIGHT)
	const trayManager = new TrayManager(winManager)
	const shortcuts = new Shortcuts(winManager)

	trayManager.init()
	shortcuts.init()
	winManager.toggleWindow()
	opManager.load()

	ipc.setupIPC(opManager)
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
	const Shortcuts = require('./shortcuts')
	Shortcuts.unregisterAll()
})
