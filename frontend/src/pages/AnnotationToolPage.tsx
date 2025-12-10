import { useState, useEffect, useCallback } from 'react'
import { Save, Download, FileJson } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  ImageCanvas,
  ToolPanel,
  AnnotationList,
  ExportDialog,
  type AnnotationType,
  type Annotation,
} from '@/components/annotate'

const AUTOSAVE_KEY = 'lanfinitas-annotations-autosave'
const AUTOSAVE_INTERVAL = 30000 // 30 seconds

export function AnnotationToolPage() {
  const [activeTool, setActiveTool] = useState<AnnotationType>('keypoint')
  const [annotations, setAnnotations] = useState<Annotation[]>([])
  const [history, setHistory] = useState<Annotation[][]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  const [selectedAnnotation, setSelectedAnnotation] = useState<string | null>(null)
  const [imageUrl, setImageUrl] = useState<string | undefined>()
  const [imageName, setImageName] = useState('annotation')
  const [imageSize, setImageSize] = useState({ width: 800, height: 600 })
  const [exportDialogOpen, setExportDialogOpen] = useState(false)

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(AUTOSAVE_KEY)
    if (saved) {
      try {
        const data = JSON.parse(saved)
        if (data.annotations) {
          setAnnotations(data.annotations)
          setHistory([data.annotations])
          setHistoryIndex(0)
        }
        if (data.imageUrl) setImageUrl(data.imageUrl)
        if (data.imageName) setImageName(data.imageName)
        if (data.imageSize) setImageSize(data.imageSize)
      } catch (error) {
        console.error('Failed to load autosave:', error)
      }
    }
  }, [])

  // Auto-save to localStorage
  useEffect(() => {
    const interval = setInterval(() => {
      if (annotations.length > 0 || imageUrl) {
        const data = {
          annotations,
          imageUrl,
          imageName,
          imageSize,
          savedAt: new Date().toISOString(),
        }
        localStorage.setItem(AUTOSAVE_KEY, JSON.stringify(data))
      }
    }, AUTOSAVE_INTERVAL)

    return () => clearInterval(interval)
  }, [annotations, imageUrl, imageName, imageSize])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check for modifier keys
      const isMod = e.ctrlKey || e.metaKey

      // Undo: Ctrl/Cmd + Z
      if (isMod && e.key === 'z' && !e.shiftKey) {
        e.preventDefault()
        handleUndo()
      }

      // Redo: Ctrl/Cmd + Shift + Z
      if (isMod && e.key === 'z' && e.shiftKey) {
        e.preventDefault()
        handleRedo()
      }

      // Save: Ctrl/Cmd + S
      if (isMod && e.key === 's') {
        e.preventDefault()
        handleManualSave()
      }

      // Tool shortcuts (without modifiers)
      if (!isMod && !e.shiftKey && !e.altKey) {
        switch (e.key.toLowerCase()) {
          case 'k':
            setActiveTool('keypoint')
            break
          case 's':
            setActiveTool('seam')
            break
          case 'g':
            setActiveTool('grainline')
            break
          case 'r':
            setActiveTool('region')
            break
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [historyIndex, history])

  const addToHistory = (newAnnotations: Annotation[]) => {
    // Remove any history after current index
    const newHistory = history.slice(0, historyIndex + 1)
    newHistory.push(newAnnotations)
    setHistory(newHistory)
    setHistoryIndex(newHistory.length - 1)
  }

  const handleAnnotationAdd = useCallback((annotation: Annotation) => {
    setAnnotations((prev) => {
      const updated = [...prev, annotation]
      addToHistory(updated)
      return updated
    })
  }, [historyIndex, history])

  const handleAnnotationUpdate = useCallback((id: string, annotation: Annotation) => {
    setAnnotations((prev) => {
      const updated = prev.map((a) => (a.id === id ? annotation : a))
      addToHistory(updated)
      return updated
    })
  }, [historyIndex, history])

  const handleToggleVisibility = (id: string) => {
    setAnnotations((prev) => {
      const updated = prev.map((a) =>
        a.id === id ? { ...a, visible: !a.visible } : a
      )
      addToHistory(updated)
      return updated
    })
  }

  const handleDelete = (id: string) => {
    setAnnotations((prev) => {
      const updated = prev.filter((a) => a.id !== id)
      addToHistory(updated)
      return updated
    })
    if (selectedAnnotation === id) {
      setSelectedAnnotation(null)
    }
  }

  const handleUndo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1
      setHistoryIndex(newIndex)
      setAnnotations(history[newIndex])
    }
  }

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1
      setHistoryIndex(newIndex)
      setAnnotations(history[newIndex])
    }
  }

  const handleImageUpload = (file: File) => {
    const url = URL.createObjectURL(file)
    setImageUrl(url)
    setImageName(file.name.replace(/\.[^/.]+$/, ''))

    // Get image dimensions
    const img = new Image()
    img.onload = () => {
      setImageSize({ width: img.width, height: img.height })
    }
    img.src = url
  }

  const handleManualSave = () => {
    const data = {
      annotations,
      imageUrl,
      imageName,
      imageSize,
      savedAt: new Date().toISOString(),
    }
    localStorage.setItem(AUTOSAVE_KEY, JSON.stringify(data))

    // Show feedback (you could add a toast here)
    console.log('Annotations saved!')
  }

  const canUndo = historyIndex > 0
  const canRedo = historyIndex < history.length - 1

  return (
    <div className="flex h-screen flex-col bg-slate-50">
      {/* Header */}
      <header className="border-b bg-white px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Annotation Tool
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              Annotate fashion patterns with keypoints, seams, grainlines, and regions
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={handleManualSave}
              title="Save (Ctrl/Cmd + S)"
            >
              <Save className="mr-2 h-4 w-4" />
              Save
            </Button>
            <Button onClick={() => setExportDialogOpen(true)}>
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-1 gap-4 overflow-hidden p-4">
        {/* Left Sidebar - Tools */}
        <div className="w-64 flex-shrink-0">
          <ToolPanel
            activeTool={activeTool}
            onToolChange={setActiveTool}
            onUndo={handleUndo}
            onRedo={handleRedo}
            canUndo={canUndo}
            canRedo={canRedo}
            onImageUpload={handleImageUpload}
          />
        </div>

        {/* Center - Canvas */}
        <div className="flex-1 overflow-hidden rounded-lg border bg-white shadow-sm">
          <ImageCanvas
            imageUrl={imageUrl}
            activeTool={activeTool}
            annotations={annotations}
            onAnnotationAdd={handleAnnotationAdd}
            onAnnotationUpdate={handleAnnotationUpdate}
            selectedAnnotation={selectedAnnotation}
          />
        </div>

        {/* Right Sidebar - Annotations List */}
        <div className="w-80 flex-shrink-0">
          <AnnotationList
            annotations={annotations}
            selectedAnnotation={selectedAnnotation}
            onSelect={setSelectedAnnotation}
            onToggleVisibility={handleToggleVisibility}
            onDelete={handleDelete}
          />
        </div>
      </div>

      {/* Export Dialog */}
      <ExportDialog
        open={exportDialogOpen}
        onOpenChange={setExportDialogOpen}
        annotations={annotations}
        imageName={imageName}
        imageWidth={imageSize.width}
        imageHeight={imageSize.height}
      />

      {/* Auto-save indicator */}
      <div className="fixed bottom-4 right-4 text-xs text-slate-500">
        Auto-save enabled • Last saved: {new Date().toLocaleTimeString()}
      </div>
    </div>
  )
}
