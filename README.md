# Floaty: AI-Powered Note-Taking & Task Detection Extension

Floaty is a modern browser extension for AI-powered note-taking, smart task detection, and text highlighting. It helps you capture, organize, and act on information from any web page with ease.

---

## ✨ Features
- **AI-Powered Notes**: Quickly save notes from any web page.
- **Smart Action Item Extraction**: Automatically detects actionable tasks from your notes (using keyword-based extraction, no AI required).
- **Highlighting**: Highlight and save important text on any page.
- **Task Management**: View, check off, edit, and add action items directly in your notes.
- **Global Search**: Instantly search all your notes, highlights, and tasks.
- **Dark Mode**: Beautiful, modern UI with light and dark themes.
- **Keyboard Shortcuts**: Power user hotkeys for dictation, quick notes, search, and more.
- **Source URL Tracking**: Every note and highlight remembers its source page.

---

## 🛠️ Installation
1. **Clone or Download** this repository.
2. **Open Chrome/Edge/Brave** and go to `chrome://extensions`.
3. Enable **Developer Mode** (top right).
4. Click **Load unpacked** and select the project folder.
5. Floaty will appear in your browser’s extension bar.

---

## 🚀 Usage
- **Select text** on any web page to see the Floaty popup.
- **Highlight** or **save** the selection as a note.
- **Open the extension popup** to view, search, and manage your notes, highlights, and tasks.
- **Use keyboard shortcuts** for quick actions (see Hotkeys in the popup for details).
- **Dark mode** can be toggled from the popup header.

---

## 🧑‍💻 Development
- **Main files:**
  - `popup.js` — Main logic for popup UI and note/task management
  - `background.js` — Handles background tasks, storage, and communication
  - `content.js` — Injected into web pages for selection, highlighting, and popup
  - `popup.html`, `popup.css` — UI and styling
- **Keyword-based task extraction** is used by default (no AI key required).
- **To use Gemini AI for extraction:**
  - Add your Gemini API key in `popup.js` (`GeminiAIService` class)
  - Uncomment the AI extraction logic in `addNote`

---

## 📦 Folder Structure
```
floaty-momin-features/
  |-- popup.js
  |-- popup.html
  |-- popup.css
  |-- background.js
  |-- content.js
  |-- manifest.json
  |-- ...
```

---

## 📝 License
MIT License. See [LICENSE](LICENSE) for details.

---

## 🙏 Credits
- Built with ❤️ by [Your Name].
- Uses Google Gemini (optional, for AI extraction).
- Inspired by modern productivity tools. 