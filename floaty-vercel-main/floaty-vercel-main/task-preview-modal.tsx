"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"
import { CheckSquare, Brain, Target, AlertCircle, Info } from "lucide-react"
import type { ExtractedTask } from "./task-extractor"

interface TaskPreviewModalProps {
  isOpen: boolean
  extractedTasks: ExtractedTask[]
  onConfirm: (selectedTasks: ExtractedTask[]) => void
  onCancel: () => void
}

export function TaskPreviewModal({ isOpen, extractedTasks, onConfirm, onCancel }: TaskPreviewModalProps) {
  const [selectedTasks, setSelectedTasks] = useState<Set<string>>(
    new Set(extractedTasks.filter((task) => task.confidence > 0.7).map((task) => task.id)),
  )
  const [taskPriorities, setTaskPriorities] = useState<Record<string, "high" | "medium" | "low">>(
    Object.fromEntries(extractedTasks.map((task) => [task.id, task.priority])),
  )

  if (!isOpen || extractedTasks.length === 0) return null

  const handleTaskToggle = (taskId: string, checked: boolean) => {
    const newSelected = new Set(selectedTasks)
    if (checked) {
      newSelected.add(taskId)
    } else {
      newSelected.delete(taskId)
    }
    setSelectedTasks(newSelected)
  }

  const handlePriorityChange = (taskId: string, priority: "high" | "medium" | "low") => {
    setTaskPriorities((prev) => ({ ...prev, [taskId]: priority }))
  }

  const handleConfirm = () => {
    const tasksToAdd = extractedTasks
      .filter((task) => selectedTasks.has(task.id))
      .map((task) => ({ ...task, priority: taskPriorities[task.id] }))
    onConfirm(tasksToAdd)
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return "text-black"
    if (confidence >= 0.6) return "text-gray-600"
    return "text-gray-400"
  }

  const getConfidenceIcon = (confidence: number) => {
    if (confidence >= 0.8) return <CheckSquare className="w-4 h-4 text-black" />
    if (confidence >= 0.6) return <AlertCircle className="w-4 h-4 text-gray-600" />
    return <Info className="w-4 h-4 text-gray-400" />
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[80vh] bg-white border-2 border-gray-300">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-gray-100 rounded-lg border border-gray-300">
              <Brain className="w-6 h-6 text-black" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-black">Smart Task Detection</h2>
              <p className="text-sm text-gray-600">
                Found {extractedTasks.length} potential action item{extractedTasks.length !== 1 ? "s" : ""} in your note
              </p>
            </div>
          </div>

          {/* Task List */}
          <ScrollArea className="max-h-96 mb-6">
            <div className="space-y-4">
              {extractedTasks.map((task, index) => (
                <Card key={task.id} className="p-4 border-l-4 border-l-gray-400 bg-gray-50">
                  <div className="flex items-start gap-3">
                    <Checkbox
                      checked={selectedTasks.has(task.id)}
                      onCheckedChange={(checked) => handleTaskToggle(task.id, checked as boolean)}
                      className="mt-1"
                    />

                    <div className="flex-1 space-y-3">
                      {/* Task Content */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <p className="font-medium text-black">{task.content}</p>
                          <p className="text-sm text-gray-600 mt-1">
                            <span className="font-medium">Context:</span> {task.context}
                          </p>
                        </div>

                        {/* Confidence Indicator */}
                        <div className="flex items-center gap-2">
                          {getConfidenceIcon(task.confidence)}
                          <span className={`text-xs font-medium ${getConfidenceColor(task.confidence)}`}>
                            {Math.round(task.confidence * 100)}%
                          </span>
                        </div>
                      </div>

                      {/* Priority Selector */}
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-gray-600">Priority:</span>
                        <Select
                          value={taskPriorities[task.id]}
                          onValueChange={(value: "high" | "medium" | "low") => handlePriorityChange(task.id, value)}
                        >
                          <SelectTrigger className="w-24 h-8 text-xs bg-white border-gray-300">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="high">High</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="low">Low</SelectItem>
                          </SelectContent>
                        </Select>

                        <Badge variant="outline" className="text-xs bg-gray-100 text-black border-gray-300">
                          {task.originalText.length > 50
                            ? `${task.originalText.substring(0, 50)}...`
                            : task.originalText}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </ScrollArea>

          <Separator className="mb-6 bg-gray-200" />

          {/* Summary */}
          <div className="bg-gray-50 p-4 rounded-lg mb-6 border border-gray-200">
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-4 h-4 text-black" />
              <span className="text-sm font-medium text-black">Summary</span>
            </div>
            <p className="text-sm text-gray-700">
              {selectedTasks.size} of {extractedTasks.length} tasks selected for addition to Action Items. Tasks marked
              with 🎯 in your saved note indicate extracted action items.
            </p>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={onCancel}
              className="bg-white border-gray-300 text-black hover:bg-gray-100"
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={selectedTasks.size === 0}
              className="bg-black hover:bg-gray-800 text-white"
            >
              Add {selectedTasks.size} Task{selectedTasks.size !== 1 ? "s" : ""} to Action Items
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}
