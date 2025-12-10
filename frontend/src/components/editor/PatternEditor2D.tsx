import { useRef, useEffect, useState } from 'react'
import { fabric } from 'fabric'
import { EditorToolbar, type EditorTool } from './EditorToolbar'
import { LayerPanel } from './LayerPanel'
import { useFabricCanvas } from '@/hooks/useFabricCanvas'

export interface PatternEditor2DProps {
  width?: number
  height?: number
  className?: string
  onExport?: (data: string, format: 'svg' | 'png' | 'pdf') => void
}

export function PatternEditor2D({
  width = 800,
  height = 600,
  className = '',
  onExport,
}: PatternEditor2DProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [activeTool, setActiveTool] = useState<EditorTool>('select')
  const [showGrid, setShowGrid] = useState(true)
  const [isDrawing, setIsDrawing] = useState(false)
  const drawingObjectRef = useRef<fabric.Object | null>(null)
  const startPointRef = useRef<{ x: number; y: number } | null>(null)

  const {
    canvas,
    layers,
    selectedLayer,
    addObject,
    removeObject,
    toggleLayerVisibility,
    toggleLayerLock,
    selectLayer,
    moveLayer,
    undo,
    redo,
    canUndo,
    canRedo,
    exportToSVG,
    exportToPNG,
    exportToPDF,
    clear,
    setGridEnabled,
  } = useFabricCanvas(canvasRef)

  // Handle tool changes
  useEffect(() => {
    if (!canvas) return

    // Reset drawing mode
    canvas.isDrawingMode = false
    canvas.selection = activeTool === 'select'

    // Set cursor based on tool
    const cursorMap: Record<EditorTool, string> = {
      select: 'default',
      rectangle: 'crosshair',
      circle: 'crosshair',
      line: 'crosshair',
      text: 'text',
      measure: 'crosshair',
    }

    canvas.defaultCursor = cursorMap[activeTool]
  }, [activeTool, canvas])

  // Handle mouse events for drawing
  useEffect(() => {
    if (!canvas) return

    const handleMouseDown = (e: fabric.IEvent<MouseEvent>) => {
      if (activeTool === 'select') return

      const pointer = canvas.getPointer(e.e)
      startPointRef.current = pointer
      setIsDrawing(true)

      switch (activeTool) {
        case 'rectangle':
          drawingObjectRef.current = new fabric.Rect({
            left: pointer.x,
            top: pointer.y,
            width: 0,
            height: 0,
            fill: 'transparent',
            stroke: '#6366f1',
            strokeWidth: 2,
          })
          break

        case 'circle':
          drawingObjectRef.current = new fabric.Circle({
            left: pointer.x,
            top: pointer.y,
            radius: 0,
            fill: 'transparent',
            stroke: '#6366f1',
            strokeWidth: 2,
          })
          break

        case 'line':
          drawingObjectRef.current = new fabric.Line(
            [pointer.x, pointer.y, pointer.x, pointer.y],
            {
              stroke: '#6366f1',
              strokeWidth: 2,
            }
          )
          break

        case 'text':
          const text = new fabric.IText('Double click to edit', {
            left: pointer.x,
            top: pointer.y,
            fontSize: 20,
            fill: '#1f2937',
          })
          addObject(text)
          setActiveTool('select')
          return

        case 'measure':
          // Create measurement line with labels
          const measureLine = new fabric.Line(
            [pointer.x, pointer.y, pointer.x, pointer.y],
            {
              stroke: '#ef4444',
              strokeWidth: 2,
              strokeDashArray: [5, 5],
            }
          )
          drawingObjectRef.current = measureLine
          break
      }

      if (drawingObjectRef.current) {
        canvas.add(drawingObjectRef.current)
      }
    }

    const handleMouseMove = (e: fabric.IEvent<MouseEvent>) => {
      if (!isDrawing || !drawingObjectRef.current || !startPointRef.current) return

      const pointer = canvas.getPointer(e.e)
      const obj = drawingObjectRef.current

      switch (activeTool) {
        case 'rectangle':
          if (obj.type === 'rect') {
            const rect = obj as fabric.Rect
            rect.set({
              width: Math.abs(pointer.x - startPointRef.current.x),
              height: Math.abs(pointer.y - startPointRef.current.y),
            })

            if (pointer.x < startPointRef.current.x) {
              rect.set({ left: pointer.x })
            }
            if (pointer.y < startPointRef.current.y) {
              rect.set({ top: pointer.y })
            }
          }
          break

        case 'circle':
          if (obj.type === 'circle') {
            const circle = obj as fabric.Circle
            const radius = Math.sqrt(
              Math.pow(pointer.x - startPointRef.current.x, 2) +
                Math.pow(pointer.y - startPointRef.current.y, 2)
            )
            circle.set({ radius })
          }
          break

        case 'line':
        case 'measure':
          if (obj.type === 'line') {
            const line = obj as fabric.Line
            line.set({
              x2: pointer.x,
              y2: pointer.y,
            })
          }
          break
      }

      canvas.renderAll()
    }

    const handleMouseUp = () => {
      if (isDrawing && drawingObjectRef.current) {
        // Don't add objects that are too small
        const obj = drawingObjectRef.current
        let shouldAdd = true

        if (obj.type === 'rect') {
          const rect = obj as fabric.Rect
          shouldAdd = (rect.width || 0) > 5 && (rect.height || 0) > 5
        } else if (obj.type === 'circle') {
          const circle = obj as fabric.Circle
          shouldAdd = (circle.radius || 0) > 5
        } else if (obj.type === 'line') {
          const line = obj as fabric.Line
          const dx = (line.x2 || 0) - (line.x1 || 0)
          const dy = (line.y2 || 0) - (line.y1 || 0)
          shouldAdd = Math.sqrt(dx * dx + dy * dy) > 5
        }

        if (shouldAdd) {
          // Object already added to canvas in mouseDown, just finalize it
          canvas.setActiveObject(obj)
          canvas.renderAll()
        } else {
          // Remove tiny objects
          canvas.remove(obj)
        }
      }

      setIsDrawing(false)
      drawingObjectRef.current = null
      startPointRef.current = null
    }

    canvas.on('mouse:down', handleMouseDown)
    canvas.on('mouse:move', handleMouseMove)
    canvas.on('mouse:up', handleMouseUp)

    return () => {
      canvas.off('mouse:down', handleMouseDown)
      canvas.off('mouse:move', handleMouseMove)
      canvas.off('mouse:up', handleMouseUp)
    }
  }, [canvas, activeTool, isDrawing, addObject])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMod = e.ctrlKey || e.metaKey

      // Tool shortcuts
      if (!isMod && !e.shiftKey) {
        switch (e.key.toLowerCase()) {
          case 'v':
            setActiveTool('select')
            break
          case 'r':
            setActiveTool('rectangle')
            break
          case 'c':
            setActiveTool('circle')
            break
          case 'l':
            setActiveTool('line')
            break
          case 't':
            setActiveTool('text')
            break
          case 'm':
            setActiveTool('measure')
            break
          case 'g':
            handleToggleGrid()
            break
        }
      }

      // Undo/Redo
      if (isMod && e.key === 'z') {
        e.preventDefault()
        if (e.shiftKey) {
          redo()
        } else {
          undo()
        }
      }

      // Delete
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (canvas && canvas.getActiveObject()) {
          const obj = canvas.getActiveObject()
          if (obj) {
            removeObject(obj)
          }
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [canvas, undo, redo, removeObject])

  const handleExport = (format: 'svg' | 'png' | 'pdf') => {
    let data = ''

    switch (format) {
      case 'svg':
        data = exportToSVG()
        // Download SVG
        const svgBlob = new Blob([data], { type: 'image/svg+xml' })
        const svgUrl = URL.createObjectURL(svgBlob)
        const svgLink = document.createElement('a')
        svgLink.href = svgUrl
        svgLink.download = 'pattern.svg'
        svgLink.click()
        URL.revokeObjectURL(svgUrl)
        break

      case 'png':
        data = exportToPNG()
        // Download PNG
        const pngLink = document.createElement('a')
        pngLink.href = data
        pngLink.download = 'pattern.png'
        pngLink.click()
        break

      case 'pdf':
        exportToPDF()
        break
    }

    onExport?.(data, format)
  }

  const handleClear = () => {
    if (confirm('Are you sure you want to clear the canvas?')) {
      clear()
    }
  }

  const handleToggleGrid = () => {
    const newShowGrid = !showGrid
    setShowGrid(newShowGrid)
    setGridEnabled(newShowGrid)
  }

  const handleDeleteLayer = (id: string) => {
    const layer = layers.find((l) => l.id === id)
    if (layer) {
      removeObject(layer.object)
    }
  }

  return (
    <div className={`flex h-full flex-col gap-4 ${className}`}>
      {/* Toolbar */}
      <EditorToolbar
        activeTool={activeTool}
        onToolChange={setActiveTool}
        onUndo={undo}
        onRedo={redo}
        onExport={handleExport}
        onClear={handleClear}
        onToggleGrid={handleToggleGrid}
        canUndo={canUndo}
        canRedo={canRedo}
        showGrid={showGrid}
      />

      {/* Main Content */}
      <div className="flex flex-1 gap-4 overflow-hidden">
        {/* Canvas */}
        <div className="flex-1 overflow-hidden rounded-lg border bg-white shadow-sm">
          <div className="flex h-full items-center justify-center">
            <canvas ref={canvasRef} width={width} height={height} />
          </div>
        </div>

        {/* Layer Panel */}
        <div className="w-80 flex-shrink-0">
          <LayerPanel
            layers={layers}
            selectedLayer={selectedLayer}
            onSelectLayer={selectLayer}
            onToggleVisibility={toggleLayerVisibility}
            onToggleLock={toggleLayerLock}
            onMoveLayer={moveLayer}
            onDeleteLayer={handleDeleteLayer}
          />
        </div>
      </div>
    </div>
  )
}
