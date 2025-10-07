let operators = null;

// Listen for messages from the main process
window.api.receive('fromMain', (msg) => {
	console.log('[MAIN => REND]:', msg.command, msg.data)
	if (msg.command === 'triggerShow') {
		// clean the current input
		const searchInput = document.getElementById('searchInput')
		const results = document.getElementById('results')

		if (searchInput) {
			searchInput.value = ""
			searchInput.focus()
		}

		if (results) {
			results.innerHTML = "" // optional: clear old results
		}

		operators = msg.data.operators
		console.log('Loaded', operators.length, 'operators')
	}
})

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

document.addEventListener("DOMContentLoaded", () => {
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

	const searchInput = document.getElementById('searchInput')
	const resultHtml = document.getElementById('result')

	function renderResult(result) {
		if (result) {
			resultHtml.innerHTML = renderListItem(result)
			resultHtml.classList.add("has-result")
		} else {
			resultHtml.classList.remove("has-result")
			// remove content **after** transition ends
			resultHtml.addEventListener("transitionend", function cleanup() {
				if (!resultHtml.classList.contains("has-result")) {
					resultHtml.innerHTML = ""
				}
				resultHtml.removeEventListener("transitionend", cleanup)
			})
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
