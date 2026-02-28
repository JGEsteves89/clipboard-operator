/**
 * AI-powered text transformer using OpenRouter.
 *
 * Requires workspace/config.json with at minimum:
 *   {
 *     "OPENROUTER_API_KEY": "sk-or-...",
 *     "model": "x-ai/grok-4-fast"
 *   }
 *
 * The operator definition in operators.json must include an "instruction" field:
 *   {
 *     "operator": "Fix Grammar",
 *     "script": "./examples/openrouter-api-call.js",
 *     "instruction": "Fix grammar and spelling. Keep the same tone."
 *   }
 */

import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'

/** Resolve the directory of this script, stripping the cache-bust query string. */
function getScriptDir() {
	const url = new URL(import.meta.url)
	url.search = ''
	return path.dirname(fileURLToPath(url))
}

/** Load config.json from the workspace directory. */
async function loadConfig(workspaceDir) {
	const configPath = path.join(workspaceDir, 'config.json')
	try {
		return JSON.parse(await fs.readFile(configPath, 'utf-8'))
	} catch {
		return {}
	}
}

function parseResult(output) {
	const start = output.indexOf('<output_start>')
	const end = output.indexOf('<output_end>')
	if (start !== -1 && end !== -1) {
		return output.slice(start + '<output_start>'.length, end).trim()
	}
	return output.trim()
}

export async function run(input, operator) {
	const instruction = operator?.instruction
	if (!instruction) {
		throw new Error(
			`Operator "${operator?.operator}" is missing an "instruction" field in operators.json.`
		)
	}

	const scriptDir = getScriptDir()
	const workspaceDir = operator._workspaceDir ?? path.join(scriptDir, '..')
	console.log('[SCRIPT] workspaceDir:', workspaceDir)
	console.log('[SCRIPT] scriptDir:', scriptDir)

	const [systemPrompt, userTemplate, config] = await Promise.all([
		fs.readFile(path.join(scriptDir, 'prompts', 'system_prompt.txt'), 'utf-8'),
		fs.readFile(path.join(scriptDir, 'prompts', 'user_message.txt'), 'utf-8'),
		loadConfig(workspaceDir),
	])

	const apiKey = process.env.OPENROUTER_API_KEY || config.OPENROUTER_API_KEY
	console.log('[SCRIPT] API key source:', process.env.OPENROUTER_API_KEY ? 'env var' : config.OPENROUTER_API_KEY ? 'config.json' : 'NOT FOUND')
	if (!apiKey) {
		throw new Error(
			'No OpenRouter API key found.\n' +
			'Set OPENROUTER_API_KEY as an environment variable, or add it to workspace/config.json:\n' +
			'{ "OPENROUTER_API_KEY": "sk-or-..." }'
		)
	}

	const model = config.model
	if (!model) {
		throw new Error('No model configured. Add "model" to workspace/config.json, e.g. "model": "x-ai/grok-4-fast"')
	}
	console.log('[SCRIPT] model:', model)
	console.log('[SCRIPT] instruction:', instruction)

	const userMessage = userTemplate
		.replace('{{inputText}}', input)
		.replace('{{instruction}}', instruction)

	console.log('[SCRIPT] sending request to OpenRouter...')
	const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
		method: 'POST',
		headers: {
			'Authorization': `Bearer ${apiKey}`,
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({
			model,
			messages: [
				{ role: 'system', content: systemPrompt },
				{ role: 'user', content: userMessage },
			],
			max_tokens: 1000,
		}),
	})

	console.log('[SCRIPT] response status:', response.status)
	if (!response.ok) {
		const body = await response.text()
		console.error('[SCRIPT] error body:', body)
		throw new Error(`OpenRouter API error ${response.status}: ${body}`)
	}

	const data = await response.json()
	const rawContent = data.choices[0].message.content
	console.log('[SCRIPT] raw response:', rawContent)

	const parsed = parseResult(rawContent)
	const matched = rawContent.includes('<output_start>') && rawContent.includes('<output_end>')
	console.log('[SCRIPT] pattern matched:', matched, '| parsed result:', parsed)

	return parsed
}
