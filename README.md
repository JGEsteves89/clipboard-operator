An Electron-based **clipboard manager** that applies transformation operations to the current clipboard content.  
It’s lightweight, customizable, and designed for developers who frequently need to reformat or transform copied text.

---

## ✨ Features

* Call up an input menu with a keyboard shortcut or tray icon.
* Apply custom transformation operations to clipboard content.
* Define your own operators via JSON + JavaScript scripts.
* Extendable and developer-friendly.

---

## 🚀 How to Use

1. Open the input menu with the shortcut <kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>Space</kbd> or by clicking the tray icon.  
2. Select the desired operation and press <kbd>Enter</kbd>.  
3. The clipboard content is instantly updated, and the menu closes automatically.  

---

## ⚙️ How Operators Work

Operators are defined in a JSON file, for example:

```json
{
  "operator": "Escape path",
  "aliases": ["escape"],
  "description": "Convert any path like C:\\Users\\me to C:\\\\Users\\\\me",
  "icon": "folder_code",
  "script": "escape_path.js"
},
{
  "operator": "Toggle wslpath",
  "aliases": ["wsl"],
  "description": "Toggle WSL Linux <=> Windows paths",
  "icon": "rule_folder",
  "script": "toggle_wslpath.js"
}
```

Each operator points to a JavaScript file with a standardized structure:

```javascript
export async function run(rawData) {
    const transformedData = yourFunction(rawData);
    return transformedData;
}
```

For example:

```javascript
// escape_path.js
export async function run(rawData) {
    return rawData.replaceAll('\\', '\\\\');
}
```

## 📦 Installation (from source code)

```bash
# Clone the repository
git clone {TODO}
cd clipboard-operator

# Install dependencies
npm install

# Run the app
npm start
```

---

## Development

```bash
# Start in development mode with hot reload
npm run dev

# Build the app for distribution
npm run build
```

Requirements:

* [Node.js (>= 18)](https://nodejs.org/)
* [Electron](https://www.electronjs.org/)

---

## 🎯 Current Milestones

* [X] Basic clipboard operations
* [X] JSON-defined operators
* [ ] Define json and operators folders 
* [ ] Installations VS portable
* [ ] Configurable keyboard shortcuts
* [ ] Operator marketplace / sharing
* [ ] Multi-platform packaging
* [ ] Configure automatic release
* [ ] Telemetry

---

## 🐛 Issues

Found a bug? Open an issue
and include:
* Steps to reproduce
* Expected behaviour
* Actual behaviour
* System information (OS, Node, Electron version)

---

## ❓ FAQ

**Q: Can I define my own operators?**  
A: Yes! Just add them to the operators JSON and create a script with a `run` function.
**Q: Does it work on Linux/Mac?**  
A: Yes, Electron apps are cross-platform. Tested primarily on Windows for now.

---

## 🤝 Contributing

Contributions are welcome!
1. Fork the repository
2. Create your feature branch (`git checkout -b feature/my-feature`)
3. Commit your changes (`git commit -m 'Add feature'`)
4. Push to the branch (`git push origin feature/my-feature`)
5. Open a Pull Request

---

## 📄 License

MIT License – feel free to use, modify, and distribute.
