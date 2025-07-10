# Floaty: AI-Powered Note-Taking & Task Detection Extension

Floaty is a modern browser extension for AI-powered note-taking, smart task detection, and text highlighting. It helps you capture, organize, and act on information from any web page with ease.

---

## ✨ Features

### 🎯 Core Features
- **AI-Powered Notes**: Quickly save notes from any web page with automatic title generation
- **Smart Action Item Extraction**: Automatically detects actionable tasks from your notes
- **Text Highlighting**: Highlight and save important text on any page
- **Task Management**: View, check off, edit, and add action items directly in your notes
- **Global Search**: Instantly search all your notes, highlights, and tasks
- **Voice Dictation**: Speech-to-text support for hands-free note-taking
- **Text-to-Speech**: Read your notes aloud with TTS functionality

### 🎨 User Experience
- **Dark Mode**: Beautiful, modern UI with light and dark themes
- **Persistent Interface**: DevTools panel that stays open until manually closed
- **Cross-Platform**: Full support for Windows, Linux, and Mac
- **Responsive Design**: Works seamlessly across different screen sizes

### ⌨️ Power User Features
- **Comprehensive Hotkeys**: 20+ keyboard shortcuts for power users
- **Cross-Platform Hotkeys**: Works with Ctrl (Windows/Linux) and Cmd (Mac)
- **Quick Access**: Single-key shortcuts for common actions
- **Global Commands**: Browser-level shortcuts for instant access

### 🔧 Technical Features
- **Source URL Tracking**: Every note and highlight remembers its source page
- **Robust Error Handling**: Graceful handling of extension context changes
- **Auto-Reconnection**: Automatically reconnects when extension is reloaded
- **Storage Management**: Efficient local storage with data persistence

---

## 🚀 Quick Start

### Installation
1. **Clone or Download** this repository
2. **Open Chrome/Edge/Brave** and go to `chrome://extensions`
3. Enable **Developer Mode** (top right)
4. Click **Load unpacked** and select the project folder
5. Floaty will appear in your browser's extension bar

### Two Ways to Use Floaty

#### 🎯 Quick Actions (Popup)
- Click the extension icon in the toolbar
- Perfect for quick notes and fast tasks
- Closes when clicking outside (normal browser behavior)

#### 🎯 Extended Sessions (DevTools Panel) ⭐ **Recommended**
- Press `F12` (Windows/Linux) or `Cmd+Option+I` (Mac) to open DevTools
- Click the **"Floaty"** tab
- **Persistent interface** that stays open until you manually close DevTools
- Perfect for long note-taking and task management sessions

---

## ⌨️ Keyboard Shortcuts

