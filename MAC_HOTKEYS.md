# Mac Hotkeys for Floaty Extension

## ⌨️ Mac-Specific Hotkeys

### Global Shortcuts (Work Anywhere)
- **`Esc`** - Close modal only (doesn't close extension popup)
- **`/`** - Toggle global search

### Power User Shortcuts (Cmd+Shift)
- **`Cmd+Shift+F`** - Toggle global search
- **`Cmd+Shift+D`** - Toggle dictation/speech-to-text
- **`Cmd+Shift+N`** - Focus note input
- **`Cmd+Shift+T`** - Focus task input
- **`Cmd+Shift+S`** - Switch to saved items tab
- **`Cmd+Shift+1`** - Switch to notes tab
- **`Cmd+Shift+2`** - Switch to saved items tab
- **`Cmd+Shift+3`** - Switch to tasks tab
- **`Cmd+Shift+M`** - Toggle dark mode

### Single Key Shortcuts (When not typing)
- **`N`** - Switch to notes tab and focus note input
- **`T`** - Switch to tasks tab and focus task input
- **`S`** - Switch to saved items tab

### Content Script Hotkeys (On Webpages)
- **`Cmd+Shift+D`** - Activate speech-to-text
- **`Cmd+Shift+N`** - Activate note-taking

### Browser Extension Commands
These are defined in your `manifest.json` and can be customized in Chrome:
- **`Cmd+Shift+D`** - Start/Stop speech-to-text dictation
- **`Cmd+Shift+N`** - Open quick note-taking
- **`Cmd+Shift+S`** - Read selected text aloud
- **`Cmd+Shift+F`** - Search notes and saved items

## 🍎 Mac-Specific Notes

### Key Differences from Windows/Linux
- Use **`Cmd` (⌘)** instead of **`Ctrl`**
- Use **`Option` (⌥)** instead of **`Alt`**
- Use **`Cmd+Option+I`** to open DevTools (instead of F12)

### DevTools Panel Access
To use the persistent DevTools panel on Mac:
1. Press **`Cmd+Option+I`** to open DevTools
2. Click the **"Floaty"** tab
3. This panel stays open until you manually close DevTools

### Potential System Conflicts
Some Mac system shortcuts might conflict:
- **`Cmd+Shift+S`** - System screenshot (might conflict with Floaty)
- **`Cmd+Shift+N`** - New folder in Finder (might conflict with Floaty)

### Customizing Hotkeys
If you experience conflicts, you can customize the browser extension commands:
1. Go to `chrome://extensions/shortcuts`
2. Find "Floaty" extension
3. Click the pencil icon to edit shortcuts
4. Set your preferred key combinations

## 🎯 Most Useful Mac Hotkeys

**For Quick Access:**
- `Cmd+Shift+N` - Quick note taking
- `Cmd+Shift+D` - Voice dictation
- `/` - Global search across all notes

**For Navigation:**
- `N` - Notes tab
- `T` - Tasks tab  
- `S` - Saved items tab

**For Modals:**
- `Esc` - Close any open modal

**For DevTools Panel:**
- `Cmd+Option+I` - Open DevTools, then click "Floaty" tab

## 🔧 Troubleshooting on Mac

**If hotkeys aren't working:**
1. Check for system conflicts in System Preferences → Keyboard → Shortcuts
2. Make sure you're not typing in an input field
3. Try refreshing the page to restore extension context
4. Check if the extension is enabled in `chrome://extensions/`

**If DevTools panel isn't showing:**
1. Reload the extension in `chrome://extensions/`
2. Close and reopen DevTools (`Cmd+Option+I`)
3. Look for the "Floaty" tab in DevTools

All hotkeys should now work properly on Mac with the `Cmd` key instead of `Ctrl`! 