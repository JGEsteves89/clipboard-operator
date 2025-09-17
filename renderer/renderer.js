
window.api.send('toMain', { message: 'Hello from renderer!' })
window.api.receive('fromMain', (data) => {
	console.log('Got from main:', data)
})

const items = [
	{ operator: "Apple", description: 'this is small desc' },
	{ operator: "Banana", description: 'this is small desc' },
	{ operator: "Cherry", description: 'this is small desc' },
	{ operator: "Date", description: 'this is small desc' },
	{ operator: "Elderberry", description: 'this is small desc' },
]

const searchOptions = {
	keys: [
		{ name: 'operator', weight: 0.7 }, // headline is more important
		// { name: 'text', weight: 0.3 }      // text is secondary
	],
	threshold: 0.4,  // lower = stricter match, higher = fuzzier
	ignoreLocation: true,
}


function renderListItem(result) {
	return `
		<article class="blur">
			<div class="max">
				<h6 class="small">${result.operator}</h6>
				<div>${result.description}</div>
			</div>
		</article>
		`
}
const searchInput = document.getElementById('searchInput')
const results = document.getElementById('results')

function renderResult(result) {
	results.innerHTML = ""
	if (result) {
		console.log('Best result is', result)
		results.innerHTML = renderListItem(result)
	} else {
		console.log('No best result')
	}
}

searchInput.addEventListener('input', () => {
	const query = searchInput.value.toLowerCase()
	const fuse = new Fuse(items, searchOptions)
	const filtered = fuse.search(query).map(r => r.item)
	const bestResult = filtered.length > 0 ? filtered[0] : undefined
	renderResult(bestResult)
})

// Initial render: empty
renderResult()