### 🎯 Global Shortcuts (Work Anywhere)
| Shortcut | Action |
|----------|--------|
| `Esc` | Close modal only (doesn't close extension) |
| `/` | Toggle global search |

### ⚡ Power User Shortcuts (Ctrl+Shift / Cmd+Shift)
| Shortcut | Action |
|----------|--------|
| `Ctrl+Shift+F` / `Cmd+Shift+F` | Toggle global search |
| `Ctrl+Shift+D` / `Cmd+Shift+D` | Toggle voice dictation |
| `Ctrl+Shift+N` / `Cmd+Shift+N` | Focus note input |
| `Ctrl+Shift+T` / `Cmd+Shift+T` | Focus task input |
| `Ctrl+Shift+S` / `Cmd+Shift+S` | Switch to saved items tab |
| `Ctrl+Shift+1` / `Cmd+Shift+1` | Switch to notes tab |
| `Ctrl+Shift+2` / `Cmd+Shift+2` | Switch to saved items tab |
| `Ctrl+Shift+3` / `Cmd+Shift+3` | Switch to tasks tab |
| `Ctrl+Shift+M` / `Cmd+Shift+M` | Toggle dark mode |

### 🚀 Single Key Shortcuts (When not typing)
| Shortcut | Action |
|----------|--------|
| `N` | Switch to notes tab & focus input |
| `T` | Switch to tasks tab & focus input |
| `S` | Switch to saved items tab |

### 🌐 Content Script Hotkeys (On Webpages)
| Shortcut | Action |
|----------|--------|
| `Ctrl+Shift+D` / `Cmd+Shift+D` | Activate speech-to-text |
| `Ctrl+Shift+N` / `Cmd+Shift+N` | Activate note-taking |

### 🎤 Voice & Text Features
| Shortcut | Action |
|----------|--------|
| `Ctrl+Shift+D` / `Cmd+Shift+D` | Start/Stop voice dictation |
| `Ctrl+Shift+S` / `Cmd+Shift+S` | Read selected text aloud |
| `Ctrl+Shift+F` / `Cmd+Shift+F` | Search notes and saved items |

### 📝 Quick Access Shortcuts
| Shortcut | Action |
|----------|--------|
| `Ctrl+Shift+N` / `Cmd+Shift+N` | Quick note-taking |
| `Ctrl+Shift+T` / `Cmd+Shift+T` | Quick task creation |
| `Ctrl+Shift+S` / `Cmd+Shift+S` | Quick saved items access |

### 🎨 UI Navigation
| Shortcut | Action |
|----------|--------|
| `Esc` | Close any open modal |
| `Tab` | Navigate between elements |
| `Enter` | Submit forms, add notes/tasks |

### 🔍 Search & Navigation
| Shortcut | Action |
|----------|--------|
| `/` | Focus global search |
| `Ctrl+F` / `Cmd+F` | Find in current tab |
| `N` | Quick notes tab |
| `T` | Quick tasks tab |
| `S` | Quick saved items tab |

### 💡 Pro Tips
- **Mac Users**: Use `Cmd` instead of `Ctrl` for all shortcuts
- **DevTools Panel**: Press `F12` (Windows/Linux) or `Cmd+Option+I` (Mac) to open persistent panel
- **Voice Dictation**: Works best with clear speech and minimal background noise
- **Global Search**: Searches across all notes, highlights, and tasks instantly

---

## 🎯 Usage Guide

### Basic Usage
1. **Select text** on any web page to see the Floaty popup
2. **Highlight** or **save** the selection as a note
3. **Open the extension** to view, search, and manage your content

### Advanced Usage
1. **Use the DevTools panel** for persistent note-taking sessions
2. **Enable voice dictation** for hands-free note creation
3. **Use global search** to find any saved content instantly
4. **Extract tasks** from your notes automatically
5. **Organize with tags** and search functionality

### Text Selection Features
- **Highlight**: Mark important text in yellow
- **Save to Notes**: Add selected text to your notes
- **Copy**: Quick copy to clipboard
- **Extract Tasks**: Automatically identify actionable items

---

## 🛠️ Development

### Main Files
- **`popup.js`** — Main logic for popup UI and note/task management
- **`background.js`** — Handles background tasks, storage, and communication
- **`content.js`** — Injected into web pages for selection, highlighting, and popup
- **`popup.html`, `popup.css`** — UI and styling
- **`devtools.js`** — DevTools panel integration
- **`manifest.json`** — Extension configuration

### AI Integration
- **Keyword-based task extraction** is used by default (no AI key required)
- **Optional Gemini AI**: Add your Gemini API key in `popup.js` (`GeminiAIService` class)
- **Fallback systems**: Graceful degradation when AI is unavailable

### Cross-Platform Support
- **Windows/Linux**: Uses `Ctrl` key combinations
- **Mac**: Uses `Cmd` key combinations
- **Automatic detection**: Extension detects platform and adjusts accordingly

---

## 📦 Project Structure
```
Floaty AI Backup/
├── popup.js              # Main extension logic
├── popup.html            # Extension UI
├── popup.css             # Styling
├── background.js         # Background service worker
├── content.js            # Content script for web pages
├── devtools.js           # DevTools panel integration
├── devtools.html         # DevTools page
├── manifest.json         # Extension manifest
├── README.md             # This file
├── MAC_HOTKEYS.md        # Mac-specific hotkey guide
├── QUICK_START_GUIDE.md  # Quick start instructions
├── DEVTools_Instructions.md # DevTools panel guide
└── TROUBLESHOOTING.md    # Troubleshooting guide
```

---

## 🔧 Troubleshooting

### Common Issues
- **"Extension context became invalid"** - Refresh the page (normal when reloading extension)
- **Popup closes when clicking outside** - Use the DevTools panel for persistent mode
- **Hotkeys not working** - Check for system conflicts, refresh page
- **DevTools panel not showing** - Reload extension, close/reopen DevTools

### Quick Fixes
1. **Refresh the current page**
2. **Reload the extension** (chrome://extensions/ → refresh button)
3. **Restart the browser**
4. **Check the troubleshooting guide** for detailed solutions

---

## 🌟 New Features (v2.0.0)

### ✨ Major Improvements
- **Persistent DevTools Panel**: Interface that stays open until manually closed
- **Cross-Platform Hotkeys**: Full Mac support with Cmd key detection
- **Enhanced Error Handling**: Graceful handling of extension context changes
- **Auto-Reconnection**: Automatic recovery from extension reloads
- **Improved UI**: Better visual indicators and user feedback

### 🔧 Technical Enhancements
- **Robust Message Handling**: Safe communication between components
- **Platform Detection**: Automatic Mac/Windows/Linux key detection
- **Better Focus Management**: Improved popup persistence attempts
- **Enhanced Notifications**: Better user feedback and error messages

---

## 📝 License
MIT License. See [LICENSE](LICENSE) for details.

---

## 🙏 Credits
- Built with ❤️ for productivity enthusiasts
- Uses Google Gemini (optional, for AI extraction)
- Inspired by modern productivity tools
- Cross-platform compatibility for all users

---

## 📚 Documentation
- **[Quick Start Guide](QUICK_START_GUIDE.md)** - Get started quickly
- **[Mac Hotkeys](MAC_HOTKEYS.md)** - Mac-specific instructions
- **[DevTools Guide](DEVTools_Instructions.md)** - Using the persistent panel
- **[Troubleshooting](TROUBLESHOOTING.md)** - Common issues and solutions 