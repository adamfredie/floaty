// GeminiAIService for AI-powered title, summary, and action item extraction
class GeminiAIService {
  constructor() {
    // Backend API URL - Vercel deployment
    this.baseUrl = "https://floaty-hyax9pwiv-arrythmias-projects.vercel.app/api"
  }

  async generateTitle(text, context = "") {
    try {
      const response = await fetch(`${this.baseUrl}/generate-title`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text, context })
      })

      if (!response.ok) {
        throw new Error("Failed to generate title")
      }

      const data = await response.json()
      const title = data.title || "Untitled Note"

      return title.length > 50 ? title.substring(0, 47) + "..." : title
    } catch (error) {
      console.log("Using fallback title generation")
      return this.fallbackTitle(text, context)
    }
  }

  async generateSummary(text) {
    try {
      const response = await fetch(`${this.baseUrl}/generate-summary`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text })
      })

      if (!response.ok) {
        throw new Error("Failed to generate summary")
      }

      const data = await response.json()
      return data.summary || "Unable to generate summary."
    } catch (error) {
      console.log("Using fallback summary generation")
      return this.fallbackSummary(text)
    }
  }

  async extractActionItems(text, context = "") {
    try {
      const response = await fetch(`${this.baseUrl}/extract-tasks`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text, context })
      })

      if (!response.ok) {
        throw new Error("Failed to extract action items")
      }

      const data = await response.json()
      return data.tasks || []
    } catch (error) {
      console.log("Using fallback action item extraction")
      return this.fallbackActionItems(text)
    }
  }

  fallbackTitle(text, context = "") {
    // Clean the text and get first few meaningful words
    const cleanText = text.replace(/\s+/g, ' ').trim()
    const words = cleanText.split(" ").filter(word => word.length > 0).slice(0, 6)
    let title = words.join(" ")

    // Truncate if too long
    if (title.length > 50) {
      title = title.substring(0, 47) + "..."
    }

    // Add context if provided
    if (context && context.trim()) {
      const contextPrefix = `[${context.trim()}] `
      if (title.length + contextPrefix.length <= 50) {
        title = contextPrefix + title
      } else {
        title = contextPrefix + title.substring(0, 50 - contextPrefix.length - 3) + "..."
      }
    }

    return title || "Untitled Note"
  }

  fallbackSummary(text) {
    const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 0)
    if (sentences.length <= 2) return "Text is already concise."

    return sentences[0].trim() + ". " + sentences[sentences.length - 1].trim() + "."
  }

  fallbackActionItems(text) {
    console.log('[Floaty] fallbackActionItems called with text:', text.substring(0, 100) + '...')
    
    const actionWords = ["todo", "task", "do", "complete", "call", "email", "buy", "get", "make", "check", "schedule", "need", "should", "must", "have to", "remember", "follow up", "review", "update", "create", "write", "send", "prepare", "organize", "plan", "implement", "fix", "add", "remove", "setup", "configure", "meet", "attend", "join", "start", "finish", "stop", "continue", "research", "study", "learn", "practice", "train", "exercise", "clean", "wash", "cook", "shop", "pay", "transfer", "deposit", "book", "order", "arrange", "set up", "install", "download", "upload", "submit", "apply", "register", "sign up", "contact"]
    
    // Split text into different formats
    const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 0)
    const lines = text.split(/\n+/).filter((l) => l.trim().length > 0)
    const bulletPoints = text.split(/(?:\n|^)\s*[-•*]\s+/).filter((b) => b.trim().length > 0)
    
    console.log('[Floaty] Split into:', {
      sentences: sentences.length,
      lines: lines.length,
      bulletPoints: bulletPoints.length
    })

    let actionItems = []

    // First, try to find action items from bullet points
    bulletPoints.forEach(point => {
      const trimmed = point.trim()
      if (trimmed.length > 5 && trimmed.length < 100) {
        actionItems.push(trimmed)
      }
    })

    // Then try sentences with action words
    sentences.forEach((sentence) => {
      const lowerSentence = sentence.toLowerCase()
      const hasActionWord = actionWords.some((word) => lowerSentence.includes(word))
      const isQuestion = lowerSentence.includes('?')
      const startsWithCapital = /^[A-Z]/.test(sentence.trim())
      
      console.log('[Floaty] Sentence check:', {
        sentence: sentence.substring(0, 50) + '...',
        hasActionWord,
        isQuestion,
        startsWithCapital,
        length: sentence.length
      })
      
      if ((hasActionWord || isQuestion || startsWithCapital) && sentence.trim().length > 8 && sentence.trim().length < 100) {
        actionItems.push(sentence.trim())
      }
    })

    // Remove duplicates and limit to 3 items
    actionItems = [...new Set(actionItems)].slice(0, 3)

    console.log('[Floaty] Filtered action items:', actionItems)

    // If no action items found, create tasks from the first few sentences
    if (actionItems.length === 0 && text.trim()) {
      const firstSentence = text.split(/[.!?]+/)[0].trim()
      if (firstSentence.length > 5) {
        const fallbackTask = `Review: ${firstSentence.substring(0, 50)}${firstSentence.length > 50 ? '...' : ''}`
        actionItems.push(fallbackTask)
        console.log('[Floaty] Created fallback task:', fallbackTask)
      }
      
      // Add a second task if there's more content
      const secondSentence = text.split(/[.!?]+/)[1]?.trim()
      if (secondSentence && secondSentence.length > 5 && actionItems.length < 2) {
        const secondTask = `Follow up: ${secondSentence.substring(0, 50)}${secondSentence.length > 50 ? '...' : ''}`
        actionItems.push(secondTask)
        console.log('[Floaty] Created second fallback task:', secondTask)
      }
    }

    // Ultimate fallback: if still no action items, create a simple review task
    if (actionItems.length === 0) {
      const simpleTask = text.length > 50 ? text.substring(0, 50) + '...' : text
      actionItems.push(`Review: ${simpleTask}`)
      console.log('[Floaty] Created ultimate fallback task:', actionItems[0])
    }

    console.log('[Floaty] Final action items returned:', actionItems)
    return actionItems
  }
}

class FloatyExtension {
  constructor() {
    this.currentTab = "notes"
    this.notes = []
    this.savedItems = []
    this.highlights = []
    this.tasks = []
    this.isListening = false
    this.isSpeaking = false
    this.isDarkMode = false
    this.recognition = null
    this.speechSynthesis = window.speechSynthesis
    this.currentUtterance = null
    this.extractedTasks = []
    this.currentModalNote = null
    this.detectedTasks = []
    this.gemini = new GeminiAIService()

    this.init()
  }

