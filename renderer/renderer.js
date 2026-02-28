let operators = null

const MAX_LOG_LINES = 7

// Listen for messages from the main process
window.api.receive('fromMain', (msg) => {
	console.log('[MAIN => REND]:', msg.command, msg.data)
	if (msg.command === 'triggerShow') {
		// clean the current input
		const searchInput = document.getElementById('searchInput')
		const results = document.getElementById('result')

		if (searchInput) {
			searchInput.value = ""
			searchInput.focus()
		}

		if (results) {
			hideResult()
		}

		operators = msg.data.operators
		console.log('Loaded', operators.length, 'operators')
	}
	if (msg.command === 'scriptStart') {
		showLogPanel()
	}
	if (msg.command === 'scriptLog') {
		addLogLine(msg.data.text)
	}
	if (msg.command === 'scriptLogToken') {
		appendToLiveLine(msg.data.token)
	}
})

function showLogPanel() {
	const resultEl = document.getElementById('result')
	resultEl.innerHTML = '<div id="log-lines"></div>'
	resultEl.classList.add('has-result')
}

function updateOpacities(container) {
	const all = container.querySelectorAll('.log-line')
	const total = all.length
	all.forEach((el, i) => {
		const age = total - 1 - i  // 0 = newest (bottom)
		el.style.opacity = Math.max(0.07, 1 - age * 0.18)
	})
}

function addLogLine(text) {
	if (/^#+$/.test(text.trim())) return  // filter ############ lines

	const container = document.getElementById('log-lines')
	if (!container) return

	const display = text.length > 72 ? text.slice(0, 69) + '…' : text

	const div = document.createElement('div')
	div.className = 'log-line'
	div.textContent = '› ' + display
	div.style.opacity = '0'
	container.appendChild(div)

	// Prune excess DOM nodes (oldest lines are at the top)
	if (container.querySelectorAll('.log-line').length > MAX_LOG_LINES) {
		container.removeChild(container.firstChild)
	}

	// Double rAF: first frame renders at opacity 0, second fires the CSS transition
	requestAnimationFrame(() => requestAnimationFrame(() => updateOpacities(container)))
}

function appendToLiveLine(token) {
	const container = document.getElementById('log-lines')
	if (!container) return

	const parts = token.split('\n')
	let needsOpacityUpdate = false

	parts.forEach((part, i) => {
		if (i > 0) {
			// Newline boundary — commit the current live line
			const current = container.querySelector('.log-line.live')
			if (current) current.classList.remove('live')
			needsOpacityUpdate = true
		}

		if (!part) return  // empty segment (token was just "\n", or starts/ends with one)

		let liveLine = container.querySelector('.log-line.live')
		if (!liveLine) {
			liveLine = document.createElement('div')
			liveLine.className = 'log-line live'
			liveLine.dataset.accumulated = ''
			liveLine.style.opacity = '0'
			container.appendChild(liveLine)
			needsOpacityUpdate = true

			if (container.querySelectorAll('.log-line').length > MAX_LOG_LINES) {
				container.removeChild(container.firstChild)
			}
		}

		const accumulated = (liveLine.dataset.accumulated ?? '') + part
		liveLine.dataset.accumulated = accumulated
		const display = accumulated.length > 70 ? '…' + accumulated.slice(-67) : accumulated
		liveLine.textContent = '› ' + display
	})

	if (needsOpacityUpdate) {
		requestAnimationFrame(() => requestAnimationFrame(() => updateOpacities(container)))
	}
}

const getBestResult = (input) => {
	if (!operators) return
	const query = input.value.toLowerCase()
	// eslint-disable-next-line no-undef
	const fuse = new Fuse(operators, {
		keys: [
			{ name: 'operator', weight: 0.7 }, // headline is more important
			// { name: 'text', weight: 0.3 }      // text is secondary
		],
		threshold: 0.4,  // lower = stricter match, higher = fuzzier
		ignoreLocation: true,
	})
	const filtered = fuse.search(query).map(r => r.item)
	return filtered.length > 0 ? filtered[0] : undefined
}

const renderListItem = (result) => {
	// you can check all the icons in https://fonts.google.com/icons
	return `\
				<article class="article round p-2 text-sm">
					<div class="row gap-2">
						<i class="material-symbols-outlined">${result.icon}</i>
						<div class="max">
							<h5 class="text-sm mb-0">${result.operator}</h5>
							<p class="text-xs mb-1">${result.description}</p>
						</div>
					</div>
					<nav class="flex flex-wrap gap-1 mt-1">
						${result.aliases.map(a => `<button class="chip px-2 py-0.5 text-xs white">${a}</button>`).join('\n')}
					</nav>
				</article>`
}

const showResult = (result) => {
	const resultHtml = document.getElementById('result')
	resultHtml.innerHTML = renderListItem(result)
	resultHtml.classList.add("has-result")
}

const hideResult = () => {
	const resultHtml = document.getElementById('result')
	resultHtml.classList.remove("has-result")
	// remove content **after** transition ends
	resultHtml.addEventListener("transitionend", function cleanup() {
		if (!resultHtml.classList.contains("has-result")) {
			resultHtml.innerHTML = ""
		}
		resultHtml.removeEventListener("transitionend", cleanup)
	})
}

document.addEventListener("DOMContentLoaded", () => {

	const searchInput = document.getElementById('searchInput')

	document.getElementById('openFolderBtn').addEventListener('click', () => {
		window.api.send('toMain', { command: 'openOperatorsFolder', data: {} })
	})

	function renderResult(result) {
		if (result) {
			showResult(result)
		} else {
			hideResult(result)
		}
	}

	let debounceTimer = null
	searchInput.addEventListener('input', () => {
		clearTimeout(debounceTimer)
		debounceTimer = setTimeout(searchAndRender, 200) // 200ms delay
	})

	function searchAndRender() {
		const bestResult = getBestResult(searchInput)
		renderResult(bestResult)
	}

	document.addEventListener('keydown', (e) => {
		if (e.key === 'Enter') {
			const result = getBestResult(searchInput)

			window.api.send('toMain', {
				command: 'runOperator',
				data: result
			})

			const resultHtml = document.getElementById('result')
			searchInput.value = ""
			resultHtml.innerHTML = ""
		}
	})

	if (!operators) {
		window.api.send('toMain', {
			command: 'getOperators',
			data: {}
		})
	}

	// Initial render: empty
	renderResult()
	searchInput.focus()
})
