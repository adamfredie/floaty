// DevTools script for Floaty extension
// This creates a persistent panel that stays open until manually closed

chrome.devtools.panels.create(
  "Floaty", // Panel title
  null, // Panel icon (null for default)
  "popup.html", // Panel page
  (panel) => {
    // Panel created successfully
    console.log("Floaty DevTools panel created");
    
    // Listen for panel show/hide events
    panel.onShown.addListener((window) => {
      console.log("Floaty panel shown");
      // Notify the panel that it's in DevTools mode
      window.postMessage({ type: 'devtools-mode', active: true }, '*');
    });
    
    panel.onHidden.addListener(() => {
      console.log("Floaty panel hidden");
    });
  }
); 