  init() {
    this.loadData()
    this.loadNoteTextareaContent() // Add this line to restore note textarea content
    this.initializeDarkMode()
    this.setupEventListeners()
    this.updateDateTime()
    this.updateTaskStats()
    this.setupSpeechRecognition()
    this.setupKeyboardShortcuts()

    // Update datetime every minute
    setInterval(() => this.updateDateTime(), 60000)
    
    // Listen for messages from content script
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      if (message.action === 'tasksAdded') {
        // Refresh tasks list when new tasks are added
        this.loadData()
        this.showNotification(`Added ${message.count} tasks from webpage`)
      }
      if (message.action === 'toggleDictationHotkey') {
        this.toggleDictation()
      }
      if (message.action === 'quickNoteHotkey') {
        this.openQuickNote()
      }
      if (message.action === 'readAloudHotkey') {
        this.readSelectedText()
      }
      if (message.action === 'searchNotesHotkey') {
        this.openSearch()
      }
    })
  }

  initializeDarkMode() {
    // Load dark mode preference from storage
    chrome.storage.sync.get(['darkMode'], (result) => {
      this.isDarkMode = result.darkMode || false
      this.applyDarkMode()
    })
  }

  toggleDarkMode() {
    this.isDarkMode = !this.isDarkMode
    this.applyDarkMode()
    
    // Save preference to storage
    chrome.storage.sync.set({ darkMode: this.isDarkMode })
  }

  applyDarkMode() {
    const body = document.body
    const darkModeIcon = document.getElementById('darkModeIcon')
    
    if (this.isDarkMode) {
      body.setAttribute('data-theme', 'dark')
      // Change icon to moon for dark mode
      if (darkModeIcon) {
        darkModeIcon.innerHTML = `
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
        `
      }
    } else {
      body.removeAttribute('data-theme')
      // Change icon to sun for light mode
      if (darkModeIcon) {
        darkModeIcon.innerHTML = `
          <circle cx="12" cy="12" r="5"></circle>
          <line x1="12" y1="1" x2="12" y2="3"></line>
          <line x1="12" y1="21" x2="12" y2="23"></line>
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
          <line x1="1" y1="12" x2="3" y2="12"></line>
          <line x1="21" y1="12" x2="23" y2="12"></line>
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
        `
      }
    }
  }

  setupEventListeners() {
    // Tab navigation
    document.querySelectorAll(".tab-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        this.switchTab(e.target.closest(".tab-btn").dataset.tab)
      })
    })

    // Header actions
    const searchBtn = document.getElementById("searchBtn")
    const darkModeToggle = document.getElementById("darkModeToggle")

    if (searchBtn) {
      searchBtn.addEventListener("click", () => {
        this.toggleGlobalSearch()
      })
    }

    if (darkModeToggle) {
      darkModeToggle.addEventListener("click", () => {
        this.toggleDarkMode()
      })
    }

    // Global search
    const closeSearch = document.getElementById("closeSearch")
    const globalSearchInput = document.getElementById("globalSearchInput")

    if (closeSearch) {
      closeSearch.addEventListener("click", () => {
        this.hideGlobalSearch()
      })
    }

    if (globalSearchInput) {
      globalSearchInput.addEventListener("input", (e) => {
        this.performGlobalSearch(e.target.value)
      })
    }

    // Notes tab
    const addNoteBtn = document.getElementById("addNoteBtn")
    const clearBtn = document.getElementById("clearBtn")
    const noteTextarea = document.getElementById("noteText")

    // Voice control buttons in notes tab
    const voiceDictationBtn = document.getElementById("voiceDictationBtn")
    const voiceTTSBtn = document.getElementById("voiceTTSBtn")

    if (addNoteBtn) {
      addNoteBtn.addEventListener("click", () => {
        this.addNote()
      })
    }

    if (clearBtn) {
      clearBtn.addEventListener("click", () => {
        this.clearNoteInput()
      })
    }

    // Add event listener to save note textarea content when user types
    if (noteTextarea) {
      noteTextarea.addEventListener("input", () => {
        this.saveNoteTextareaContent()
      })
    }

    if (voiceDictationBtn) {
      voiceDictationBtn.addEventListener("click", () => {
        this.toggleDictation()
        this.updateVoiceButtonStates()
      })
    }

    if (voiceTTSBtn) {
      voiceTTSBtn.addEventListener("click", () => {
        this.toggleTTS()
        this.updateVoiceButtonStates()
      })
    }

    // Saved tab
    const clearSavedBtn = document.getElementById("clearSavedBtn")
    const searchField = document.getElementById("searchField")
    const dictationBtn = document.getElementById("dictationBtn")

    if (clearSavedBtn) {
      clearSavedBtn.addEventListener("click", () => {
        this.clearAllSaved()
      })
    }

    if (searchField) {
      searchField.addEventListener("input", (e) => {
        this.searchSavedItems(e.target.value)
      })
    }

    if (dictationBtn) {
      dictationBtn.addEventListener("click", () => {
        this.openDictationModal()
      })
    }

    // Highlights tab
    const clearHighlightsBtn = document.getElementById("clearHighlightsBtn")
    const highlightsSearchField = document.getElementById("highlightsSearchField")

    if (clearHighlightsBtn) {
      clearHighlightsBtn.addEventListener("click", () => {
        this.clearAllHighlights()
      })
    }

    if (highlightsSearchField) {
      highlightsSearchField.addEventListener("input", (e) => {
        this.searchHighlights(e.target.value)
      })
    }

    // Tasks tab
    const addTaskBtn = document.getElementById("addTaskBtn")
    const taskText = document.getElementById("taskText")
    const clearAllTasksBtn = document.getElementById("clearAllTasksBtn")

    if (addTaskBtn) {
      addTaskBtn.addEventListener("click", () => {
        this.addTask()
      })
    }

    if (taskText) {
      taskText.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
          this.addTask()
        }
      })
    }

    if (clearAllTasksBtn) {
      clearAllTasksBtn.addEventListener("click", () => {
        this.clearAllTasks()
      })
    }


    // Modal
    const closeModal = document.getElementById("closeModal")
    const readAloudBtn = document.getElementById("readAloudBtn")
    const copyNoteContent = document.getElementById("copyNoteContent")
    const generateSummary = document.getElementById("generateSummary")

    if (closeModal) {
      closeModal.addEventListener("click", () => {
        this.hideModal()
      })
    }

    if (readAloudBtn) {
      readAloudBtn.addEventListener("click", () => {
        this.readModalContent()
      })
    }

    if (copyNoteContent) {
      copyNoteContent.addEventListener("click", () => {
        this.copyModalContent()
      })
    }

    if (generateSummary) {
      generateSummary.addEventListener("click", () => {
        this.generateSummaryForModal()
      })
    }

    // TTS controls
    const stopTTS = document.getElementById("stopTTS")
    if (stopTTS) {
      stopTTS.addEventListener("click", () => {
        this.stopTTS()
      })
    }

    // Tasks dialog
    const closeTasksDialog = document.getElementById("closeTasksDialog")
    const closeTasksDialogBtn = document.getElementById("closeTasksDialogBtn")
    const addAllTasksBtn = document.getElementById("addAllTasksBtn")

    if (closeTasksDialog) {
      closeTasksDialog.addEventListener("click", () => {
        this.hideTasksDialog()
      })
    }

    if (closeTasksDialogBtn) {
      closeTasksDialogBtn.addEventListener("click", () => {
        this.hideTasksDialog()
      })
    }

    if (addAllTasksBtn) {
      addAllTasksBtn.addEventListener("click", () => {
        this.addAllExtractedTasks()
      })
    }

    // Click outside modal to close
    document.addEventListener("click", (e) => {
      if (e.target.classList.contains("modal")) {
        this.hideModal()
        this.hideTasksDialog()
      }
    })

    // Close extension
    const closeButtons = document.querySelectorAll('.close-header-btn, .close-btn')
    closeButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const modal = e.target.closest('.modal')
        if (modal) {
          // If the close button is in a modal, close just the modal
          this.hideModal(modal.id)
        } else {
          // If it's the header close button, close the extension
          window.close()
        }
      })
    })

    // Add keyboard shortcut to close (Escape key)
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        // Find any visible modal
        const visibleModal = document.querySelector('.modal:not(.hidden)')
        if (visibleModal) {
          // If a modal is open, close it
          this.hideModal(visibleModal.id)
        } else {
          // If no modal is open, close the extension
          window.close()
        }
      }
    })

    // Task Detection Dialog
    const closeTaskDetection = document.getElementById("closeTaskDetection")
    const cancelTaskDetection = document.getElementById("cancelTaskDetection")
    const addSelectedTasks = document.getElementById("addSelectedTasks")

    if (closeTaskDetection) {
      closeTaskDetection.addEventListener("click", () => {
        // Discard the pending note if user closes
        if (this.pendingNote) {
          this.pendingNote = null
          this.showNotification('❌ Note creation cancelled')
        }
        this.hideTaskDetectionDialog()
        
        // Clear stored note textarea content since note was cancelled
        chrome.storage.local.remove(['noteTextareaContent'], () => {
          console.log('[Floaty] Note textarea content cleared from storage after cancelling task dialog')
        })
      })
    }

    if (cancelTaskDetection) {
      cancelTaskDetection.addEventListener("click", () => {
        // Discard the pending note if user cancels
        if (this.pendingNote) {
          this.pendingNote = null
          this.showNotification('❌ Note creation cancelled')
        }
        this.hideTaskDetectionDialog()
        
        // Clear stored note textarea content since note was cancelled
        chrome.storage.local.remove(['noteTextareaContent'], () => {
          console.log('[Floaty] Note textarea content cleared from storage after cancelling task dialog')
        })
      })
    }

    if (addSelectedTasks) {
      addSelectedTasks.addEventListener("click", () => {
        this.addSelectedTasksToList()
      })
    }

    // Info button and hotkeys modal
    const infoButton = document.getElementById('infoButton')
    const closeHotkeysModal = document.getElementById('closeHotkeysModal')
    
    if (infoButton) {
      infoButton.addEventListener('click', () => {
        this.showHotkeysModal()
      })
    }

    if (closeHotkeysModal) {
      closeHotkeysModal.addEventListener('click', () => {
        this.hideModal('hotkeysModal')
      })
    }
  }

  setupKeyboardShortcuts() {
    document.addEventListener("keydown", (e) => {
      // Handle Cmd+Enter for saving notes (even in textarea)
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        e.preventDefault()
        this.addNote()
        return
      }

      // Don't trigger shortcuts if user is typing in an input or textarea
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
        // Allow Escape key in inputs
        if (e.key === 'Escape') {
          e.target.blur()
          const visibleModal = document.querySelector('.modal:not(.hidden)')
          if (visibleModal) {
            this.hideModal(visibleModal.id)
          }
        }
        return
      }

      // Global shortcuts (work anywhere)
      if (e.key === 'Escape') {
        const visibleModal = document.querySelector('.modal:not(.hidden)')
        if (visibleModal) {
          this.hideModal(visibleModal.id)
        } else {
          window.close()
        }
        return
      }

      // Shortcuts that require Ctrl/Cmd+Shift
      if ((e.ctrlKey || e.metaKey) && e.shiftKey) {
        switch (e.key.toLowerCase()) {
          case 'f':
            e.preventDefault()
            this.toggleGlobalSearch()
            break
          
          case 'd':
            e.preventDefault()
            this.toggleDictation()
            break
          
          case 'n':
            e.preventDefault()
            const noteText = document.getElementById('noteText')
            if (noteText) {
              noteText.focus()
            }
            break
          
          case 't':
            e.preventDefault()
            const taskText = document.getElementById('taskText')
            if (taskText) {
              this.switchTab('tasks')
              taskText.focus()
            }
            break
          
          case 's':
            e.preventDefault()
            this.switchTab('saved')
            const searchField = document.getElementById('searchField')
            if (searchField) {
              searchField.focus()
            }
            break
          
          case '1':
            e.preventDefault()
            this.switchTab('notes')
            break
          
          case '2':
            e.preventDefault()
            this.switchTab('saved')
            break
          
          case '3':
            e.preventDefault()
            this.switchTab('tasks')
            break
          case 'M':
            e.preventDefault()
            this.toggleDarkMode()
            break
        }
      }

      // Single key shortcuts (when not in input/textarea)
      switch (e.key.toLowerCase()) {
        case 'n':
          if (!e.ctrlKey && !e.shiftKey) {
            e.preventDefault()
            this.switchTab('notes')
            const noteText = document.getElementById('noteText')
            if (noteText) {
              noteText.focus()
            }
          }
          break
        
        case 't':
          if (!e.ctrlKey && !e.shiftKey) {
            e.preventDefault()
            this.switchTab('tasks')
            const taskText = document.getElementById('taskText')
            if (taskText) {
              taskText.focus()
            }
          }
          break
        
        case 's':
          if (!e.ctrlKey && !e.shiftKey) {
            e.preventDefault()
            this.switchTab('saved')
          }
          break
        
        case '/':
          e.preventDefault()
          this.toggleGlobalSearch()
          break
      }
    })
  }

  setupSpeechRecognition() {
  if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    this.recognition = new SpeechRecognition()
    this.recognition.continuous = true
    this.recognition.interimResults = true
    this.recognition.lang = "en-US"

    this._dictationInterim = "" // Track interim text
    this._dictationActive = false // Prevent multiple sessions
    this._lastInterimUpdate = 0 // Throttle UI updates

    this.recognition.onstart = () => {
      this.isListening = true
      this._dictationActive = true
      this.showDictationStatus()
    }

    this.recognition.onresult = (event) => {
      let finalTranscript = ""
      let interimTranscript = ""

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript
        if (event.results[i].isFinal) {
          finalTranscript += transcript
        } else {
          interimTranscript += transcript
        }
      }

      const status = document.getElementById("dictationStatus")
      if (status) {
        status.querySelector("span").textContent = `Listening... ${interimTranscript}`
      }
      this._dictationInterim = interimTranscript

      // Show interim text at caret position using mirror div
      const interimOverlay = document.getElementById("interimOverlay")
      const interimMirror = document.getElementById("interimMirror")
      const noteText = document.getElementById("noteText")
      if (interimOverlay && interimMirror && noteText) {
        if (interimTranscript && this.isListening) {
          // Mirror textarea style
          const style = window.getComputedStyle(noteText)
          interimMirror.style.font = style.font
          interimMirror.style.fontSize = style.fontSize
          interimMirror.style.fontFamily = style.fontFamily
          interimMirror.style.lineHeight = style.lineHeight
          interimMirror.style.padding = style.padding
          interimMirror.style.border = style.border
          interimMirror.style.boxSizing = style.boxSizing
          interimMirror.style.width = noteText.offsetWidth + 'px'
          interimMirror.style.height = noteText.offsetHeight + 'px'
          interimMirror.style.letterSpacing = style.letterSpacing
          interimMirror.style.whiteSpace = 'pre-wrap'
          interimMirror.style.wordWrap = 'break-word'
          // Get text up to caret
          const value = noteText.value
          const caret = noteText.selectionStart
          const beforeCaret = value.substring(0, caret)
          // Replace spaces and newlines for HTML rendering
          const beforeCaretHtml = beforeCaret.replace(/\n/g, '<br>').replace(/ /g, '&nbsp;')
          // Fill mirror with text up to caret and a marker span
          interimMirror.innerHTML = beforeCaretHtml + '<span id="caretMarker">\u200b</span>'
          // Get caret marker position
          const marker = interimMirror.querySelector('#caretMarker')
          const mirrorRect = interimMirror.getBoundingClientRect()
          let caretLeft = 0, caretTop = 0
          if (marker) {
            const markerRect = marker.getBoundingClientRect()
            caretLeft = markerRect.left - mirrorRect.left
            caretTop = markerRect.top - mirrorRect.top
          }
          // Show only the interim text at caret position
          interimOverlay.style.display = "block"
          interimOverlay.innerHTML = ''
          const span = document.createElement('span')
          span.style.color = '#bbb'
          span.style.position = 'absolute'
          span.style.left = caretLeft + 'px'
          span.style.top = caretTop + 'px'
          span.style.pointerEvents = 'none'
          span.style.background = 'transparent'
          span.style.whiteSpace = 'pre-wrap'
          // Set max-width so that wrapping starts at left edge of textarea
          const taWidth = noteText.offsetWidth
          span.style.maxWidth = (taWidth - caretLeft - 16) + 'px' // 16px for padding
          span.textContent = interimTranscript
          interimOverlay.appendChild(span)
          interimOverlay.scrollTop = noteText.scrollTop
          // Remove placeholder when overlay is shown
          if (!this._originalPlaceholder) {
            this._originalPlaceholder = noteText.placeholder
          }
          noteText.placeholder = ''
        } else {
          interimOverlay.style.display = "none"
          interimOverlay.innerHTML = ""
          // Restore placeholder when overlay is hidden
          if (this._originalPlaceholder && noteText) {
            noteText.placeholder = this._originalPlaceholder
          }
        }
      }

      if (finalTranscript) {
        setTimeout(() => {
          const noteText = document.getElementById("noteText")
          const interimOverlay = document.getElementById("interimOverlay")
          if (noteText) {
            // Insert at caret position, add space if needed
            const start = noteText.selectionStart
            const end = noteText.selectionEnd
            const value = noteText.value
            const before = value.substring(0, start)
            const after = value.substring(end)
            let insertText = finalTranscript
            // Add space if not at start, not after a space, and not after a newline
            if (
              before.length > 0 &&
              !/\s$/.test(before) &&
              !/\n$/.test(before)
            ) {
              insertText = ' ' + insertText
            }
            noteText.value = before + insertText + after
            // Move caret to after inserted text
            const caret = before.length + insertText.length
            noteText.selectionStart = noteText.selectionEnd = caret
            noteText.focus()
          }
          // Clear interim overlay
          if (interimOverlay) {
            interimOverlay.style.display = "none"
            interimOverlay.innerHTML = ""
          }
          // Clear interim display
          const status = document.getElementById("dictationStatus")
          if (status) {
            status.querySelector("span").textContent = `Listening...`
          }
          this._dictationInterim = ""
        }, 1)
      }
    }

    this.recognition.onend = () => {
      this.isListening = false
      this._dictationActive = false
      this.hideDictationStatus()
      // Hide interim overlay
      const interimOverlay = document.getElementById("interimOverlay")
      if (interimOverlay) {
        interimOverlay.style.display = "none"
        interimOverlay.textContent = ""
      }
    }

    this.recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error)
      this.isListening = false
      this._dictationActive = false
      this.hideDictationStatus()
      // Hide interim overlay
      const interimOverlay = document.getElementById("interimOverlay")
      if (interimOverlay) {
        interimOverlay.style.display = "none"
        interimOverlay.textContent = ""
      }

      const status = document.getElementById("dictationStatus")
      if (status) {
        status.style.display = "flex"
        status.querySelector("span").textContent = `Error: ${event.error}`
      }

      if (event.error === 'not-allowed') {
        this.showNotification("Microphone access denied. Please allow microphone permission in your browser settings.")
      } else {
        this.showNotification("Speech recognition error: " + event.error)
      }
    }
  } else {
    // Speech recognition not available
    const voiceDictationBtn = document.getElementById("voiceDictationBtn")
    if (voiceDictationBtn) {
      voiceDictationBtn.disabled = true
      voiceDictationBtn.title = "Speech recognition is not supported in this browser."
    }
    const status = document.getElementById("dictationStatus")
    if (status) {
      status.style.display = "flex"
      status.querySelector("span").textContent = "Speech recognition is not supported in this browser."
    }
    this.showNotification("Speech recognition is not supported in this browser.")
  }
}


  // Tab Management
  switchTab(tabName) {
    // Update tab buttons
    document.querySelectorAll(".tab-btn").forEach((btn) => {
      if (btn.dataset.tab === tabName) {
        btn.classList.add("active")
      } else {
        btn.classList.remove("active")
      }
    })

    // Update tab content
    document.querySelectorAll(".tab-content").forEach((content) => {
      if (content.id === `${tabName}Tab`) {
        content.classList.add("active")
        // Focus on the main input of the tab if available
        const mainInput = content.querySelector('textarea, input[type="text"]')
        if (mainInput) {
          mainInput.focus()
        }
      } else {
        content.classList.remove("active")
      }
    })

    this.currentTab = tabName
    this.loadTabContent(tabName)
  }

  loadTabContent(tabName) {
    switch (tabName) {
      case "notes":
        this.renderNotes()
        break
      case "saved":
        this.renderSavedItems()
        break
      case "highlights":
        this.renderHighlights()
        break
      case "tasks":
        this.renderTasks()
        break
    }
  }

  // Global Search
  toggleGlobalSearch() {
    const globalSearch = document.getElementById("globalSearch")
    const searchInput = document.getElementById("globalSearchInput")
    
    if (globalSearch) {
      globalSearch.classList.toggle("hidden")
      if (!globalSearch.classList.contains("hidden") && searchInput) {
        searchInput.focus()
        searchInput.select()
      }
    }
  }

  hideGlobalSearch() {
    const searchDiv = document.getElementById("globalSearch")
    const searchInput = document.getElementById("globalSearchInput")
    const searchResults = document.getElementById("globalSearchResults")

    if (searchDiv) searchDiv.classList.add('hidden')
    if (searchInput) searchInput.value = ""
    if (searchResults) searchResults.innerHTML = ""
  }

  performGlobalSearch(query) {
    const searchResults = document.getElementById("globalSearchResults")
    if (!searchResults) return

    if (!query.trim()) {
      searchResults.innerHTML = ""
      return
    }

    const results = []
    const searchTerm = query.toLowerCase()

    // Search notes
    this.notes.forEach((note, index) => {
      if (note.content.toLowerCase().includes(searchTerm) || note.context.toLowerCase().includes(searchTerm)) {
        results.push({
          type: "note",
          index,
          title: note.title || "Untitled Note",
          content: note.content,
          context: note.context,
        })
      }
    })

    // Search saved items
    this.savedItems.forEach((item, index) => {
      if (item.content.toLowerCase().includes(searchTerm) || item.context.toLowerCase().includes(searchTerm)) {
        results.push({
          type: "saved",
          index,
          title: item.title || "Untitled Item",
          content: item.content,
          context: item.context,
        })
      }
    })

    // Search highlights
    this.highlights.forEach((highlight, index) => {
      if (highlight.content.toLowerCase().includes(searchTerm) || 
          highlight.title.toLowerCase().includes(searchTerm) ||
          (highlight.context && highlight.context.toLowerCase().includes(searchTerm))) {
        results.push({
          type: "highlight",
          index,
          title: highlight.title || "Highlighted Text",
          content: highlight.content,
          context: highlight.context,
        })
      }
    })

    // Search tasks
    this.tasks.forEach((task, index) => {
      if (task.text.toLowerCase().includes(searchTerm)) {
        results.push({
          type: "task",
          index,
          title: task.text,
          content: task.text,
        })
      }
    })

    this.renderSearchResults(results)
  }

  renderSearchResults(results) {
    const container = document.getElementById("globalSearchResults")
    if (!container) return

    if (results.length === 0) {
      container.innerHTML = `
        <div class="search-result-item">
          <div class="search-result-title">No results found</div>
        </div>
      `
      return
    }

    container.innerHTML = results
      .map(
        (result, index) => `
          <div class="search-result-item" data-type="${result.type}" data-index="${result.index}">
            ${this.getTypeIcon(result.type)}
            <div class="search-result-title">${result.title}</div>
            ${result.context ? `<div class="search-result-context">${result.context}</div>` : ''}
          </div>
        `
      )
      .join("")

    // Add event listeners using event delegation
    container.addEventListener('click', (e) => {
      const searchResultItem = e.target.closest('.search-result-item')
      if (!searchResultItem) return
      
      const type = searchResultItem.dataset.type
      const index = parseInt(searchResultItem.dataset.index)
      
      this.openSearchResult(type, index)
    })
  }

  getTypeIcon(type) {
    const icons = {
      note: "Note",
      saved: "Saved",
      highlight: "Highlight",
      task: "Task",
    }
    return icons[type] || "Item"
  }

  openSearchResult(type, index) {
    this.hideGlobalSearch()

    switch (type) {
      case "note":
        this.switchTab("notes")
        setTimeout(() => this.showNoteModal(this.notes[index]), 100)
        break
      case "saved":
        this.switchTab("saved")
        setTimeout(() => this.showNoteModal(this.savedItems[index]), 100)
        break
      case "highlight":
        this.switchTab("highlights")
        setTimeout(() => this.showHighlightModal(this.highlights[index]), 100)
        break
      case "task":
        this.switchTab("tasks")
        break
    }
  }

  // Speech Recognition
  toggleDictation() {
    if (!this.recognition) {
      this.showNotification("Speech recognition is not supported in this browser.")
      return
    }
    if (this.isListening || this._dictationActive) {
      this.recognition.stop()
      this.isListening = false
      this._dictationActive = false
      this.hideDictationStatus()
    } else {
      try {
        this.recognition.start()
        this.isListening = true
        this._dictationActive = true
        this.showDictationStatus()
        // Focus the note textarea when starting dictation
        const noteText = document.getElementById('noteText')
        if (noteText) {
          noteText.focus()
        }
      } catch (e) {
        this.showNotification("Could not start speech recognition. Try again.")
        this.isListening = false
        this._dictationActive = false
        this.hideDictationStatus()
      }
    }
    this.updateVoiceButtonStates()
  }

  showDictationStatus() {
    const status = document.getElementById("dictationStatus")
    if (status) {
      status.style.display = "flex"
    }
    this.updateVoiceButtonStates()
  }

  hideDictationStatus() {
    const status = document.getElementById("dictationStatus")
    if (status) {
      status.style.display = "none"
    }
    this.updateVoiceButtonStates()
  }

  // Text-to-Speech
  toggleTTS() {
    if (this.isSpeaking) {
      this.stopTTS()
    } else {
      const noteText = document.getElementById("noteText")
      if (noteText && noteText.value.trim()) {
        this.speakText(noteText.value)
      } else {
        this.showNotification("No text to read")
      }
    }
  }

  speakText(text) {
    if (this.speechSynthesis.speaking) {
      this.speechSynthesis.cancel()
    }

    this.currentUtterance = new SpeechSynthesisUtterance(text)
    this.currentUtterance.rate = 0.9
    this.currentUtterance.pitch = 1
    this.currentUtterance.volume = 1

    this.currentUtterance.onstart = () => {
      this.isSpeaking = true
      this.showTTSStatus()
    }

    this.currentUtterance.onend = () => {
      this.isSpeaking = false
      this.hideTTSStatus()
    }

    this.currentUtterance.onerror = () => {
      this.isSpeaking = false
      this.hideTTSStatus()
    }

    this.speechSynthesis.speak(this.currentUtterance)
  }

  stopTTS() {
    if (this.speechSynthesis.speaking) {
      this.speechSynthesis.cancel()
    }
    this.isSpeaking = false
    this.hideTTSStatus()
  }

  showTTSStatus() {
    const status = document.getElementById("ttsStatus")
    if (status) {
      status.style.display = "block"
    }
    this.updateVoiceButtonStates()
  }

  hideTTSStatus() {
    const status = document.getElementById("ttsStatus")
    if (status) {
      status.style.display = "none"
    }
    this.updateVoiceButtonStates()
  }

  // Notes Management
  async addNote() {
    const noteTextArea = document.getElementById("noteText")
    const contextField = document.getElementById("contextField")
    const extractTasks = document.getElementById("extractTasksCheckbox")

    if (!noteTextArea || !noteTextArea.value.trim()) return

    const noteText = noteTextArea.value
    const context = contextField?.value?.trim() || ""

    console.log('[Floaty] Adding note with text:', noteText.substring(0, 100) + '...')

    // Get current tab URL and title
    let currentUrl = ''
    let currentTitle = ''
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
      if (tab) {
        currentUrl = tab.url || ''
        currentTitle = tab.title || ''
      }
    } catch (error) {
      console.log('Could not get current tab info:', error)
    }

    // Generate title using Gemini
    const title = await this.gemini.generateTitle(noteText, context)

    // Extract action items only if the checkbox is checked
    let actionItems = [];
    
    if (extractTasks && extractTasks.checked) {
      try {
        console.log('[Floaty] Extracting action items...')
        const extractedItems = this.gemini.fallbackActionItems(noteText);
        
        if (extractedItems && extractedItems.length > 0) {
          actionItems = extractedItems.map(item => ({ text: item, completed: false }));
          console.log('[Floaty] Extracted action items:', actionItems);
        }
      } catch (error) {
        console.error('[Floaty] Error extracting action items:', error)
      }
    }

    // Create a single note object
    const note = {
      id: Date.now() + Math.floor(Math.random() * 1000000),
      title: title,
      content: noteText,
      text: noteText,
      context: context,
      actionItems: actionItems,
      tasks: [],
      savedAt: new Date().toISOString(),
      url: currentUrl,
      pageTitle: currentTitle
    };
    
    // If AI Extract tasks is checked and tasks were found, show dialog first
    if (extractTasks && extractTasks.checked && actionItems.length > 0) {
      // Store the note temporarily
      this.pendingNote = note
      
      // Convert to task objects for the dialog
      const tasks = actionItems.map(item => ({ text: item.text || item, context, priority: 'medium' }))
      this.showTaskDetectionDialog(tasks)
      
      // Clear inputs immediately
      noteTextArea.value = ""
      if (contextField) contextField.value = ""
      
      // Clear stored note textarea content
      chrome.storage.local.remove(['noteTextareaContent'], () => {
        console.log('[Floaty] Note textarea content cleared from storage after showing task dialog')
      })
      
      return // Don't save the note yet
    }
    
    // If no AI extraction or no tasks found, save immediately
    console.log('[Floaty] Saving note immediately')
    this.saveNoteToStorage(note)
    
    // Clear inputs
    noteTextArea.value = ""
    if (contextField) contextField.value = ""
    
    // Clear stored note textarea content
    chrome.storage.local.remove(['noteTextareaContent'], () => {
      console.log('[Floaty] Note textarea content cleared from storage after saving note')
    })
  }

  saveNoteToStorage(note) {
    console.log('[Floaty] Saving note with action items:', note.actionItems)
    
    // Add to saved items
    this.savedItems.unshift(note);
    this.saveData()
    this.renderSavedItems()
    
    // Show notification
    if (note.actionItems && note.actionItems.length > 0) {
      this.showNotification(`✅ Note saved with ${note.actionItems.length} action item${note.actionItems.length > 1 ? 's' : ''}`)
    } else {
      this.showNotification('✅ Note saved successfully')
    }
  }

  detectTasks(noteText) {
    // Simple task detection - looks for lines starting with action words or bullet points
    const lines = noteText.split('\n')
    const tasks = []
    
    const actionWords = ['create', 'update', 'add', 'remove', 'fix', 'implement', 'setup', 'configure', 'write', 'review', 'prepare', 'schedule', 'organize']
    
    lines.forEach(line => {
      const trimmedLine = line.trim().toLowerCase()
      // Check for bullet points, numbers, or action words at the start
      if (
        trimmedLine.startsWith('- ') ||
        trimmedLine.startsWith('* ') ||
        trimmedLine.startsWith('• ') ||
        /^\d+\.\s/.test(trimmedLine) || // Matches numbered lists (1. , 2. etc)
        actionWords.some(word => trimmedLine.startsWith(word))
      ) {
        // Clean up the task text
        let taskText = line.trim()
        // Remove leading bullet points or numbers
        taskText = taskText.replace(/^[-*•]|\d+\.\s/, '').trim()
        
        tasks.push({
          text: taskText,
          context: this.getContext(),
          priority: 'medium'
        })
      }
    })

    return tasks
  }

  getContext() {
    const contextField = document.getElementById("contextField")
    return contextField?.value?.trim() || "No context"
  }

  updateVoiceButtonStates() {
    const voiceDictationBtn = document.getElementById("voiceDictationBtn")
    const voiceTTSBtn = document.getElementById("voiceTTSBtn")
    const micActiveDot = document.getElementById("micActiveDot")

    if (voiceDictationBtn) {
      if (this.isListening) {
        voiceDictationBtn.classList.add("active")
        if (micActiveDot) micActiveDot.style.display = "block"
      } else {
        voiceDictationBtn.classList.remove("active")
        if (micActiveDot) micActiveDot.style.display = "none"
      }
    }

    if (voiceTTSBtn) {
      if (this.isSpeaking) {
        voiceTTSBtn.classList.add("active")
      } else {
        voiceTTSBtn.classList.remove("active")
      }
    }
  }

  generateTitle(content) {
    // Simple title generation - take first 50 characters
    const title = content.substring(0, 50).trim()
    return title.length < content.length ? title + "..." : title
  }

  extractTasks(content) {
    // Simple task extraction - look for action words and bullet points
    const lines = content.split("\n")
    const tasks = []
    const actionWords = [
      "todo",
      "task",
      "action",
      "follow up",
      "call",
      "email",
      "schedule",
      "book",
      "buy",
      "complete",
      "finish",
    ]

    lines.forEach((line) => {
      const lowerLine = line.toLowerCase().trim()

      // Check for bullet points or action words
      if (
        line.trim().startsWith("•") ||
        line.trim().startsWith("-") ||
        line.trim().startsWith("*") ||
        actionWords.some((word) => lowerLine.includes(word))
      ) {
        const taskText = line.replace(/^[•\-*]\s*/, "").trim()
        if (taskText.length > 3) {
          tasks.push({
            text: taskText,
            completed: false,
            id: Date.now() + Math.random(),
          })
        }
      }
    })

    return tasks
  }

  extractHighlights(content) {
    // Simple highlight extraction - look for important phrases
    const highlights = []
    const sentences = content.split(/[.!?]+/)

    sentences.forEach((sentence) => {
      const trimmed = sentence.trim()
      if (
        trimmed.length > 20 &&
        (trimmed.toLowerCase().includes("important") ||
          trimmed.toLowerCase().includes("key") ||
          trimmed.toLowerCase().includes("critical") ||
          trimmed.toLowerCase().includes("note"))
      ) {
        highlights.push(trimmed)
      }
    })

    return highlights
  }

  clearNoteInput() {
    const noteText = document.getElementById("noteText")
    const contextField = document.getElementById("contextField")

    if (noteText) noteText.value = ""
    if (contextField) contextField.value = ""
    
    // Clear stored note textarea content
    chrome.storage.local.remove(['noteTextareaContent'], () => {
      console.log('[Floaty] Note textarea content cleared from storage')
    })
  }

  renderNotes() {
    const container = document.getElementById("notesList")
    if (!container) return

    if (this.notes.length === 0) {
      container.innerHTML =
        '<div style="padding: 20px; text-align: center; color: var(--text-muted);">No notes yet. Start writing!</div>'
      return
    }

    container.innerHTML = this.notes
      .map(
        (note) => `
            <div class="note-item" data-id="${note.id}">
                <div class="note-content">
                    <div style="font-weight: 600; margin-bottom: 6px; color: var(--text-primary);">
                        ${note.title}
                    </div>
                    <div style="font-size: 12px; color: var(--text-muted); margin-bottom: 8px;">
                        ${note.context ? note.context + ' • ' : ''}${this.formatDate(note.timestamp)}
                    </div>
                    <div style="font-size: 13px; color: var(--text-secondary); line-height: 1.4;">
                        ${this.truncateText(note.content, 90)}
                    </div>
                </div>
                <div style="margin-top: 12px; display: flex; gap: 8px;">
                    <button class="secondary-btn save-note" style="padding: 6px 12px; font-size: 12px;">
                        Save
                    </button>
                    <button class="secondary-btn delete-note" style="padding: 6px 12px; font-size: 12px;">
                        Delete
                    </button>
                </div>
            </div>
        `,
      )
      .join("")

    // Add event listeners using event delegation
    container.addEventListener('click', (e) => {
      const noteItem = e.target.closest('.note-item')
      if (!noteItem) return
      
      const noteId = parseInt(noteItem.dataset.id)
      
      if (e.target.closest('.save-note')) {
        this.saveNote(noteId)
      } else if (e.target.closest('.delete-note')) {
        this.deleteNote(noteId)
      } else if (e.target.closest('.note-content')) {
        const note = this.notes.find(n => n.id === noteId)
        if (note) this.showNoteModal(note)
      }
    })
  }

  saveNote(noteId) {
    const note = this.notes.find((n) => n.id === noteId)
    if (note) {
      this.savedItems.unshift({ ...note, savedAt: new Date().toISOString() })
      this.saveData()
      this.showNotification("Note saved")
    }
  }

  deleteNote(noteId) {
    this.notes = this.notes.filter((n) => n.id !== noteId)
    this.saveData()
    this.renderNotes()
    this.showNotification("Note deleted")
  }

  // Saved Items Management
  renderHighlights() {
    const container = document.getElementById("highlightsList")
    if (!container) return

    if (this.highlights.length === 0) {
      container.innerHTML =
        '<div style="padding: 20px; text-align: center; color: var(--text-muted);">No highlights yet. Select text on any webpage and click the highlight button!</div>'
      return
    }

    container.innerHTML = this.highlights
      .slice()
      .reverse()
      .map(
        (highlight) => `
            <div class="highlight-item" data-id="${highlight.id}" style="margin-bottom: 28px;">
                <div class="highlight-content">
                    <div style="font-weight: 600; margin-bottom: 6px; color: var(--text-primary);">
                        ${highlight.title || 'Highlighted Text'}
                    </div>
                    <div style="font-size: 12px; color: var(--text-muted); margin-bottom: 8px;">
                        ${highlight.context ? highlight.context + ' • ' : ''}${this.formatDate(highlight.date)}
                    </div>
                    ${highlight.url ? `
                        <div style="font-size: 11px; color: var(--text-muted); margin-bottom: 6px; display: flex; align-items: center; gap: 4px;">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
                                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
                            </svg>
                            <span class="highlight-url" style="cursor: pointer; text-decoration: underline; color: #0ea5e9;" title="${highlight.url}">${this.getDomainFromUrl(highlight.url)}</span>
                        </div>
                    ` : ''}
                    <div class="highlight-content-preview" style="font-size: 13px; color: var(--text-secondary); line-height: 1.4; background: #fff3cd; padding: 8px; border-radius: 6px; border-left: 3px solid #ffc107;">
                        ${this.truncateText(highlight.content, 150)}
                    </div>
                </div>
                <div style="margin-top: 12px; display: flex; gap: 8px;">
                    <button class="secondary-btn delete-highlight" style="padding: 6px 12px; font-size: 12px;">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 4px;">
                            <polyline points="3,6 5,6 21,6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        </svg>
                        Delete
                    </button>
                </div>
            </div>
        `
      )
      .join("")

    // Add event listeners for highlights
    container.addEventListener('click', (e) => {
      const highlightItem = e.target.closest('.highlight-item')
      if (!highlightItem) return
      
      const highlightId = parseInt(highlightItem.dataset.id)
      
      if (e.target.closest('.delete-highlight')) {
        this.deleteHighlight(highlightId)
      } else if (e.target.closest('.highlight-url')) {
        const highlight = this.highlights.find(h => h.id === highlightId)
        if (highlight && highlight.url) {
          chrome.tabs.create({ url: highlight.url })
        }
      } else if (e.target.closest('.highlight-content')) {
        const highlight = this.highlights.find(h => h.id === highlightId)
        if (highlight) this.showHighlightModal(highlight)
      }
    })
  }

  renderSavedItems() {
    const container = document.getElementById("savedList")
    if (!container) return

    if (this.savedItems.length === 0) {
      container.innerHTML =
        '<div style="padding: 20px; text-align: center; color: var(--text-muted);">No saved items</div>'
      return
    }

    // Generate HTML for each saved item
    const htmlContent = this.savedItems
      .slice()
      .reverse()
      .map(
        (item) => `
            <div class="saved-item" data-id="${item.id}">
                <div class="saved-item-content">
                    <div style="font-weight: 600; margin-bottom: 6px; color: var(--text-primary);">
                        ${item.title}
                    </div>
                    <div style="font-size: 12px; color: var(--text-muted); margin-bottom: 8px;">
                        ${item.context ? item.context + ' • ' : ''}Saved ${this.formatDate(item.savedAt)}
                    </div>
                    <div style="font-size: 13px; color: var(--text-secondary); line-height: 1.4;">
                        ${this.truncateText(item.content, 100)}
                    </div>
                </div>
                <div class="saved-item-actions">
                    <button class="edit-saved-item-btn" title="Edit note" style="background: none; border: none; color: var(--text-muted); cursor: pointer; padding: 4px; border-radius: 4px;">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                        </svg>
                    </button>
                    <button class="delete-saved-item-btn" title="Delete note" style="background: none; border: none; color: var(--text-muted); cursor: pointer; padding: 4px; border-radius: 4px;">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="3,6 5,6 21,6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        </svg>
                    </button>
                </div>
            </div>
        `
      )
      .join("");

    container.innerHTML = htmlContent;

    // Add event listeners using event delegation
    container.addEventListener('click', (e) => {
      const savedItem = e.target.closest('.saved-item')
      if (!savedItem) return
      
      const itemId = parseInt(savedItem.dataset.id)
      
      if (e.target.closest('.edit-saved-item-btn')) {
        e.stopPropagation()
        this.editSavedNote(itemId)
      } else if (e.target.closest('.delete-saved-item-btn')) {
        e.stopPropagation()
        this.deleteSavedItem(itemId)
      } else if (e.target.closest('.saved-item-content')) {
        const item = this.savedItems.find(i => i.id === itemId)
        if (item) this.showNoteModal(item)
      }
    })

  }

  searchSavedItems(query) {
    if (!query.trim()) {
      this.renderSavedItems()
      return
    }

    const filtered = this.savedItems.filter(
      (item) =>
        item.content.toLowerCase().includes(query.toLowerCase()) ||
        item.context.toLowerCase().includes(query.toLowerCase()) ||
        item.title.toLowerCase().includes(query.toLowerCase()) ||
        (item.url && item.url.toLowerCase().includes(query.toLowerCase())) ||
        (item.pageTitle && item.pageTitle.toLowerCase().includes(query.toLowerCase())),
    )

    const container = document.getElementById("savedList")
    if (!container) return

    container.innerHTML = filtered
      .slice()
      .reverse()
      .map(
        (item) => `
            <div class="saved-item" data-id="${item.id}">
                <div class="saved-item-content">
                    <div style="font-weight: 600; margin-bottom: 6px; color: var(--text-primary);">
                        ${item.title}
                    </div>
                    <div style="font-size: 12px; color: var(--text-muted); margin-bottom: 8px;">
                        ${item.context} • Saved ${this.formatDate(item.savedAt)}
                    </div>
                    <div style="font-size: 13px; color: var(--text-secondary); line-height: 1.4;">
                        ${this.truncateText(item.content, 90)}
                    </div>
                </div>
                <div class="saved-item-actions">
                    <button class="edit-saved-item-btn" title="Edit note" style="background: none; border: none; color: var(--text-muted); cursor: pointer; padding: 4px; border-radius: 4px;">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                        </svg>
                    </button>
                    <button class="delete-saved-item-btn" title="Delete note" style="background: none; border: none; color: var(--text-muted); cursor: pointer; padding: 4px; border-radius: 4px;">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="3,6 5,6 21,6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        </svg>
                    </button>
                </div>
            </div>
        `,
      )
      .join("")

    // Add event listeners using event delegation
    container.addEventListener('click', (e) => {
      const savedItem = e.target.closest('.saved-item')
      if (!savedItem) return
      
      const itemId = parseInt(savedItem.dataset.id)
      
      if (e.target.closest('.edit-saved-item-btn')) {
        e.stopPropagation()
        this.editSavedNote(itemId)
      } else if (e.target.closest('.delete-saved-item-btn')) {
        e.stopPropagation()
        this.deleteSavedItem(itemId)
      } else if (e.target.closest('.saved-item-content')) {
        const item = this.savedItems.find(i => i.id === itemId)
        if (item) this.showNoteModal(item)
      }
    })
  }

  clearAllSaved() {
    if (confirm("Are you sure you want to clear all saved items?")) {
      this.savedItems = []
      this.saveData()
      this.renderSavedItems()
      this.showNotification("All saved items cleared")
    }
  }

  clearAllHighlights() {
    if (confirm("Are you sure you want to clear all highlights?")) {
      this.highlights = []
      this.saveData()
      this.renderHighlights()
      
      // Clear yellow overlays from all pages
      this.clearAllPageHighlights()
      
      this.showNotification("All highlights cleared")
    }
  }

  // Clear yellow overlays from all pages
  clearAllPageHighlights() {
    chrome.tabs.query({}, (tabs) => {
      tabs.forEach(tab => {
        chrome.tabs.sendMessage(tab.id, { action: 'clearAllPageHighlights' }, (response) => {
          if (chrome.runtime.lastError) {
            // Tab might not have content script, ignore error
          }
        })
      })
    })
  }

  clearAllTasks() {
    if (confirm("Are you sure you want to clear all tasks?")) {
      this.tasks = []
      this.saveData()
      this.renderTasks()
      this.updateTaskStats()
      this.showNotification("All tasks cleared")
    }
  }

  searchHighlights(query) {
    const container = document.getElementById("highlightsList")
    if (!container) return

    if (!query.trim()) {
      this.renderHighlights()
      return
    }

    const searchTerm = query.toLowerCase()
    const filteredHighlights = this.highlights.filter(highlight => 
      highlight.content.toLowerCase().includes(searchTerm) ||
      highlight.title.toLowerCase().includes(searchTerm) ||
      (highlight.context && highlight.context.toLowerCase().includes(searchTerm))
    )

    if (filteredHighlights.length === 0) {
      container.innerHTML = '<div style="padding: 20px; text-align: center; color: var(--text-muted);">No highlights found</div>'
      return
    }

    container.innerHTML = filteredHighlights
      .map(
        (highlight) => `
            <div class="highlight-item" data-id="${highlight.id}" style="margin-bottom: 28px;">
                <div class="highlight-content">
                    <div style="font-weight: 600; margin-bottom: 6px; color: var(--text-primary);">
                        ${highlight.title || 'Highlighted Text'}
                    </div>
                    <div style="font-size: 12px; color: var(--text-muted); margin-bottom: 8px;">
                        ${highlight.context ? highlight.context + ' • ' : ''}${this.formatDate(highlight.date)}
                    </div>
                    ${highlight.url ? `
                        <div style="font-size: 11px; color: var(--text-muted); margin-bottom: 6px; display: flex; align-items: center; gap: 4px;">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
                                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
                            </svg>
                            <span class="highlight-url" style="cursor: pointer; text-decoration: underline; color: #0ea5e9;" title="${highlight.url}">${this.getDomainFromUrl(highlight.url)}</span>
                        </div>
                    ` : ''}
                    <div style="font-size: 13px; color: var(--text-secondary); line-height: 1.4; background: #fff3cd; padding: 8px; border-radius: 6px; border-left: 3px solid #ffc107;">
                        ${this.truncateText(highlight.content, 150)}
                    </div>
                </div>
                <div style="margin-top: 12px; display: flex; gap: 8px;">
                    <button class="secondary-btn delete-highlight" style="padding: 6px 12px; font-size: 12px;">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 4px;">
                            <polyline points="3,6 5,6 21,6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        </svg>
                        Delete
                    </button>
                </div>
            </div>
        `
      )
      .join("")

    // Add event listeners for filtered highlights
    container.addEventListener('click', (e) => {
      const highlightItem = e.target.closest('.highlight-item')
      if (!highlightItem) return
      
      const highlightId = parseInt(highlightItem.dataset.id)
      
      if (e.target.closest('.delete-highlight')) {
        this.deleteHighlight(highlightId)
      } else if (e.target.closest('.highlight-url')) {
        const highlight = this.highlights.find(h => h.id === highlightId)
        if (highlight && highlight.url) {
          chrome.tabs.create({ url: highlight.url })
        }
      } else if (e.target.closest('.highlight-content')) {
        const highlight = this.highlights.find(h => h.id === highlightId)
        if (highlight) this.showHighlightModal(highlight)
      }
    })
  }

  deleteSavedItem(itemId) {
    if (confirm("Are you sure you want to delete this note?")) {
      this.savedItems = this.savedItems.filter((item) => item.id !== itemId)
      this.saveData()
      this.renderSavedItems()
      this.showNotification("Note deleted")
    }
  }

  deleteHighlight(highlightId) {
    // Find the highlight to get its URL and content before deletion
    const highlight = this.highlights.find(h => h.id === highlightId)
    
    this.highlights = this.highlights.filter((highlight) => highlight.id !== highlightId)
    this.saveData()
    this.renderHighlights()
    
    // Remove yellow overlay from the specific page if highlight has URL and content
    if (highlight && highlight.url && highlight.content) {
      this.removeHighlightFromPage(highlight.url, highlight.content)
    }
    
    this.showNotification("Highlight deleted")
  }

  // Remove highlight from specific page
  removeHighlightFromPage(url, content) {
    chrome.tabs.query({}, (tabs) => {
      tabs.forEach(tab => {
        if (tab.url === url) {
          chrome.tabs.sendMessage(tab.id, { 
            action: 'removeSpecificHighlight',
            content: content
          }, (response) => {
            if (chrome.runtime.lastError) {
              // Tab might not have content script, ignore error
            }
          })
        }
      })
    })
  }

  showHighlightModal(highlight) {
    // Remove any existing modal
    const existing = document.getElementById('floaty-popup-note-modal');
    if (existing) existing.remove();

    const modal = document.createElement('div');
    modal.id = 'floaty-popup-note-modal';
    modal.style.cssText = `
      position: fixed; top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(0,0,0,0.25); z-index: 10001;
      display: flex; align-items: center; justify-content: center;
    `;

    const inner = document.createElement('div');
    inner.style.cssText = `
      background: #fff; border-radius: 10px; box-shadow: 0 4px 24px rgba(0,0,0,0.18);
      padding: 24px 28px; min-width: 320px; max-width: 90vw; max-height: 80vh; overflow-y: auto;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; position: relative;
    `;

    inner.innerHTML = `
      <div style="font-size: 18px; font-weight: 600; margin-bottom: 12px;">${highlight.title || 'Highlighted Text'}</div>
      ${highlight.context ? `<div style="font-size: 13px; color: #888; margin-bottom: 10px;"><strong>Context:</strong> ${highlight.context}</div>` : ''}
      ${highlight.url ? `
        <div style="font-size: 12px; color: #666; margin-bottom: 10px; display: flex; align-items: center; gap: 6px;">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
          </svg>
          <span class="modal-highlight-url" style="cursor: pointer; text-decoration: underline; color: #0ea5e9;" title="${highlight.url}">${this.getDomainFromUrl(highlight.url)}</span>
        </div>
      ` : ''}
      <div style="font-size: 15px; color: #222; margin-bottom: 18px; background: #fff3cd; padding: 12px; border-radius: 8px; border-left: 4px solid #ffc107; white-space: pre-wrap;">${highlight.content || ''}</div>
      <div style="margin-top: 16px; display: flex; gap: 8px; justify-content: center;">
        <button id="copyHighlightBtn" style="padding: 8px 16px; background: #3b82f6; color: #fff; border: none; border-radius: 6px; font-size: 14px; cursor: pointer;">Copy Highlight</button>
        <button id="floaty-popup-close-modal-btn" style="padding: 8px 16px; background: #6b7280; color: #fff; border: none; border-radius: 6px; font-size: 14px; cursor: pointer;">Close</button>
      </div>
      <button id="floaty-popup-close-modal" style="position: absolute; top: 10px; right: 12px; background: none; border: none; font-size: 20px; color: #888; cursor: pointer;">×</button>
    `;

    modal.appendChild(inner);
    document.body.appendChild(modal);

    // Close handlers
    document.getElementById('floaty-popup-close-modal').onclick =
      document.getElementById('floaty-popup-close-modal-btn').onclick =
        () => modal.remove();
    
    // Copy highlight handler
    const copyHighlightBtn = document.getElementById('copyHighlightBtn');
    if (copyHighlightBtn) {
      copyHighlightBtn.onclick = () => {
        navigator.clipboard.writeText(highlight.content).then(() => {
          this.showNotification("Highlight copied to clipboard");
        });
      };
    }

    // URL click handler
    modal.addEventListener('click', (e) => {
      if (e.target.classList.contains('modal-highlight-url')) {
        if (highlight.url) {
          chrome.tabs.create({ url: highlight.url });
        }
      }
    });
  }

  async generateAllSummaries() {
    const itemsWithoutSummary = this.savedItems.filter((item) => !item.summary)

    if (itemsWithoutSummary.length === 0) {
      this.showNotification("All items already have summaries")
      return
    }

    this.showLoading("generateAllSummaries")

    try {
      for (const item of itemsWithoutSummary) {
        // Generate summary using Gemini
        item.summary = await this.gemini.generateSummary(item.content)
        await this.delay(500)
      }

      this.saveData()
      this.renderSavedItems()
      this.showNotification(`Generated ${itemsWithoutSummary.length} summaries`)
    } catch (error) {
      console.error("Error generating summaries:", error)
      this.showNotification("Error generating summaries")
    } finally {
      this.hideLoading("generateAllSummaries")
    }
  }

  generateSummary(content) {
    // Simple summary generation - take first sentence and key points
    const sentences = content.split(/[.!?]+/)
    const firstSentence = sentences[0]?.trim()
    const wordCount = content.split(" ").length

    return `${firstSentence}. (${wordCount} words total)`
  }

  // Tasks Management
  addTask() {
    const taskText = document.getElementById("taskText")
    const taskPriority = document.getElementById("taskPriority")
    if (!taskText) return

    const taskContent = taskText.value.trim()
    const priority = taskPriority ? taskPriority.value : 'medium'

    if (!taskContent) {
      this.showNotification("Please enter a task")
      return
    }

    const task = {
      id: Date.now(),
      text: taskContent,
      priority: priority,
      completed: false,
      createdAt: new Date().toISOString()
    }

    this.tasks.unshift(task)
    this.saveData()
    this.renderTasks()
    this.updateTaskStats()
    taskText.value = ""
    this.showNotification("Task added")
  }

  renderTasks() {
    const container = document.getElementById("tasksList")
    if (!container) return

    if (this.tasks.length === 0) {
      container.innerHTML =
        '<div style="padding: 20px; text-align: center; color: var(--text-muted);">No tasks yet</div>'
      return
    }

    // Remove existing event listeners by replacing the container
    const newContainer = container.cloneNode(false)
    container.parentNode.replaceChild(newContainer, container)

    newContainer.innerHTML = this.tasks
      .slice()
      .map(
        (task) => `
            <div class="task-item${task.completed ? ' completed' : ''}" data-id="${task.id}">
                <div class="task-content">
                    <input type="checkbox" class="task-checkbox" ${task.completed ? "checked" : ""}>
                    <div style="flex: 1; display: flex; flex-direction: column; gap: 4px;">
                        <span class="task-text${task.completed ? ' task-text-completed' : ''}">${task.text}</span>
                        ${task.context ? `<div style="font-size: 12px; color: var(--text-muted);">${task.context}</div>` : ''}
                        ${task.source ? `<div style="font-size: 11px; color: var(--text-muted);">From: ${task.source.noteTitle || 'Note'}</div>` : ''}
                    </div>
                    <div class="task-priority">
                        <span class="priority-badge ${task.priority || 'medium'}">${task.priority || 'medium'}</span>
                        <div class="task-actions">
                            <button class="icon-btn edit-task-btn" title="Edit task">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                                </svg>
                            </button>
                            <button class="icon-btn delete-task-btn" title="Delete task">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <polyline points="3,6 5,6 21,6"></polyline>
                                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `
      )
      .join("")

    // Add event listeners using event delegation
    newContainer.addEventListener('click', (e) => {
      const taskItem = e.target.closest('.task-item')
      if (!taskItem) return
      
      const taskId = parseInt(taskItem.dataset.id)
      
      if (e.target.closest('.task-checkbox')) {
        this.toggleTask(taskId)
      } else if (e.target.closest('.edit-task-btn')) {
        this.editTask(taskId)
      } else if (e.target.closest('.delete-task-btn')) {
        this.deleteTask(taskId)
      }
    })

    // Update task stats after rendering
    this.updateTaskStats()
  }

  toggleTask(taskId) {
    const index = this.tasks.findIndex((t) => t.id === taskId)
    if (index !== -1) {
      this.tasks[index].completed = !this.tasks[index].completed
      this.saveData()
      this.renderTasks()
      this.updateTaskStats()
    }
  }

  deleteTask(taskId) {
    if (confirm('Are you sure you want to delete this task?')) {
      this.tasks = this.tasks.filter((t) => t.id !== taskId)
      this.saveData()
      this.renderTasks()
      this.updateTaskStats()
      this.showNotification('Task deleted')
    }
  }

  updateTaskStats() {
    const statsElement = document.getElementById("taskStats")
    if (!statsElement) return

    const totalTasks = this.tasks.length
    const completedTasks = this.tasks.filter((t) => t.completed).length

    statsElement.textContent = `${totalTasks} tasks • ${completedTasks} completed`
  }

  // Tasks Dialog
  showTasksDialog(tasks) {
    const container = document.getElementById("extractedTasksList")
    const dialog = document.getElementById("tasksDialog")

    if (!container || !dialog) return

    container.innerHTML = tasks
      .map(
        (task, index) => `
            <div style="padding: 12px; border: 1px solid var(--border-color); border-radius: var(--radius-lg); margin-bottom: 8px; background: var(--bg-primary);">
                <label style="display: flex; align-items: center; gap: 12px; cursor: pointer;">
                    <input type="checkbox" checked data-index="${index}" style="width: 18px; height: 18px;">
                    <span style="font-size: 14px; color: var(--text-primary);">${task.text}</span>
                </label>
            </div>
        `,
      )
      .join("")

    this.extractedTasks = tasks
    dialog.style.display = "flex"
  }

  hideTasksDialog() {
    const dialog = document.getElementById("tasksDialog")
    if (dialog) {
      dialog.style.display = "none"
    }
    this.extractedTasks = []
  }

  addAllExtractedTasks() {
    const checkboxes = document.querySelectorAll('#extractedTasksList input[type="checkbox"]')
    let addedCount = 0

    checkboxes.forEach((checkbox, index) => {
      if (checkbox.checked && this.extractedTasks[index]) {
        const task = {
          id: Date.now() + index,
          text: this.extractedTasks[index].text,
          completed: false,
          createdAt: new Date().toISOString(),
        }
        this.tasks.unshift(task)
        addedCount++
      }
    })

    if (addedCount > 0) {
      this.saveData()
      this.renderTasks()
      this.updateTaskStats()
      this.showNotification(`Added ${addedCount} tasks`)
    }

    this.hideTasksDialog()
  }

  // Modal Management
  showNoteModal(note) {
    // Remove any existing modal
    const existing = document.getElementById('floaty-popup-note-modal');
    if (existing) existing.remove();

    const modal = document.createElement('div');
    modal.id = 'floaty-popup-note-modal';
    modal.style.cssText = `
      position: fixed; top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(0,0,0,0.25); z-index: 10001;
      display: flex; align-items: center; justify-content: center;
    `;

    const inner = document.createElement('div');
    inner.style.cssText = `
      background: #fff; border-radius: 10px; box-shadow: 0 4px 24px rgba(0,0,0,0.18);
      padding: 24px 28px; min-width: 320px; max-width: 90vw; max-height: 80vh; overflow-y: auto;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; position: relative;
    `;

    // Build action items HTML
    const actionItemsHTML = `
      <div style="margin-top: 16px; padding: 12px; background: #f0f9ff; border: 1px solid #0ea5e9; border-radius: 8px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
          <div style="font-weight: 600; color: #0ea5e9;">Action Items:</div>
          <button class="add-action-item-btn" 
                  data-item-id="${note.id}"
                  style="background: none; border: none; color: #0ea5e9; cursor: pointer; font-size: 12px; padding: 4px 8px; border-radius: 4px; hover:background-color: rgba(14, 165, 233, 0.1);">
            + Add Item
          </button>
        </div>
        <div style="margin: 0; color: #0369a1;">
          ${note.actionItems && note.actionItems.length > 0 ? note.actionItems.map((task, index) => `
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
              <input type="checkbox" 
                     class="modal-action-item-checkbox" 
                     data-item-id="${note.id}" 
                     data-task-index="${index}"
                     ${(task.completed || (typeof task === 'string' ? false : task.completed)) ? 'checked' : ''}
                     style="width: 16px; height: 16px; cursor: pointer;">
              <span class="modal-action-item-text" 
                    data-item-id="${note.id}" 
                    data-task-index="${index}"
                    style="${(task.completed || (typeof task === 'string' ? false : task.completed)) ? 'text-decoration: line-through; opacity: 0.6;' : ''}; cursor: pointer; flex: 1;">${typeof task === 'string' ? task : task.text}</span>
              <button class="modal-action-item-edit-btn" 
                      data-item-id="${note.id}" 
                      data-task-index="${index}"
                      style="background: none; border: none; color: #0ea5e9; cursor: pointer; padding: 2px; font-size: 12px; opacity: 0.7;">
                  ✏️
              </button>
              <button class="modal-action-item-delete-btn" 
                      data-item-id="${note.id}" 
                      data-task-index="${index}"
                      style="background: none; border: none; color: #ef4444; cursor: pointer; padding: 2px; font-size: 12px; opacity: 0.7;">
                  🗑️
              </button>
            </div>
          `).join('') : '<div style="color: #6b7280; font-style: italic; text-align: center; padding: 8px;">No action items yet</div>'}
        </div>
      </div>
    `;

    // Build summary HTML
    const summaryHTML = note.summary 
      ? `
        <div style="margin-top: 16px; padding: 12px; background: linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%); color: white; border-radius: 8px;">
          <div style="font-weight: 600; margin-bottom: 8px;">AI Summary:</div>
          <div>${note.summary}</div>
        </div>
      ` : '';

    inner.innerHTML = `
      <div style="font-size: 18px; font-weight: 600; margin-bottom: 12px;">${note.context || 'Note'}</div>
      ${note.url ? `
        <div style="font-size: 12px; color: #666; margin-bottom: 10px; display: flex; align-items: center; gap: 6px; padding-left: 20px;">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
          </svg>
          <span class="modal-note-url" style="cursor: pointer; text-decoration: underline; color: #0ea5e9;" title="${note.url}">${this.getDomainFromUrl(note.url)}</span>
        </div>
      ` : ''}
      <div style="font-size: 15px; color: #222; margin-bottom: 18px; white-space: pre-wrap; border: 1px solid #e5e7eb; background: #f9fafb; padding: 16px; border-radius: 8px;">${note.content || note.text || ''}</div>
      ${actionItemsHTML}
      ${summaryHTML}
      <div style="margin-top: 16px; display: flex; gap: 8px; justify-content: center;">
        ${!note.summary ? `<button id="generateSummaryBtn" style="padding: 8px 16px; background: none; border: 1px solid #d1d5db; color: #374151; border-radius: 6px; font-size: 14px; cursor: pointer; display: flex; align-items: center; gap: 6px;">🤖 Generate AI Summary</button>` : ''}
      </div>
      <button id="floaty-popup-close-modal" style="position: absolute; top: 10px; right: 12px; background: none; border: none; font-size: 20px; color: #888; cursor: pointer;">×</button>
    `;

    modal.appendChild(inner);
    document.body.appendChild(modal);

    // Close handlers
    document.getElementById('floaty-popup-close-modal').onclick = () => modal.remove();
    
    // Generate summary handler
    const generateSummaryBtn = document.getElementById('generateSummaryBtn');
    if (generateSummaryBtn) {
      generateSummaryBtn.onclick = () => this.generateSummaryForModal();
    }

    // Add event listeners for modal action item checkboxes
    modal.addEventListener('change', (e) => {
      if (e.target.classList.contains('modal-action-item-checkbox')) {
        const itemId = parseInt(e.target.dataset.itemId);
        const taskIndex = parseInt(e.target.dataset.taskIndex);
        const isChecked = e.target.checked;
        
        this.toggleActionItem(itemId, taskIndex, isChecked);
        
        // Update the modal to reflect changes
        const item = this.savedItems.find(i => i.id === itemId);
        if (item) {
          this.showNoteModal(item);
        }
      }
    });

    // Add event listeners for modal action item editing and deleting
    modal.addEventListener('click', (e) => {
      if (e.target.classList.contains('modal-action-item-edit-btn') || e.target.classList.contains('modal-action-item-text')) {
        const itemId = parseInt(e.target.dataset.itemId);
        const taskIndex = parseInt(e.target.dataset.taskIndex);
        
        this.editActionItem(itemId, taskIndex);
        
        // Update the modal to reflect changes
        const item = this.savedItems.find(i => i.id === itemId);
        if (item) {
          this.showNoteModal(item);
        }
      } else if (e.target.classList.contains('modal-action-item-delete-btn')) {
        const itemId = parseInt(e.target.dataset.itemId);
        const taskIndex = parseInt(e.target.dataset.taskIndex);
        
        this.deleteActionItem(itemId, taskIndex);
        
        // Update the modal to reflect changes
        const item = this.savedItems.find(i => i.id === itemId);
        if (item) {
          this.showNoteModal(item);
        }
      } else if (e.target.classList.contains('add-action-item-btn')) {
        const itemId = parseInt(e.target.dataset.itemId);
        
        this.addNewActionItem(itemId);
        
        // Update the modal to reflect changes
        const item = this.savedItems.find(i => i.id === itemId);
        if (item) {
          this.showNoteModal(item);
        }
      } else if (e.target.classList.contains('modal-note-url')) {
        const item = this.savedItems.find(i => i.id === note.id);
        if (item && item.url) {
          chrome.tabs.create({ url: item.url });
        }
      }
    });
  }

  hideModal(modalId) {
    switch(modalId) {
      case 'noteModal':
        const noteModal = document.getElementById('noteModal')
        if (noteModal) {
          noteModal.classList.add('hidden')
          this.stopTTS()
        }
        break
      
      case 'tasksDialog':
        const tasksDialog = document.getElementById('tasksDialog')
        if (tasksDialog) {
          tasksDialog.classList.add('hidden')
        }
        break
      
      case 'taskDetectionDialog':
        const taskDetectionDialog = document.getElementById('taskDetectionDialog')
        if (taskDetectionDialog) {
          // Discard the pending note if user closes via Escape
          if (this.pendingNote) {
            this.pendingNote = null
            this.showNotification('❌ Note creation cancelled')
          }
          taskDetectionDialog.classList.add('hidden')
        }
        break
      
      case 'hotkeysModal':
        const hotkeysModal = document.getElementById('hotkeysModal')
        if (hotkeysModal) {
          hotkeysModal.classList.add('hidden')
        }
        break
      
      case 'editModal':
      case 'editTaskModal':
        const modal = document.getElementById(modalId)
        if (modal && modal.parentNode) {
          modal.parentNode.removeChild(modal)
        }
        break
      
      default:
        // Close all modals if no specific ID is provided
        document.querySelectorAll('.modal').forEach(modal => {
          if (modal.id === 'editModal' || modal.id === 'editTaskModal') {
            if (modal.parentNode) {
              modal.parentNode.removeChild(modal)
            }
          } else {
            modal.classList.add('hidden')
          }
        })
        this.stopTTS()
    }
  }

  readModalContent() {
    if (this.currentModalNote) {
      this.speakText(this.currentModalNote.content)
    }
  }

  copyModalContent() {
    if (this.currentModalNote) {
      navigator.clipboard
        .writeText(this.currentModalNote.content)
        .then(() => {
          this.showNotification("Content copied to clipboard")
        })
        .catch(() => {
          this.showNotification("Failed to copy content")
        })
    }
  }

  async generateSummaryForModal() {
    // Find the current modal note
    const modal = document.getElementById('floaty-popup-note-modal');
    if (!modal) return;

    // Get the note content from the modal
    const contentElement = modal.querySelector('div[style*="white-space: pre-wrap"]');
    if (!contentElement) return;

    const noteContent = contentElement.textContent;
    const noteContext = modal.querySelector('div[style*="font-size: 18px"]')?.textContent || 'Note';

    this.showLoading("generateSummary");

    try {
      // Generate summary using Gemini
      const summary = await this.gemini.generateSummary(noteContent);
      
      // Find the note in saved items by context and content
      const savedIndex = this.savedItems.findIndex((n) => 
        n.context === noteContext && n.content === noteContent
      );
      
      if (savedIndex !== -1) {
        this.savedItems[savedIndex].summary = summary;
        this.saveData();
        
        // Update the modal to show the summary
        this.showNoteModal(this.savedItems[savedIndex]);
      } else {
        // Fallback: try to find by content only
        const fallbackIndex = this.savedItems.findIndex((n) => n.content === noteContent);
        if (fallbackIndex !== -1) {
          this.savedItems[fallbackIndex].summary = summary;
          this.saveData();
          
          // Update the modal to show the summary
          this.showNoteModal(this.savedItems[fallbackIndex]);
        }
      }

      this.showNotification("Summary generated");
    } catch (error) {
      console.error("Error generating summary:", error);
      this.showNotification("Error generating summary");
    } finally {
      this.hideLoading("generateSummary");
    }
  }

  // Utility Methods
  updateDateTime() {
    const now = new Date()
    const formatted = now.toLocaleString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
    const element = document.getElementById("currentDateTime")
    if (element) {
      element.textContent = formatted
    }
  }

  formatDate(isoString) {
    const date = new Date(isoString)
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  truncateText(text, maxLength) {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength) + "..." : text;
  }

  getDomainFromUrl(url) {
    if (!url) return '';
    try {
      const domain = new URL(url).hostname;
      return domain.replace('www.', '');
    } catch (error) {
      return url.length > 30 ? url.substring(0, 30) + '...' : url;
    }
  }

  showLoading(buttonId) {
    const button = document.getElementById(buttonId + "Btn") || document.getElementById(buttonId)
    const text = document.getElementById(buttonId + "Text")
    const loader = document.getElementById(buttonId + "Loader")

    if (text) text.style.display = "none"
    if (loader) loader.style.display = "flex"
    if (button) button.disabled = true
  }

  hideLoading(buttonId) {
    const button = document.getElementById(buttonId + "Btn") || document.getElementById(buttonId)
    const text = document.getElementById(buttonId + "Text")
    const loader = document.getElementById(buttonId + "Loader")

    if (text) text.style.display = "inline"
    if (loader) loader.style.display = "none"
    if (button) button.disabled = false
  }

  showNotification(message) {
    // Create a simple notification
    const notification = document.createElement("div")
    notification.textContent = message
    notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: var(--accent-color);
            color: var(--bg-primary);
            padding: 16px 20px;
            border-radius: var(--radius-xl);
            box-shadow: var(--shadow-lg);
            z-index: 2000;
            font-size: 14px;
            font-weight: 500;
            max-width: 280px;
            border: 1px solid var(--border-color);
        `

    document.body.appendChild(notification)

    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification)
      }
    }, 3000)
  }

  delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }

  // Data Persistence
  async saveData() {
    const savedItems = this.savedItems.map(item => ({
      id: item.id,
      title: item.title,
      content: item.content,
      text: item.content, // ensure text is set for storage
      context: item.context,
      actionItems: item.actionItems || [],
      summary: item.summary || '',
      tasks: item.tasks,
      savedAt: item.savedAt,
      url: item.url || '',
      pageTitle: item.pageTitle || ''
    }));
    
    const highlights = this.highlights.map(highlight => ({
      id: highlight.id,
      title: highlight.title,
      content: highlight.content,
      context: highlight.context,
      date: highlight.date,
      url: highlight.url || '',
      pageTitle: highlight.pageTitle || ''
    }));
    
    const tasks = this.tasks.map(task => ({
      id: task.id,
      text: task.text,
      completed: task.completed,
      createdAt: task.createdAt,
      source: task.source || null
    }));
    
    chrome.storage.local.set({ savedItems, highlights, tasks });
  }

  async loadData() {
    try {
      console.log('[Floaty] Loading data...')
      const response = await new Promise((resolve, reject) => {
        chrome.runtime.sendMessage({ action: "loadData" }, (res) => {
          if (chrome.runtime.lastError) {
            console.error('[Floaty] Runtime error:', chrome.runtime.lastError)
            reject(chrome.runtime.lastError)
          } else {
            console.log('[Floaty] Load data response:', res)
            resolve(res)
          }
        })
      })
      
      if (response && response.success && response.data) {
        console.log('[Floaty] Data loaded successfully:', {
          notesCount: response.data.notes?.length || 0,
          savedItemsCount: response.data.savedItems?.length || 0,
          highlightsCount: response.data.highlights?.length || 0,
          tasksCount: response.data.tasks?.length || 0
        })
        
        this.savedItems = response.data.savedItems || response.data.notes || []
        this.highlights = response.data.highlights || []
        this.tasks = response.data.tasks || []
        
        console.log('[Floaty] Stored Notes:', this.savedItems.length)
        
        // Ensure action items and summaries are loaded
        this.savedItems.forEach(item => {
          if (!item.actionItems) item.actionItems = []
          if (!item.summary) item.summary = ''
          if (!item.url) item.url = ''
          if (!item.pageTitle) item.pageTitle = ''
          
          // Convert old string action items to objects
          if (item.actionItems.length > 0) {
            item.actionItems = item.actionItems.map(actionItem => {
              if (typeof actionItem === 'string') {
                return { text: actionItem, completed: false }
              }
              return actionItem
            })
          }
        })
        
        this.renderTasks()
        this.renderSavedItems()
        this.renderHighlights()
      } else {
        console.error('[Floaty] Invalid response format:', response)
      }
    } catch (error) {
      console.error("[Floaty] Error loading data via background.js:", error)
    }
  }

  // Save note textarea content to storage
  saveNoteTextareaContent() {
    const noteTextarea = document.getElementById('noteText')
    if (noteTextarea) {
      const content = noteTextarea.value
      chrome.storage.local.set({ noteTextareaContent: content }, () => {
        console.log('[Floaty] Note textarea content saved')
      })
    }
  }

  // Load note textarea content from storage
  loadNoteTextareaContent() {
    chrome.storage.local.get(['noteTextareaContent'], (result) => {
      const noteTextarea = document.getElementById('noteText')
      if (noteTextarea && result.noteTextareaContent) {
        noteTextarea.value = result.noteTextareaContent
        console.log('[Floaty] Note textarea content restored')
      }
    })
  }

  // Task Detection Methods
  showTaskDetectionDialog(tasks) {
    const extractTasks = document.getElementById("extractTasksCheckbox");
    if (extractTasks && !extractTasks.checked) return;
    this.detectedTasks = tasks
    const dialog = document.getElementById("taskDetectionDialog")
    const tasksList = document.getElementById("detectedTasksList")
    const addButton = document.getElementById("addSelectedTasks")

    if (!dialog || !tasksList || !addButton) return

    tasksList.innerHTML = tasks.map((task, index) => `
      <div class="detected-task-item">
        <input type="checkbox" class="detected-task-checkbox" data-index="${index}" checked>
        <div class="detected-task-content">
          <div class="detected-task-title">${task.text}</div>
          <div class="detected-task-context">${task.context}</div>
          <div class="detected-task-priority">
            <span class="priority-label">Priority:</span>
            <select class="priority-select" data-index="${index}">
              <option value="high">High</option>
              <option value="medium" selected>Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
        </div>
      </div>
    `).join('')

    // Update button text
    addButton.textContent = `Add ${tasks.length} Task${tasks.length !== 1 ? 's' : ''}`

    dialog.classList.remove('hidden')

    // Add event listeners for checkboxes and priority selects
    const checkboxes = tasksList.querySelectorAll('.detected-task-checkbox')
    const prioritySelects = tasksList.querySelectorAll('.priority-select')

    checkboxes.forEach(checkbox => {
      checkbox.addEventListener('change', () => this.updateSelectedTasksCount())
    })

    prioritySelects.forEach(select => {
      select.addEventListener('change', (e) => {
        const index = e.target.dataset.index
        if (index !== undefined) {
          this.detectedTasks[index].priority = e.target.value
        }
      })
    })
  }

  hideTaskDetectionDialog() {
    const dialog = document.getElementById("taskDetectionDialog")
    if (dialog) {
      dialog.classList.add('hidden')
    }
  }

  updateSelectedTasksCount() {
    const addButton = document.getElementById("addSelectedTasks")
    const checkboxes = document.querySelectorAll('.detected-task-checkbox:checked')
    
    if (addButton) {
      const count = checkboxes.length
      addButton.textContent = `Add ${count} Task${count !== 1 ? 's' : ''}`
    }
  }

  addSelectedTasksToList() {
    const checkboxes = document.querySelectorAll('.detected-task-checkbox:checked')
    const selectedTasks = Array.from(checkboxes).map(checkbox => {
      const index = checkbox.dataset.index
      return this.detectedTasks[index]
    })

    // Save the pending note first
    if (this.pendingNote) {
      this.saveNoteToStorage(this.pendingNote)
      this.pendingNote = null
    }

    // Add all selected tasks to global tasks list (no duplicate checking for newly approved tasks)
    let addedCount = 0
    selectedTasks.forEach(task => {
      this.tasks.push({
        id: Date.now() + Math.floor(Math.random() * 1000000),
        text: task.text,
        context: task.context,
        priority: task.priority,
        completed: false,
        createdAt: new Date().toISOString()
      })
      addedCount++
    })

    // Update storage and UI
    if (addedCount > 0) {
      this.saveData()
      this.renderTasks()
      this.showNotification(`✅ Note saved and ${addedCount} task${addedCount !== 1 ? 's' : ''} added to global list`)
    } else {
      this.showNotification('✅ Note saved successfully')
    }
    
    this.hideTaskDetectionDialog()
  }

  toggleActionItem(itemId, taskIndex, isChecked) {
    const item = this.savedItems.find(i => i.id === itemId)
    if (!item || !item.actionItems || !item.actionItems[taskIndex]) return

    // Convert string action items to objects if needed
    if (typeof item.actionItems[taskIndex] === 'string') {
      item.actionItems[taskIndex] = {
        text: item.actionItems[taskIndex],
        completed: isChecked
      }
    } else {
      item.actionItems[taskIndex].completed = isChecked
    }

    this.saveData()
    this.renderSavedItems()
    
    // Show notification
    const actionText = typeof item.actionItems[taskIndex] === 'string' 
      ? item.actionItems[taskIndex] 
      : item.actionItems[taskIndex].text
    this.showNotification(`Action item ${isChecked ? 'completed' : 'unchecked'}: ${this.truncateText(actionText, 30)}`)
  }

  editActionItem(itemId, taskIndex) {
    const item = this.savedItems.find(i => i.id === itemId)
    if (!item || !item.actionItems || !item.actionItems[taskIndex]) return

    const currentText = typeof item.actionItems[taskIndex] === 'string' 
      ? item.actionItems[taskIndex] 
      : item.actionItems[taskIndex].text

    // Create edit modal
    const editModal = document.createElement('div')
    editModal.id = 'editActionItemModal'
    editModal.style.cssText = `
      position: fixed; top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(0,0,0,0.5); z-index: 10002;
      display: flex; align-items: center; justify-content: center;
    `

    const modalContent = document.createElement('div')
    modalContent.style.cssText = `
      background: white; border-radius: 12px; padding: 24px;
      min-width: 300px; max-width: 500px; width: 90%;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    `

    modalContent.innerHTML = `
      <h3 style="margin: 0 0 16px 0; color: #333;">Edit Action Item</h3>
      <textarea id="editActionItemText" 
                style="width: 100%; min-height: 80px; padding: 12px; border: 1px solid #ddd; border-radius: 6px; font-size: 14px; resize: vertical; margin-bottom: 16px;"
                placeholder="Enter action item text...">${currentText}</textarea>
      <div style="display: flex; gap: 8px; justify-content: flex-end;">
        <button id="cancelEditActionItem" style="padding: 8px 16px; background: #f3f4f6; border: 1px solid #d1d5db; border-radius: 6px; cursor: pointer;">Cancel</button>
        <button id="saveEditActionItem" style="padding: 8px 16px; background: #0ea5e9; color: white; border: none; border-radius: 6px; cursor: pointer;">Save</button>
      </div>
    `

    editModal.appendChild(modalContent)
    document.body.appendChild(editModal)

    // Focus on textarea
    const textarea = document.getElementById('editActionItemText')
    textarea.focus()
    textarea.select()

    // Event listeners
    const cancelBtn = document.getElementById('cancelEditActionItem')
    const saveBtn = document.getElementById('saveEditActionItem')

    const closeModal = () => {
      if (editModal.parentNode) {
        editModal.parentNode.removeChild(editModal)
      }
    }

    cancelBtn.onclick = closeModal
    saveBtn.onclick = () => {
      const newText = textarea.value.trim()
      if (newText) {
        // Update the action item
        if (typeof item.actionItems[taskIndex] === 'string') {
          item.actionItems[taskIndex] = {
            text: newText,
            completed: false
          }
        } else {
          item.actionItems[taskIndex].text = newText
        }

        this.saveData()
        this.renderSavedItems()
        this.showNotification('Action item updated successfully')
        closeModal()
      } else {
        this.showNotification('Action item text cannot be empty', 'error')
      }
    }

    // Close on escape key and enter key support
    editModal.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        closeModal()
      } else if (e.key === 'Enter' && e.ctrlKey) {
        saveBtn.click()
      }
    })

    // Close on outside click
    editModal.addEventListener('click', (e) => {
      if (e.target === editModal) {
        closeModal()
      }
    })
  }

  deleteActionItem(itemId, taskIndex) {
    const item = this.savedItems.find(i => i.id === itemId)
    if (!item || !item.actionItems || !item.actionItems[taskIndex]) return

    const actionText = typeof item.actionItems[taskIndex] === 'string' 
      ? item.actionItems[taskIndex] 
      : item.actionItems[taskIndex].text

    if (confirm(`Are you sure you want to delete this action item?\n\n"${actionText}"`)) {
      // Remove the action item
      item.actionItems.splice(taskIndex, 1)

      this.saveData()
      this.renderSavedItems()
      this.showNotification('Action item deleted successfully')
    }
  }

  addNewActionItem(itemId) {
    const item = this.savedItems.find(i => i.id === itemId)
    if (!item) return

    // Create add modal
    const addModal = document.createElement('div')
    addModal.id = 'addActionItemModal'
    addModal.style.cssText = `
      position: fixed; top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(0,0,0,0.5); z-index: 10002;
      display: flex; align-items: center; justify-content: center;
    `

    const modalContent = document.createElement('div')
    modalContent.style.cssText = `
      background: white; border-radius: 12px; padding: 24px;
      min-width: 300px; max-width: 500px; width: 90%;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    `

    modalContent.innerHTML = `
      <h3 style="margin: 0 0 16px 0; color: #333;">Add New Action Item</h3>
      <textarea id="newActionItemText" 
                style="width: 100%; min-height: 80px; padding: 12px; border: 1px solid #ddd; border-radius: 6px; font-size: 14px; resize: vertical; margin-bottom: 16px;"
                placeholder="Enter new action item text..."></textarea>
      <div style="display: flex; gap: 8px; justify-content: flex-end;">
        <button id="cancelAddActionItem" style="padding: 8px 16px; background: #f3f4f6; border: 1px solid #d1d5db; border-radius: 6px; cursor: pointer;">Cancel</button>
        <button id="saveAddActionItem" style="padding: 8px 16px; background: #0ea5e9; color: white; border: none; border-radius: 6px; cursor: pointer;">Add</button>
      </div>
    `

    addModal.appendChild(modalContent)
    document.body.appendChild(addModal)

    // Focus on textarea
    const textarea = document.getElementById('newActionItemText')
    textarea.focus()

    // Event listeners
    const cancelBtn = document.getElementById('cancelAddActionItem')
    const saveBtn = document.getElementById('saveAddActionItem')

    const closeModal = () => {
      if (addModal.parentNode) {
        addModal.parentNode.removeChild(addModal)
      }
    }

    cancelBtn.onclick = closeModal
    saveBtn.onclick = () => {
      const newText = textarea.value.trim()
      if (newText) {
        // Initialize actionItems array if it doesn't exist
        if (!item.actionItems) {
          item.actionItems = []
        }

        // Add the new action item to the note
        const newActionItem = {
          text: newText,
          completed: false
        }
        item.actionItems.push(newActionItem)

        // Also add to global tasks list
        this.tasks.push({
          id: Date.now() + Math.floor(Math.random() * 1000000),
          text: newText,
          context: item.context || '',
          priority: 'medium',
          completed: false,
          createdAt: new Date().toISOString(),
          source: {
            noteId: item.id,
            noteTitle: item.title || item.context || 'Note',
            url: item.url || ''
          }
        })

        this.saveData()
        this.renderSavedItems()
        this.renderTasks()
        this.showNotification('Action item added to note and global tasks')
        
        // Refresh the modal to show the new action item
        this.showNoteModal(item)
        
        closeModal()
      } else {
        this.showNotification('Action item text cannot be empty', 'error')
      }
    }

    // Close on escape key and enter key support
    addModal.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        closeModal()
      } else if (e.key === 'Enter' && e.ctrlKey) {
        saveBtn.click()
      }
    })

    // Close on outside click
    addModal.addEventListener('click', (e) => {
      if (e.target === addModal) {
        closeModal()
      }
    })
  }

  // Add new edit saved note function
  editSavedItem(itemId) {
    // Remove any existing edit modal before creating a new one
    const existingEditModal = document.getElementById('editModal');
    if (existingEditModal) existingEditModal.remove();

    const item = this.savedItems.find((i) => i.id === itemId)
    if (!item) return

    // Create edit modal HTML
    const editModal = document.createElement('div')
    editModal.className = 'modal'
    editModal.id = 'editModal'
    editModal.innerHTML = `
      <div class="modal-content" style="width: 90%; max-width: 600px;">
        <div class="modal-header">
          <h3>Edit Note</h3>
          <button id="closeEditModal" class="close-btn">×</button>
        </div>
        <div class="modal-body">
          <div style="margin-bottom: 16px;">
            <label for="editContext" style="display: block; margin-bottom: 8px;">Context</label>
            <input type="text" id="editContext" class="input-field" value="${item.context}" style="width: 100%;">
          </div>
          <div style="margin-bottom: 16px;">
            <label for="editContent" style="display: block; margin-bottom: 8px;">Content</label>
            <textarea id="editContent" class="input-field" style="width: 100%; min-height: 200px;">${item.content}</textarea>
          </div>
        </div>
        <div class="modal-footer">
          <button id="saveEditBtn" class="primary-btn">Save Changes</button>
          <button id="cancelEditBtn" class="secondary-btn">Cancel</button>
        </div>
      </div>
    `
    document.body.appendChild(editModal)

    // Setup event listeners for edit modal
    const closeEditModal = document.getElementById('closeEditModal')
    const saveEditBtn = document.getElementById('saveEditBtn')
    const cancelEditBtn = document.getElementById('cancelEditBtn')
    const editContent = document.getElementById('editContent')
    const editContext = document.getElementById('editContext')

    function closeEditModalHandler() {
      if (document.body.contains(editModal)) {
      document.body.removeChild(editModal)
      }
    }

    const self = this;
    function saveEditHandler() {
      const updatedContent = editContent.value.trim()
      const updatedContext = editContext.value.trim()

      if (!updatedContent) {
        self.showNotification('Note content cannot be empty')
        return
      }

      // Update the saved item
      const index = self.savedItems.findIndex((i) => i.id === itemId)
      if (index !== -1) {
        self.savedItems[index] = {
          ...self.savedItems[index],
          content: updatedContent,
          text: updatedContent, // Ensure text is updated too
          context: updatedContext || '',
          title: self.generateTitle(updatedContent),
          editedAt: new Date().toISOString()
        }
        // Update chrome.storage.local.notes as well
        chrome.storage.local.get({ notes: [] }, (result) => {
          const notes = result.notes || [];
          const noteIdx = notes.findIndex(n => n.id === itemId);
          if (noteIdx !== -1) {
            notes[noteIdx] = {
              ...notes[noteIdx],
              text: updatedContent,
              content: updatedContent, // Ensure content is updated too
              context: updatedContext || '',
              title: self.generateTitle(updatedContent),
              editedAt: new Date().toISOString(),
              date: notes[noteIdx].date // Preserve original savedAt
            };
            chrome.storage.local.set({ notes }, () => {
              self.loadData(); // Reload from storage to update UI
              self.showNotification('Note updated successfully');
              closeEditModalHandler();
            });
          } else {
            self.saveData();
            self.renderSavedItems();
            self.showNotification('Note updated successfully');
            closeEditModalHandler();
          }
        });
      } else {
        closeEditModalHandler();
      }
    }

    closeEditModal.addEventListener('click', closeEditModalHandler)
    saveEditBtn.addEventListener('click', saveEditHandler)
    cancelEditBtn.addEventListener('click', closeEditModalHandler)
    editModal.addEventListener('click', (e) => {
      if (e.target === editModal) {
        closeEditModalHandler()
      }
    })
  }

  // Add edit task function
  editTask(taskId) {
    const task = this.tasks.find((t) => t.id === taskId)
    if (!task) return

    // Create edit modal HTML
    const editModal = document.createElement('div')
    editModal.className = 'modal'
    editModal.id = 'editTaskModal'
    editModal.innerHTML = `
      <div class="modal-content" style="width: 90%; max-width: 500px;">
        <div class="modal-header">
          <h3>Edit Task</h3>
          <button id="closeEditTaskModal" class="close-btn">×</button>
        </div>
        <div class="modal-body">
          <div style="margin-bottom: 16px;">
            <label for="editTaskText" style="display: block; margin-bottom: 8px;">Task</label>
            <input type="text" id="editTaskText" class="input-field" value="${task.text.replace(/"/g, '&quot;')}" style="width: 100%;">
          </div>
          <div style="margin-bottom: 16px;">
            <label for="editTaskPriority" style="display: block; margin-bottom: 8px;">Priority</label>
            <select id="editTaskPriority" class="priority-select" style="width: 100%;">
              <option value="low" ${task.priority === 'low' ? 'selected' : ''}>Low</option>
              <option value="medium" ${task.priority === 'medium' || !task.priority ? 'selected' : ''}>Medium</option>
              <option value="high" ${task.priority === 'high' ? 'selected' : ''}>High</option>
            </select>
          </div>
          <div style="margin-bottom: 16px;">
            <label class="checkbox-label" style="display: flex; align-items: center; gap: 8px;">
              <input type="checkbox" id="editTaskCompleted" ${task.completed ? 'checked' : ''}>
              <span>Completed</span>
            </label>
          </div>
        </div>
        <div class="modal-footer">
          <button id="saveTaskEditBtn" class="primary-btn">Save Changes</button>
          <button id="cancelTaskEditBtn" class="secondary-btn">Cancel</button>
        </div>
      </div>
    `
    document.body.appendChild(editModal)

    // Setup event listeners for edit modal
    const closeEditModal = document.getElementById('closeEditTaskModal')
    const saveEditBtn = document.getElementById('saveTaskEditBtn')
    const cancelEditBtn = document.getElementById('cancelTaskEditBtn')
    const editTaskText = document.getElementById('editTaskText')
    const editTaskPriority = document.getElementById('editTaskPriority')
    const editTaskCompleted = document.getElementById('editTaskCompleted')

    const closeEditModalHandler = () => {
      this.hideModal('editTaskModal')
    }

    const saveEditHandler = () => {
      const updatedText = editTaskText.value.trim()
      const updatedPriority = editTaskPriority.value
      const updatedCompleted = editTaskCompleted.checked

      if (!updatedText) {
        this.showNotification('Task text cannot be empty')
        return
      }

      // Update the task
      const index = this.tasks.findIndex((t) => t.id === taskId)
      if (index !== -1) {
        this.tasks[index] = {
          ...this.tasks[index],
          text: updatedText,
          priority: updatedPriority,
          completed: updatedCompleted,
          editedAt: new Date().toISOString()
        }
        this.saveData()
        this.renderTasks()
        this.updateTaskStats()
        this.showNotification('Task updated successfully')
      }

      closeEditModalHandler()
    }

    // Add keyboard event listener for Enter key
    editTaskText.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        saveEditHandler()
      }
    })

    closeEditModal.addEventListener('click', closeEditModalHandler)
    saveEditBtn.addEventListener('click', saveEditHandler)
    cancelEditBtn.addEventListener('click', closeEditModalHandler)
    editModal.addEventListener('click', (e) => {
      if (e.target === editModal) {
        closeEditModalHandler()
      }
    })

    // Focus the input field
    editTaskText.focus()
    editTaskText.select()
  }

  // Add showHotkeysModal method
  showHotkeysModal() {
    const modal = document.getElementById('hotkeysModal')
    if (modal) {
      modal.classList.remove('hidden')
    }
  }

  // Hotkey action methods
  openQuickNote() {
    // Switch to Notes tab and focus the textarea
    this.switchTab('notes')
    const noteText = document.getElementById('noteText')
    if (noteText) {
      noteText.focus()
      this.showNotification('Quick note ready - start typing!')
    }
  }

  readSelectedText() {
    // Get selected text from the current page and read it aloud
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs && tabs.length > 0) {
        chrome.scripting.executeScript({
          target: { tabId: tabs[0].id },
          func: () => {
            const selection = window.getSelection()
            return selection ? selection.toString() : ''
          }
        }, (results) => {
          if (results && results[0] && results[0].result) {
            const selectedText = results[0].result.trim()
            if (selectedText) {
              this.speakText(selectedText)
              this.showNotification('Reading selected text aloud')
            } else {
              this.showNotification('No text selected')
            }
          }
        })
      }
    })
  }

  openSearch() {
    // Open global search
    this.toggleGlobalSearch()
    const searchInput = document.getElementById('globalSearchInput')
    if (searchInput) {
      searchInput.focus()
    }
  }

  editSavedNote(itemId) {
    const item = this.savedItems.find(i => i.id === itemId)
    if (!item) return

    // Create edit modal
    const modal = document.createElement('div')
    modal.id = 'floaty-edit-note-modal'
    modal.style.cssText = `
      position: fixed; top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(0,0,0,0.25); z-index: 10001;
      display: flex; align-items: center; justify-content: center;
    `

    const inner = document.createElement('div')
    inner.style.cssText = `
      background: #fff; border-radius: 10px; box-shadow: 0 4px 24px rgba(0,0,0,0.18);
      padding: 24px 28px; min-width: 320px; max-width: 90vw; max-height: 80vh; overflow-y: auto;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; position: relative;
    `

    inner.innerHTML = `
      <div style="font-size: 18px; font-weight: 600; margin-bottom: 12px;">Edit Note</div>
      
      <div style="margin-bottom: 16px;">
        <label style="display: block; font-size: 12px; font-weight: 600; color: var(--text-muted); margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.5px;">Title:</label>
        <input type="text" id="editNoteTitle" value="${item.title || ''}" style="width: 100%; padding: 10px 12px; background: var(--bg-secondary); border: 1px solid var(--border-light); border-radius: var(--radius-lg); font-size: 14px; color: var(--text-primary);">
      </div>
      
      <div style="margin-bottom: 16px;">
        <label style="display: block; font-size: 12px; font-weight: 600; color: var(--text-muted); margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.5px;">Context:</label>
        <input type="text" id="editNoteContext" value="${item.context || ''}" style="width: 100%; padding: 10px 12px; background: var(--bg-secondary); border: 1px solid var(--border-light); border-radius: var(--radius-lg); font-size: 14px; color: var(--text-primary);">
      </div>
      
      <div style="margin-bottom: 20px;">
        <label style="display: block; font-size: 12px; font-weight: 600; color: var(--text-muted); margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.5px;">Content:</label>
        <textarea id="editNoteContent" rows="8" style="width: 100%; padding: 12px; background: var(--bg-secondary); border: 1px solid var(--border-light); border-radius: var(--radius-lg); white-space: pre-wrap; line-height: 1.5; font-size: 14px; color: var(--text-primary); resize: vertical;">${item.content || ''}</textarea>
      </div>
      
      <div style="display: flex; gap: 8px; justify-content: center;">
        <button class="cancel-btn" style="padding: 8px 16px; background: none; border: 1px solid var(--border-color); color: var(--text-primary); border-radius: var(--radius-lg); font-size: 14px; cursor: pointer;">Cancel</button>
        <button class="save-btn" style="padding: 8px 16px; border: none; background: var(--primary-color); color: white; border-radius: var(--radius-lg); font-size: 14px; cursor: pointer;">Save Changes</button>
      </div>
      
      <button id="floaty-edit-close-modal" style="position: absolute; top: 10px; right: 12px; background: none; border: none; font-size: 20px; color: #888; cursor: pointer;">×</button>
    `

    modal.appendChild(inner)
    document.body.appendChild(modal)

    // Add event listeners
    const closeBtn = document.getElementById('floaty-edit-close-modal')
    const cancelBtn = modal.querySelector('.cancel-btn')
    const saveBtn = modal.querySelector('.save-btn')

    const closeModal = () => {
      if (modal.parentNode) {
        modal.parentNode.removeChild(modal)
      }
    }

    closeBtn.onclick = closeModal
    cancelBtn.addEventListener('click', closeModal)

    saveBtn.addEventListener('click', () => {
      const title = document.getElementById('editNoteTitle').value.trim()
      const context = document.getElementById('editNoteContext').value.trim()
      const content = document.getElementById('editNoteContent').value.trim()

      if (!content) {
        this.showNotification("Note content cannot be empty", "error")
        return
      }

      // Update the note
      item.title = title || this.fallbackTitle(content, context)
      item.context = context
      item.content = content
      item.updatedAt = new Date().toISOString()

      this.saveData()
      this.renderSavedItems()
      this.showNotification("Note updated successfully")
      closeModal()
    })

    // Focus on title input
    setTimeout(() => {
      document.getElementById('editNoteTitle').focus()
    }, 100)
  }

  openDictationModal() {
    // Create dictation modal
    const modal = document.createElement('div')
    modal.id = 'floaty-dictation-modal'
    modal.style.cssText = `
      position: fixed; top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(0,0,0,0.25); z-index: 10001;
      display: flex; align-items: center; justify-content: center;
    `

    const inner = document.createElement('div')
    inner.style.cssText = `
      background: #fff; border-radius: 10px; box-shadow: 0 4px 24px rgba(0,0,0,0.18);
      padding: 24px 28px; min-width: 400px; max-width: 90vw; max-height: 80vh; overflow-y: auto;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    `

    inner.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
        <h3 style="margin: 0; font-size: 18px; font-weight: 600;">Voice Dictation</h3>
        <button class="close-btn" style="background: none; border: none; font-size: 24px; cursor: pointer; color: #666;">×</button>
      </div>
      
      <div style="margin-bottom: 16px;">
        <div id="dictationStatus" style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;">
          <div id="dictationIndicator" style="width: 12px; height: 12px; border-radius: 50%; background: #dc3545; animation: pulse 1.5s infinite;"></div>
          <span id="dictationText">Click Start to begin dictation...</span>
        </div>
        
        <div style="display: flex; gap: 8px; margin-bottom: 16px;">
          <button id="startDictationBtn" style="padding: 8px 16px; border: none; background: #28a745; color: white; border-radius: 6px; cursor: pointer;">Start</button>
          <button id="pauseDictationBtn" style="padding: 8px 16px; border: 1px solid #ddd; background: #f8f9fa; border-radius: 6px; cursor: pointer; display: none;">Pause</button>
          <button id="stopDictationBtn" style="padding: 8px 16px; border: 1px solid #ddd; background: #f8f9fa; border-radius: 6px; cursor: pointer; display: none;">Stop</button>
        </div>
      </div>
      
      <div style="margin-bottom: 20px;">
        <label style="display: block; margin-bottom: 6px; font-weight: 500; color: #333;">Transcribed Text:</label>
        <textarea id="dictationTextarea" rows="8" style="width: 100%; padding: 8px 12px; border: 1px solid #ddd; border-radius: 6px; font-size: 14px; resize: vertical; color: #333 !important;" placeholder="Your speech will appear here..."></textarea>
      </div>
      
      <div style="display: flex; gap: 12px; justify-content: flex-end;">
        <button class="cancel-btn" style="padding: 8px 16px; border: 1px solid #ddd; background: #f8f9fa; border-radius: 6px; cursor: pointer;">Cancel</button>
        <button id="addToNoteBtn" style="padding: 8px 16px; border: none; background: #007bff; color: white; border-radius: 6px; cursor: pointer;">Add to Note</button>
      </div>
      
      <style>
        @keyframes pulse {
          0% { opacity: 1; }
          50% { opacity: 0.5; }
          100% { opacity: 1; }
        }
      </style>
    `

    modal.appendChild(inner)
    document.body.appendChild(modal)

    // Get elements
    const closeBtn = modal.querySelector('.close-btn')
    const cancelBtn = modal.querySelector('.cancel-btn')
    const startBtn = modal.querySelector('#startDictationBtn')
    const pauseBtn = modal.querySelector('#pauseDictationBtn')
    const stopBtn = modal.querySelector('#stopDictationBtn')
    const addToNoteBtn = modal.querySelector('#addToNoteBtn')
    const dictationTextarea = modal.querySelector('#dictationTextarea')
    const dictationIndicator = modal.querySelector('#dictationIndicator')
    const dictationText = modal.querySelector('#dictationText')

    let isRecording = false
    let recognition = null

    const closeModal = () => {
      if (isRecording && recognition) {
        recognition.stop()
      }
      if (modal.parentNode) {
        modal.parentNode.removeChild(modal)
      }
    }

    const startDictation = () => {
      if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        dictationText.textContent = 'Speech recognition not supported in this browser'
        return
      }

      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      recognition = new SpeechRecognition()
      
      recognition.continuous = true
      recognition.interimResults = true
      recognition.lang = 'en-US'

      recognition.onstart = () => {
        isRecording = true
        startBtn.style.display = 'none'
        pauseBtn.style.display = 'inline-block'
        stopBtn.style.display = 'inline-block'
        dictationIndicator.style.background = '#28a745'
        dictationText.textContent = 'Listening...'
      }

      recognition.onresult = (event) => {
        let finalTranscript = ''
        let interimTranscript = ''

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript
          if (event.results[i].isFinal) {
            finalTranscript += transcript + ' '
          } else {
            interimTranscript += transcript
          }
        }

        dictationTextarea.value = finalTranscript + interimTranscript
      }

      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error)
        dictationText.textContent = `Error: ${event.error}`
        stopDictation()
      }

      recognition.onend = () => {
        isRecording = false
        startBtn.style.display = 'inline-block'
        pauseBtn.style.display = 'none'
        stopBtn.style.display = 'none'
        dictationIndicator.style.background = '#dc3545'
        dictationText.textContent = 'Dictation stopped'
      }

      recognition.start()
    }

    const pauseDictation = () => {
      if (recognition) {
        recognition.stop()
      }
    }

    const stopDictation = () => {
      if (recognition) {
        recognition.stop()
      }
    }

    const addToNote = () => {
      const text = dictationTextarea.value.trim()
      if (text) {
        const noteTextarea = document.getElementById('noteText')
        if (noteTextarea) {
          const currentText = noteTextarea.value
          const separator = currentText ? '\n\n' : ''
          noteTextarea.value = currentText + separator + text
          this.saveNoteTextareaContent()
          this.showNotification('Text added to note')
        }
      }
      closeModal()
    }

    // Add event listeners
    closeBtn.addEventListener('click', closeModal)
    cancelBtn.addEventListener('click', closeModal)
    startBtn.addEventListener('click', startDictation)
    pauseBtn.addEventListener('click', pauseDictation)
    stopBtn.addEventListener('click', stopDictation)
    addToNoteBtn.addEventListener('click', addToNote)

    // Auto-start dictation
    setTimeout(() => {
      startDictation()
    }, 500)
  }
}

// Initialize the extension
let floatyApp
document.addEventListener("DOMContentLoaded", () => {
  floatyApp = new FloatyExtension()
})

// Listen for changes to notes in storage and update Saved and Tasks sections live
chrome.storage.onChanged.addListener((changes, area) => {
  if (area === 'local' && changes.notes && floatyApp) {
    const notes = changes.notes.newValue || [];
    // Update savedItems
    floatyApp.savedItems = notes.map((note) => ({
      id: note.id,
      title: note.title || 'Untitled',
      content: note.content || note.text || '',
      context: note.context || '',
      actionItems: note.actionItems || [],
      tasks: note.tasks || [],
      savedAt: note.date || new Date().toISOString(),
      url: note.url || '',
    }));
    floatyApp.renderSavedItems();
  }
});
