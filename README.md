# Clipboard Operator

An Electron-based **clipboard manager** that applies JavaScript transformation operations to clipboard content.
Lightweight, customizable, and designed for developers who frequently need to reformat or transform copied text — including AI-powered transformations via LLM APIs.

---

## Usage

![Usage Demo](doc/video-usage.gif)

---

## Features

- Call up an input menu with a keyboard shortcut or tray icon.
- Apply custom transformation operations to clipboard content.
- Define operators via a JSON config file pointing to JavaScript scripts.
- Supports LLM-powered operators using any OpenRouter-compatible model.
- Streams LLM responses token-by-token with a live fading log panel in the UI.
- Ships with an `examples/` folder to get started quickly.

---

## How to Use

1. Open the input menu with <kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>Space</kbd> or by clicking the tray icon.
2. Select an operation and press <kbd>Enter</kbd>.
3. The clipboard content is instantly updated and the menu closes.

---

## Getting Started

On first run, the app creates a `workspace/` folder next to the executable (or in the project root when running from source). This folder is your personal configuration space.

### Folder structure

```
workspace/
  operators.json    ← defines your operators
  config.json       ← optional: API keys and model settings
```

The `examples/` folder in the repo contains ready-to-use operators and scripts you can copy into your workspace.

---

## Defining Operators

Operators are listed in `workspace/operators.json`. Each entry points to a JavaScript script:

```json
[
  {
    "operator": "To Pascal Case",
    "description": "Converts clipboard text to PascalCase",
    "icon": "text_fields",
    "aliases": ["pascal", "PascalCase"],
    "script": "./examples/to-pascal-case.js"
  },
  {
    "operator": "Fix Grammar",
    "description": "Fixes grammar and spelling using AI",
    "icon": "spellcheck",
    "aliases": ["grammar", "fix", "spelling"],
    "script": "./examples/openrouter-api-call.js",
    "instruction": "Fix any grammar and spelling mistakes. Keep the same tone and style."
  },
  {
    "operator": "Proofread",
    "description": "Proofreads text and suggests corrections using AI",
    "icon": "rate_review",
    "aliases": ["proofread", "review", "check"],
    "script": "./examples/openrouter-api-call.js",
    "instruction": "Proofread the text. Fix spelling, grammar, punctuation, and awkward phrasing. Keep the original meaning and tone intact. Return only the corrected text."
  }
]
```

---

## Writing a Script

Each script exports an async `run` function that receives the clipboard content and an operator context object, and returns the transformed result:

```javascript
export async function run(input, operator) {
    return input.trim().toUpperCase();
}
```

The `operator` argument contains the fields defined in `operators.json` plus two extras injected at runtime:

| Field | Description |
|---|---|
| `operator.instruction` | The `instruction` string from `operators.json`, if set |
| `operator._workspaceDir` | Absolute path to the `workspace/` folder |
| `operator.onToken` | Callback `(token: string) => void` — call this to stream output tokens live to the UI |

### Example: To Pascal Case

[examples/to-pascal-case.js](examples/to-pascal-case.js)

```javascript
export async function run(input) {
    return input
        .trim()
        .split(/[\s_\-]+/)
        .filter(word => word.length > 0)
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join('');
}
```

Input: `"hello world"` → Output: `"HelloWorld"`
Input: `"some_variable_name"` → Output: `"SomeVariableName"`

---

## LLM-Powered Operators

For AI-powered transformations, use the shared [examples/openrouter-api-call.js](examples/openrouter-api-call.js) script. It calls the [OpenRouter](https://openrouter.ai/) API with any model you configure, streaming the response token-by-token. As the model generates text, each token is forwarded live to a fading log panel in the UI so you can see progress in real time.

### 1. Add your API key

Create `workspace/config.json`:

```json
{
  "OPENROUTER_API_KEY": "sk-or-...",
  "model": "x-ai/grok-4-fast"
}
```

You can also set `OPENROUTER_API_KEY` as an environment variable instead.

### 2. Add operators with an `instruction` field

The `instruction` field in `operators.json` tells the LLM what to do with the clipboard text:

```json
{
  "operator": "Fix Grammar",
  "description": "Fixes grammar and spelling using AI",
  "icon": "spellcheck",
  "aliases": ["grammar", "fix"],
  "script": "./examples/openrouter-api-call.js",
  "instruction": "Fix any grammar and spelling mistakes. Keep the same tone and style."
}
```

Multiple operators can reuse the same script — just change the `instruction`:

```json
{
  "operator": "Proofread",
  "description": "Proofreads text and suggests corrections using AI",
  "icon": "rate_review",
  "aliases": ["proofread", "review"],
  "script": "./examples/openrouter-api-call.js",
  "instruction": "Proofread the text. Fix spelling, grammar, punctuation, and awkward phrasing. Keep the original meaning and tone intact. Return only the corrected text."
}
```

---

## Installation (from source)

```bash
git clone <repo-url>
cd clipboard-operator

npm install
npm start
```

Requirements:

- [Node.js (>= 18)](https://nodejs.org/)
- [Electron](https://www.electronjs.org/)

### Development

```bash
# Start with hot reload
npm run dev

# Build for distribution
npm run build
```

---

## FAQ

**Q: Can I define my own operators?**
A: Yes. Add entries to `workspace/operators.json` and create a script that exports a `run` function. You can also reuse the LLM script with a custom `instruction`.

**Q: Does it work on Linux/Mac?**
A: Electron is cross-platform. Tested primarily on Windows.

**Q: Which LLM models are supported?**
A: Any model available on [OpenRouter](https://openrouter.ai/models). Set the model name in `workspace/config.json`.

---

## Contributing

Contributions are welcome!

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/my-feature`)
3. Commit your changes
4. Open a Pull Request

---

## License

MIT License — feel free to use, modify, and distribute.
