const path = require('path')
const fs = require('fs')

class OperationsManager {
	constructor(OPERATIONS_PATH) {
		this.path = OPERATIONS_PATH
		this.operators = []
	}

	load() {
		// checks if all the folder os the path exist, if not create them
		const dir = path.dirname(this.path)
		if (!fs.existsSync(dir)) {
			console.log('Creating file paths for this app in', dir)
			fs.mkdirSync(dir, { recursive: true })
		}

		// checks if the file exist, if not, creat it
		if (!fs.existsSync(this.path)) {
			console.log('No operation json file was found in', this.path)
			fs.writeFileSync(this.path, '[]')
		}

		this.operators = JSON.parse(fs.readFileSync(this.path).toString())
	}
}

module.exports = OperationsManager
