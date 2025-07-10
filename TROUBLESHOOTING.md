# Troubleshooting Guide

## Common Issues and Solutions

### 🔄 "Extension context became invalid" Error

**What it means:**
- This error occurs when the extension context is lost
- It's normal when reloading the extension
- It can happen when the extension is updated or restarted

**Solutions:**
1. **Refresh the page** - This is the simplest solution
2. **Reload the extension** - Go to `chrome://extensions/` and click the refresh button
3. **Wait for auto-reconnection** - The extension will try to reconnect automatically

**When to worry:**
- Only if the error persists after refreshing the page
- Only if features stop working completely

### 🚫 Popup Closes When Clicking Outside

**This is normal behavior!** Browser extension popups always close when clicking outside due to Chrome security policies.

**Solution:** Use the DevTools panel instead:
1. Press `F12` to open DevTools
2. Click the "Floaty" tab
3. This panel stays open until you manually close it

### 🔧 DevTools Panel Not Showing

**If you don't see the "Floaty" tab in DevTools:**

1. **Reload the extension:**
   - Go to `chrome://extensions/`
   - Find "Floaty" and click the refresh button

2. **Close and reopen DevTools:**
   - Close DevTools completely
   - Press `F12` again to reopen

3. **Check extension is enabled:**
   - Make sure the extension toggle is ON in `chrome://extensions/`

### 🎤 Speech Recognition Not Working

**Common causes:**
- Microphone permission denied
- Browser doesn't support speech recognition
- Extension context lost

**Solutions:**
1. **Allow microphone access** when prompted
2. **Check browser settings** for microphone permissions
3. **Refresh the page** if extension context is lost

### 💾 Data Not Saving

**If notes/tasks aren't being saved:**

1. **Check storage permissions:**
   - Go to `chrome://extensions/`
   - Find "Floaty" and click "Details"
   - Make sure "Storage" permission is enabled

2. **Refresh the page** to restore extension context

3. **Check browser storage:**
   - Open DevTools → Application → Storage → Local Storage
   - Look for "chrome-extension://[extension-id]"

### 🔑 Keyboard Shortcuts Not Working

**If shortcuts like Ctrl+Shift+D aren't working:**

1. **Check for conflicts:**
   - Other extensions might be using the same shortcuts
   - Check `chrome://extensions/shortcuts`

2. **Refresh the page** to restore extension context

3. **Use the interface buttons** instead of shortcuts

### 🎨 Dark Mode Not Working

**If dark mode toggle doesn't work:**

1. **Refresh the page** to restore extension context
2. **Check if the setting is saved** in extension storage
3. **Try toggling it again**

## Getting Help

If you're still having issues:

1. **Check the console** (F12 → Console) for error messages
2. **Reload the extension** and refresh the page
3. **Try in a different browser** to isolate the issue
4. **Check if the issue persists** after a browser restart

## Quick Fixes

**For most issues, try these steps in order:**

1. **Refresh the current page**
2. **Reload the extension** (chrome://extensions/ → refresh button)
3. **Restart the browser**
4. **Reinstall the extension** (remove and add again)

Most issues are resolved by refreshing the page or reloading the extension! 