// preload/preload.js
const { contextBridge, ipcRenderer } = require('electron')

// Expose a safe API to renderer
contextBridge.exposeInMainWorld('api', {
	send: (channel, data) => {
		// whitelist channels
		const validChannels = ['toMain']
		if (validChannels.includes(channel)) {
			ipcRenderer.send(channel, data)
		}
	},
	receive: (channel, func) => {
		const validChannels = ['fromMain']
		if (validChannels.includes(channel)) {
			ipcRenderer.on(channel, (event, ...args) => func(...args))
		}
	}
})