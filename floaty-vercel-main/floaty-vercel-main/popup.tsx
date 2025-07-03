"use client"
import { useState, useEffect, useRef } from "react"
import type React from "react"

import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import {
  Mic,
  Save,
  FileText,
  CheckSquare,
  Folder,
  Plus,
  Trash2,
  Edit3,
  Check,
  X,
  XIcon,
  Brain,
  Sparkles,
} from "lucide-react"
import { FloatingNoteLogo } from "./floating-note-logo"
import { TaskExtractor, type ExtractedTask } from "./task-extractor"
import { TaskPreviewModal } from "./task-preview-modal"

interface ActionItem {
  id: number
  content: string
  completed: boolean
  priority: "high" | "medium" | "low"
  sourceNoteId?: number
  extractedFromNote?: boolean
}

interface SavedNote {
  id: number
  content: string
  tags: string[]
  date: string
  processedContent?: string
  hasExtractedTasks?: boolean
}

interface ChromeExtensionPopupProps {
  currentNote: string
  setCurrentNote: (note: string) => void
  onClose: () => void
  isDesktopMode?: boolean
}

export default function ChromeExtensionPopup({
  currentNote,
  setCurrentNote,
  onClose,
  isDesktopMode = false,
}: ChromeExtensionPopupProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [savedNotes, setSavedNotes] = useState<SavedNote[]>([
    { id: 1, content: "Meeting with team about Q1 goals", tags: ["meeting", "goals", "team"], date: "2 hours ago" },
    {
      id: 2,
      content: "Research React 19 features for upcoming project",
      tags: ["research", "react", "development"],
      date: "1 day ago",
    },
    { id: 3, content: "Call mom about weekend plans", tags: ["personal", "family"], date: "2 days ago" },
  ])
  const [actionItems, setActionItems] = useState<ActionItem[]>([
    { id: 1, content: "Review design mockups", completed: false, priority: "high" },
    { id: 2, content: "Update project documentation", completed: true, priority: "medium" },
    { id: 3, content: "Schedule team standup", completed: false, priority: "low" },
  ])
  const [generatedTags, setGeneratedTags] = useState<string[]>([])
  const [showTaskPreview, setShowTaskPreview] = useState(false)
  const [extractedTasks, setExtractedTasks] = useState<ExtractedTask[]>([])
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const { toast } = useToast()

  // Action items state
  const [isAddingItem, setIsAddingItem] = useState(false)
  const [newItemContent, setNewItemContent] = useState("")
  const [newItemPriority, setNewItemPriority] = useState<"high" | "medium" | "low">("medium")
  const [editingItemId, setEditingItemId] = useState<number | null>(null)
  const [editingContent, setEditingContent] = useState("")
  const [editingPriority, setEditingPriority] = useState<"high" | "medium" | "low">("medium")

  // Window state
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const popupRef = useRef<HTMLDivElement>(null)

  // Generate AI tags when text is entered
  useEffect(() => {
    if (currentNote.length > 10) {
      const mockTags = generateMockTags(currentNote)
      setGeneratedTags(mockTags)
    } else {
      setGeneratedTags([])
    }
  }, [currentNote])

  const generateMockTags = (text: string): string[] => {
    const allTags = [
      "meeting",
      'ideas",',
      "todo",
      "research",
      "personal",
      "work",
      "urgent",
      "follow-up",
      "notes",
      "planning",
      "ai",
      "technology",
      "productivity",
    ]
    const words = text.toLowerCase().split(" ")
    const relevantTags = allTags.filter(
      (tag) => words.some((word) => word.includes(tag.substring(0, 3))) || Math.random() > 0.7,
    )
    return relevantTags.slice(0, 3)
  }

  const handleVoiceInput = () => {
    setIsRecording(!isRecording)
    if (!isRecording) {
      // Mock speech-to-text
      setTimeout(() => {
        setCurrentNote((prev) => prev + (prev ? " " : "") + "This is a mock voice input transcription.")
        setIsRecording(false)
      }, 2000)
    }
  }

  const handleSaveNote = async () => {
    if (currentNote.trim()) {
      setIsAnalyzing(true)

      // Simulate analysis delay
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Extract tasks from the note
      const extractionResult = TaskExtractor.extractTasks(currentNote)

      const newNote: SavedNote = {
        id: Date.now(),
        content: currentNote,
        tags: generatedTags,
        date: "Just now",
        processedContent: extractionResult.processedNote,
        hasExtractedTasks: extractionResult.tasks.length > 0,
      }

      setSavedNotes((prev) => [newNote, ...prev])
      setCurrentNote("")
      setGeneratedTags([])
      setIsAnalyzing(false)

      if (extractionResult.tasks.length > 0) {
        setExtractedTasks(extractionResult.tasks.map((task) => ({ ...task, sourceNoteId: newNote.id })))
        setShowTaskPreview(true)
      } else {
        toast({
          title: "Note saved",
          description: "Your note has been saved successfully.",
        })
      }
    }
  }

  const handleTaskConfirmation = (selectedTasks: ExtractedTask[]) => {
    const newActionItems: ActionItem[] = selectedTasks.map((task) => ({
      id: Date.now() + Math.random(),
      content: task.content,
      completed: false,
      priority: task.priority,
      sourceNoteId: task.sourceNoteId,
      extractedFromNote: true,
    }))

    setActionItems((prev) => [...newActionItems, ...prev])
    setShowTaskPreview(false)
    setExtractedTasks([])

    toast({
      title: "Tasks added successfully",
      description: `${selectedTasks.length} action item${selectedTasks.length !== 1 ? "s" : ""} added from your note.`,
    })
  }

  const handleTaskCancellation = () => {
    setShowTaskPreview(false)
    setExtractedTasks([])

    toast({
      title: "Note saved",
      description: "Your note has been saved without extracting tasks.",
    })
  }

  const toggleActionItem = (id: number) => {
    setActionItems((prev) => prev.map((item) => (item.id === id ? { ...item, completed: !item.completed } : item)))
  }

  const addActionItem = () => {
    if (newItemContent.trim()) {
      const newItem: ActionItem = {
        id: Date.now(),
        content: newItemContent.trim(),
        completed: false,
        priority: newItemPriority,
      }
      setActionItems((prev) => [newItem, ...prev])
      setNewItemContent("")
      setNewItemPriority("medium")
      setIsAddingItem(false)
      toast({
        title: "Action item added",
        description: "New action item has been created.",
      })
    }
  }

  const deleteActionItem = (id: number) => {
    setActionItems((prev) => prev.filter((item) => item.id !== id))
    toast({
      title: "Action item deleted",
      description: "The action item has been removed.",
    })
  }

  const startEditingItem = (item: ActionItem) => {
    setEditingItemId(item.id)
    setEditingContent(item.content)
    setEditingPriority(item.priority)
  }

  const saveEditingItem = () => {
    if (editingContent.trim() && editingItemId) {
      setActionItems((prev) =>
        prev.map((item) =>
          item.id === editingItemId ? { ...item, content: editingContent.trim(), priority: editingPriority } : item,
        ),
      )
      setEditingItemId(null)
      setEditingContent("")
      setEditingPriority("medium")
      toast({
        title: "Action item updated",
        description: "Changes have been saved.",
      })
    }
  }

  const cancelEditingItem = () => {
    setEditingItemId(null)
    setEditingContent("")
    setEditingPriority("medium")
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    if (popupRef.current) {
      const rect = popupRef.current.getBoundingClientRect()
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      })
      setIsDragging(true)
    }
  }

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        const newX = e.clientX - dragOffset.x
        const newY = e.clientY - dragOffset.y

        // Constrain to viewport bounds
        const maxX = window.innerWidth - 380
        const maxY = window.innerHeight - 600

        setPosition({
          x: Math.max(0, Math.min(newX, maxX)),
          y: Math.max(0, Math.min(newY, maxY)),
        })
      }
    }

    const handleMouseUp = () => {
      setIsDragging(false)
    }

    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove)
      document.addEventListener("mouseup", handleMouseUp)
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseup", handleMouseUp)
    }
  }, [isDragging, dragOffset])

  // Desktop mode styling - Black and White theme
  const popupStyles = isDesktopMode
    ? {
        background: "rgba(0, 0, 0, 0.8)",
        backdropFilter: "blur(20px) saturate(180%)",
        WebkitBackdropFilter: "blur(20px) saturate(180%)",
        border: "1px solid rgba(255, 255, 255, 0.2)",
        boxShadow: "0 8px 32px rgba(0, 0, 0, 0.5)",
      }
    : {
        background: "white",
        border: "1px solid #d1d5db",
        boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
      }

  const windowSize = { width: "380px", height: "600px" }

  return (
    <>
      <div
        ref={popupRef}
        className={`rounded-lg overflow-hidden transition-all duration-300 ${isDragging ? "cursor-grabbing" : ""}`}
        style={{
          position: "relative",
          transform: `translate(${position.x}px, ${position.y}px)`,
          transition: isDragging ? "none" : "all 0.3s ease",
          zIndex: 1000,
          ...windowSize,
          ...popupStyles,
        }}
      >
        {/* Extension Header with Window Controls */}
        <div
          className={`p-3 border-b flex items-center justify-between transition-all duration-300 ${
            !isDragging ? "cursor-grab" : "cursor-grabbing"
          }`}
          style={{
            background: isDesktopMode ? "rgba(0, 0, 0, 0.6)" : "linear-gradient(to right, #f8f9fa, #e9ecef)",
            borderBottom: isDesktopMode ? "1px solid rgba(255, 255, 255, 0.2)" : "1px solid #e5e7eb",
            backdropFilter: isDesktopMode ? "blur(10px)" : "none",
            WebkitBackdropFilter: isDesktopMode ? "blur(10px)" : "none",
          }}
          onMouseDown={handleMouseDown}
        >
          <div className="flex items-center gap-2">
            <FloatingNoteLogo size={20} />
            <div>
              <span className={`text-sm font-semibold ${isDesktopMode ? "text-white" : "text-black"}`}>Floaty</span>
              <p className={`text-xs ${isDesktopMode ? "text-white/70" : "text-gray-500"}`}>
                Smart task detection • Desktop Extension
              </p>
            </div>
          </div>

          {/* Window Controls */}
          <div className="flex items-center gap-1">
            <Button
              onClick={onClose}
              variant="ghost"
              size="sm"
              className={`h-6 w-6 p-0 rounded-full ${
                isDesktopMode ? "hover:bg-red-500/20 text-red-400" : "hover:bg-red-100 text-red-600"
              }`}
            >
              <XIcon className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <Tabs defaultValue="current" className="flex-1 flex flex-col h-full">
          <div className="px-4 pt-2">
            <TabsList
              className={`grid w-full grid-cols-3 ${
                isDesktopMode ? "bg-black/20 border-white/20" : "bg-gray-100 border-gray-200"
              }`}
            >
              <TabsTrigger
                value="current"
                className={`text-xs ${
                  isDesktopMode
                    ? "data-[state=active]:bg-white/20 data-[state=active]:text-white text-white/70"
                    : "data-[state=active]:bg-white data-[state=active]:text-black text-gray-600"
                }`}
              >
                <FileText className="w-3 h-3 mr-1" />
                Notes
              </TabsTrigger>
              <TabsTrigger
                value="saved"
                className={`text-xs ${
                  isDesktopMode
                    ? "data-[state=active]:bg-white/20 data-[state=active]:text-white text-white/70"
                    : "data-[state=active]:bg-white data-[state=active]:text-black text-gray-600"
                }`}
              >
                <Folder className="w-3 h-3 mr-1" />
                Saved
              </TabsTrigger>
              <TabsTrigger
                value="actions"
                className={`text-xs ${
                  isDesktopMode
                    ? "data-[state=active]:bg-white/20 data-[state=active]:text-white text-white/70"
                    : "data-[state=active]:bg-white data-[state=active]:text-black text-gray-600"
                }`}
              >
                <CheckSquare className="w-3 h-3 mr-1" />
                Tasks
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="flex-1 overflow-hidden">
            <TabsContent value="current" className="h-full m-0 p-4 space-y-4">
              <div className="space-y-3">
                <Textarea
                  placeholder="Write something… meeting notes, snippets, ideas, tasks"
                  value={currentNote}
                  onChange={(e) => setCurrentNote(e.target.value)}
                  className={`min-h-[200px] resize-none text-sm transition-all duration-300 ${
                    isDesktopMode
                      ? "bg-black/20 border-white/20 text-white placeholder:text-white/60 focus:bg-black/30"
                      : "bg-white border-gray-300 text-black placeholder:text-gray-500"
                  }`}
                />

                {generatedTags.length > 0 && (
                  <div className="space-y-2">
                    <p className={`text-xs ${isDesktopMode ? "text-white/70" : "text-gray-600"}`}>AI-generated tags:</p>
                    <div className="flex flex-wrap gap-1">
                      {generatedTags.map((tag, index) => (
                        <Badge
                          key={index}
                          variant="secondary"
                          className={`text-xs ${
                            isDesktopMode
                              ? "bg-white/20 text-white border-white/30"
                              : "bg-gray-200 text-black border-gray-300"
                          }`}
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex gap-2">
                  <Button
                    onClick={handleVoiceInput}
                    variant={isRecording ? "destructive" : "outline"}
                    size="sm"
                    className={`flex-1 ${
                      isDesktopMode && !isRecording
                        ? "bg-black/20 border-white/30 text-white hover:bg-black/30"
                        : !isDesktopMode && !isRecording
                          ? "bg-white border-gray-300 text-black hover:bg-gray-100"
                          : ""
                    }`}
                  >
                    <Mic className="w-4 h-4 mr-2" />
                    {isRecording ? (
                      <span className="flex items-center gap-1">
                        Recording
                        <div className="flex gap-1">
                          <div className="w-1 h-1 bg-current rounded-full animate-bounce" />
                          <div
                            className="w-1 h-1 bg-current rounded-full animate-bounce"
                            style={{ animationDelay: "0.1s" }}
                          />
                          <div
                            className="w-1 h-1 bg-current rounded-full animate-bounce"
                            style={{ animationDelay: "0.2s" }}
                          />
                        </div>
                      </span>
                    ) : (
                      "Voice"
                    )}
                  </Button>
                  <Button
                    onClick={handleSaveNote}
                    size="sm"
                    className={`flex-1 relative ${
                      isDesktopMode
                        ? "bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm border border-white/30"
                        : "bg-black hover:bg-gray-800 text-white"
                    }`}
                    disabled={isAnalyzing}
                  >
                    {isAnalyzing ? (
                      <>
                        <Brain className="w-4 h-4 mr-2 animate-pulse" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Save Note
                        {currentNote.length > 20 && (
                          <Sparkles className={`w-3 h-3 ml-1 ${isDesktopMode ? "text-white" : "text-yellow-400"}`} />
                        )}
                      </>
                    )}
                  </Button>
                </div>
              </div>

              <Separator className={isDesktopMode ? "bg-white/20" : "bg-gray-200"} />

              <div className="space-y-3 text-xs">
                <div
                  className={`p-3 rounded-lg border transition-all duration-300 ${
                    isDesktopMode ? "bg-black/20 border-white/20 backdrop-blur-sm" : "bg-gray-50 border-gray-200"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Brain className={`w-4 h-4 ${isDesktopMode ? "text-white" : "text-black"}`} />
                    <p className={`font-medium ${isDesktopMode ? "text-white" : "text-black"}`}>Smart Task Detection</p>
                  </div>
                  <p className={isDesktopMode ? "text-white/80" : "text-gray-700"}>
                    I'll automatically detect action items in your notes using bullet points, keywords, and context
                    analysis.
                  </p>
                </div>

                <div className={`p-3 rounded-lg ${isDesktopMode ? "bg-black/10" : "bg-gray-100"}`}>
                  <p className={`font-medium mb-1 ${isDesktopMode ? "text-white" : "text-black"}`}>
                    Keyboard Shortcuts
                  </p>
                  <div className="space-y-1">
                    <p className={isDesktopMode ? "text-white/80" : "text-gray-700"}>
                      <kbd
                        className={`px-1 py-0.5 rounded text-xs mr-2 ${
                          isDesktopMode
                            ? "bg-white/20 text-white border border-white/30"
                            : "bg-gray-200 text-black border border-gray-300"
                        }`}
                      >
                        Ctrl+Alt+N
                      </kbd>
                      Toggle Extension
                    </p>
                    <p className={isDesktopMode ? "text-white/80" : "text-gray-700"}>
                      <kbd
                        className={`px-1 py-0.5 rounded text-xs mr-2 ${
                          isDesktopMode
                            ? "bg-white/20 text-white border border-white/30"
                            : "bg-gray-200 text-black border border-gray-300"
                        }`}
                      >
                        Ctrl+Alt+D
                      </kbd>
                      Desktop Mode
                    </p>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="saved" className="h-full m-0 p-4">
              <div className="space-y-3 h-full overflow-y-auto">
                {savedNotes.map((note) => (
                  <Card
                    key={note.id}
                    className={`p-3 transition-all duration-300 ${
                      isDesktopMode ? "bg-black/20 border-white/20 backdrop-blur-sm" : "bg-white border-gray-200"
                    }`}
                  >
                    <div className="space-y-2">
                      <div className="flex items-start justify-between">
                        <p className={`text-sm flex-1 ${isDesktopMode ? "text-white" : "text-black"}`}>
                          {note.processedContent || note.content}
                        </p>
                        {note.hasExtractedTasks && (
                          <div className="flex items-center gap-1 ml-2">
                            <Brain className={`w-3 h-3 ${isDesktopMode ? "text-white" : "text-black"}`} />
                            <span className={`text-xs font-medium ${isDesktopMode ? "text-white" : "text-black"}`}>
                              Tasks
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {note.tags.map((tag, index) => (
                          <Badge
                            key={index}
                            variant="outline"
                            className={`text-xs ${
                              isDesktopMode
                                ? "bg-white/10 text-white border-white/30"
                                : "bg-gray-100 text-black border-gray-300"
                            }`}
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      <p className={`text-xs ${isDesktopMode ? "text-white/60" : "text-gray-500"}`}>{note.date}</p>
                    </div>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="actions" className="h-full m-0 p-4">
              <div className="space-y-3 h-full overflow-y-auto">
                {/* Add New Item Button */}
                <div className="flex justify-between items-center">
                  <h4 className={`text-sm font-medium ${isDesktopMode ? "text-white" : "text-black"}`}>Action Items</h4>
                  <Button
                    onClick={() => setIsAddingItem(true)}
                    size="sm"
                    variant="outline"
                    className={`h-8 w-8 p-0 ${
                      isDesktopMode
                        ? "bg-black/20 border-white/30 text-white hover:bg-black/30"
                        : "bg-white border-gray-300 text-black hover:bg-gray-100"
                    }`}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>

                {/* Add New Item Form */}
                {isAddingItem && (
                  <Card
                    className={`p-3 border-dashed border-2 transition-all duration-300 ${
                      isDesktopMode ? "border-white/30 bg-black/20 backdrop-blur-sm" : "border-gray-300 bg-gray-50"
                    }`}
                  >
                    <div className="space-y-3">
                      <Input
                        placeholder="Enter new action item..."
                        value={newItemContent}
                        onChange={(e) => setNewItemContent(e.target.value)}
                        className={`text-sm ${
                          isDesktopMode
                            ? "bg-black/20 border-white/20 text-white placeholder:text-white/60"
                            : "bg-white border-gray-300 text-black placeholder:text-gray-500"
                        }`}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            addActionItem()
                          } else if (e.key === "Escape") {
                            setIsAddingItem(false)
                            setNewItemContent("")
                          }
                        }}
                        autoFocus
                      />
                      <div className="flex items-center justify-between">
                        <Select
                          value={newItemPriority}
                          onValueChange={(value: "high" | "medium" | "low") => setNewItemPriority(value)}
                        >
                          <SelectTrigger
                            className={`w-24 h-8 text-xs ${
                              isDesktopMode
                                ? "bg-black/20 border-white/20 text-white"
                                : "bg-white border-gray-300 text-black"
                            }`}
                          >
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="high">High</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="low">Low</SelectItem>
                          </SelectContent>
                        </Select>
                        <div className="flex gap-2">
                          <Button
                            onClick={addActionItem}
                            size="sm"
                            className={`h-8 px-3 ${
                              isDesktopMode
                                ? "bg-white/20 hover:bg-white/30 text-white"
                                : "bg-black hover:bg-gray-800 text-white"
                            }`}
                          >
                            <Check className="w-3 h-3" />
                          </Button>
                          <Button
                            onClick={() => {
                              setIsAddingItem(false)
                              setNewItemContent("")
                            }}
                            size="sm"
                            variant="outline"
                            className={`h-8 px-3 ${
                              isDesktopMode
                                ? "bg-black/20 border-white/20 text-white hover:bg-black/30"
                                : "bg-white border-gray-300 text-black hover:bg-gray-100"
                            }`}
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                )}

                {/* Action Items List */}
                {actionItems.map((item) => (
                  <Card
                    key={item.id}
                    className={`p-3 transition-all duration-300 ${
                      item.extractedFromNote
                        ? isDesktopMode
                          ? "border-l-4 border-l-white bg-black/30 backdrop-blur-sm"
                          : "border-l-4 border-l-black bg-gray-50"
                        : isDesktopMode
                          ? "bg-black/20 border-white/20 backdrop-blur-sm"
                          : "bg-white border-gray-200"
                    }`}
                  >
                    {editingItemId === item.id ? (
                      // Edit Mode
                      <div className="space-y-3">
                        <Input
                          value={editingContent}
                          onChange={(e) => setEditingContent(e.target.value)}
                          className={`text-sm ${
                            isDesktopMode
                              ? "bg-black/20 border-white/20 text-white placeholder:text-white/60"
                              : "bg-white border-gray-300 text-black placeholder:text-gray-500"
                          }`}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              saveEditingItem()
                            } else if (e.key === "Escape") {
                              cancelEditingItem()
                            }
                          }}
                          autoFocus
                        />
                        <div className="flex items-center justify-between">
                          <Select
                            value={editingPriority}
                            onValueChange={(value: "high" | "medium" | "low") => setEditingPriority(value)}
                          >
                            <SelectTrigger
                              className={`w-24 h-8 text-xs ${
                                isDesktopMode
                                  ? "bg-black/20 border-white/20 text-white"
                                  : "bg-white border-gray-300 text-black"
                              }`}
                            >
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="high">High</SelectItem>
                              <SelectItem value="medium">Medium</SelectItem>
                              <SelectItem value="low">Low</SelectItem>
                            </SelectContent>
                          </Select>
                          <div className="flex gap-2">
                            <Button
                              onClick={saveEditingItem}
                              size="sm"
                              className={`h-8 px-3 ${
                                isDesktopMode
                                  ? "bg-white/20 hover:bg-white/30 text-white"
                                  : "bg-black hover:bg-gray-800 text-white"
                              }`}
                            >
                              <Check className="w-3 h-3" />
                            </Button>
                            <Button
                              onClick={cancelEditingItem}
                              size="sm"
                              variant="outline"
                              className={`h-8 px-3 ${
                                isDesktopMode
                                  ? "bg-black/20 border-white/20 text-white hover:bg-black/30"
                                  : "bg-white border-gray-300 text-black hover:bg-gray-100"
                              }`}
                            >
                              <X className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      // View Mode
                      <div className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          checked={item.completed}
                          onChange={() => toggleActionItem(item.id)}
                          className="mt-0.5"
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p
                              className={`text-sm ${
                                item.completed
                                  ? isDesktopMode
                                    ? "line-through text-white/50"
                                    : "line-through text-gray-500"
                                  : isDesktopMode
                                    ? "text-white"
                                    : "text-black"
                              }`}
                            >
                              {item.content}
                            </p>
                            {item.extractedFromNote && (
                              <Brain
                                className={`w-3 h-3 ${isDesktopMode ? "text-white" : "text-black"}`}
                                title="Extracted from note"
                              />
                            )}
                          </div>
                          <Badge
                            variant={item.priority === "high" ? "destructive" : "secondary"}
                            className={`text-xs mt-1 ${
                              isDesktopMode && item.priority !== "high"
                                ? "bg-white/20 text-white border-white/30"
                                : !isDesktopMode && item.priority !== "high"
                                  ? "bg-gray-200 text-black border-gray-300"
                                  : ""
                            }`}
                          >
                            {item.priority}
                          </Badge>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            onClick={() => startEditingItem(item)}
                            size="sm"
                            variant="ghost"
                            className={`h-8 w-8 p-0 ${
                              isDesktopMode ? "hover:bg-white/20 text-white/80" : "hover:bg-gray-100 text-gray-600"
                            }`}
                          >
                            <Edit3 className="w-3 h-3" />
                          </Button>
                          <Button
                            onClick={() => deleteActionItem(item.id)}
                            size="sm"
                            variant="ghost"
                            className={`h-8 w-8 p-0 ${
                              isDesktopMode ? "hover:bg-red-500/20 text-red-400" : "hover:bg-red-100 text-red-600"
                            }`}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </Card>
                ))}

                {actionItems.length === 0 && !isAddingItem && (
                  <div className={`text-center py-8 ${isDesktopMode ? "text-white/60" : "text-gray-500"}`}>
                    <CheckSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No action items yet</p>
                    <p className="text-xs">Save notes with tasks to auto-generate them</p>
                  </div>
                )}
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </div>

      {/* Task Preview Modal */}
      <TaskPreviewModal
        isOpen={showTaskPreview}
        extractedTasks={extractedTasks}
        onConfirm={handleTaskConfirmation}
        onCancel={handleTaskCancellation}
      />
    </>
  )
}
