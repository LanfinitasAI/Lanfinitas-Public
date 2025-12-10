import { useEffect, useRef, useState, useCallback } from 'react'
import { fabric } from 'fabric'

export interface Layer {
  id: string
  name: string
  visible: boolean
  locked: boolean
  object: fabric.Object
}

export interface UseFabricCanvasReturn {
  canvas: fabric.Canvas | null
  layers: Layer[]
  selectedLayer: string | null
  history: fabric.Object[][]
  historyStep: number
  addObject: (object: fabric.Object) => void
  removeObject: (object: fabric.Object) => void
  toggleLayerVisibility: (id: string) => void
  toggleLayerLock: (id: string) => void
  selectLayer: (id: string) => void
  moveLayer: (id: string, direction: 'up' | 'down') => void
  undo: () => void
  redo: () => void
  canUndo: boolean
  canRedo: boolean
  exportToSVG: () => string
  exportToPNG: () => string
  exportToPDF: () => void
  clear: () => void
  setGridEnabled: (enabled: boolean) => void
}

/**
 * Custom hook for managing Fabric.js canvas
 */
export function useFabricCanvas(
  canvasRef: React.RefObject<HTMLCanvasElement>
): UseFabricCanvasReturn {
  const [canvas, setCanvas] = useState<fabric.Canvas | null>(null)
  const [layers, setLayers] = useState<Layer[]>([])
  const [selectedLayer, setSelectedLayer] = useState<string | null>(null)
  const [history, setHistory] = useState<fabric.Object[][]>([[]])
  const [historyStep, setHistoryStep] = useState(0)
  const [gridEnabled, setGridEnabledState] = useState(true)

  // Initialize canvas
  useEffect(() => {
    if (!canvasRef.current) return

    const fabricCanvas = new fabric.Canvas(canvasRef.current, {
      width: 800,
      height: 600,
      backgroundColor: '#ffffff',
      selection: true,
      preserveObjectStacking: true,
    })

    setCanvas(fabricCanvas)

    // Add grid
    if (gridEnabled) {
      addGrid(fabricCanvas)
    }

    // Handle object selection
    fabricCanvas.on('selection:created', (e) => {
      if (e.selected && e.selected.length > 0) {
        const obj = e.selected[0]
        const layer = layers.find((l) => l.object === obj)
        if (layer) {
          setSelectedLayer(layer.id)
        }
      }
    })

    fabricCanvas.on('selection:updated', (e) => {
      if (e.selected && e.selected.length > 0) {
        const obj = e.selected[0]
        const layer = layers.find((l) => l.object === obj)
        if (layer) {
          setSelectedLayer(layer.id)
        }
      }
    })

    fabricCanvas.on('selection:cleared', () => {
      setSelectedLayer(null)
    })

    // Handle object modifications for history
    fabricCanvas.on('object:modified', () => {
      saveHistory(fabricCanvas)
    })

    return () => {
      fabricCanvas.dispose()
    }
  }, [canvasRef])

  // Add grid to canvas
  const addGrid = (canvas: fabric.Canvas) => {
    const gridSize = 20
    const width = canvas.getWidth()
    const height = canvas.getHeight()

    for (let i = 0; i < width / gridSize; i++) {
      canvas.add(
        new fabric.Line([i * gridSize, 0, i * gridSize, height], {
          stroke: '#e5e7eb',
          strokeWidth: 1,
          selectable: false,
          evented: false,
        })
      )
    }

    for (let i = 0; i < height / gridSize; i++) {
      canvas.add(
        new fabric.Line([0, i * gridSize, width, i * gridSize], {
          stroke: '#e5e7eb',
          strokeWidth: 1,
          selectable: false,
          evented: false,
        })
      )
    }
  }

  // Save canvas state to history
  const saveHistory = useCallback(
    (canvas: fabric.Canvas) => {
      const objects = canvas.getObjects().filter((obj) => obj.selectable)
      const newHistory = history.slice(0, historyStep + 1)
      newHistory.push([...objects])
      setHistory(newHistory)
      setHistoryStep(newHistory.length - 1)
    },
    [history, historyStep]
  )

  // Add object to canvas
  const addObject = useCallback(
    (object: fabric.Object) => {
      if (!canvas) return

      canvas.add(object)
      canvas.setActiveObject(object)
      canvas.renderAll()

      // Create layer
      const layer: Layer = {
        id: `layer-${Date.now()}`,
        name: `Layer ${layers.length + 1}`,
        visible: true,
        locked: false,
        object,
      }

      setLayers([...layers, layer])
      setSelectedLayer(layer.id)
      saveHistory(canvas)
    },
    [canvas, layers, saveHistory]
  )

  // Remove object from canvas
  const removeObject = useCallback(
    (object: fabric.Object) => {
      if (!canvas) return

      canvas.remove(object)
      canvas.renderAll()

      setLayers(layers.filter((l) => l.object !== object))
      saveHistory(canvas)
    },
    [canvas, layers, saveHistory]
  )

  // Toggle layer visibility
  const toggleLayerVisibility = useCallback(
    (id: string) => {
      setLayers(
        layers.map((layer) => {
          if (layer.id === id) {
            layer.object.set('visible', !layer.visible)
            canvas?.renderAll()
            return { ...layer, visible: !layer.visible }
          }
          return layer
        })
      )
    },
    [layers, canvas]
  )

  // Toggle layer lock
  const toggleLayerLock = useCallback(
    (id: string) => {
      setLayers(
        layers.map((layer) => {
          if (layer.id === id) {
            layer.object.set('selectable', layer.locked)
            layer.object.set('evented', layer.locked)
            canvas?.renderAll()
            return { ...layer, locked: !layer.locked }
          }
          return layer
        })
      )
    },
    [layers, canvas]
  )

  // Select layer
  const selectLayer = useCallback(
    (id: string) => {
      const layer = layers.find((l) => l.id === id)
      if (layer && canvas) {
        canvas.setActiveObject(layer.object)
        canvas.renderAll()
        setSelectedLayer(id)
      }
    },
    [layers, canvas]
  )

  // Move layer up/down
  const moveLayer = useCallback(
    (id: string, direction: 'up' | 'down') => {
      const index = layers.findIndex((l) => l.id === id)
      if (index === -1) return

      const newLayers = [...layers]
      const targetIndex = direction === 'up' ? index - 1 : index + 1

      if (targetIndex < 0 || targetIndex >= newLayers.length) return

      ;[newLayers[index], newLayers[targetIndex]] = [
        newLayers[targetIndex],
        newLayers[index],
      ]

      setLayers(newLayers)

      // Update z-index in canvas
      if (canvas) {
        const layer = newLayers[targetIndex]
        if (direction === 'up') {
          canvas.bringForward(layer.object)
        } else {
          canvas.sendBackwards(layer.object)
        }
        canvas.renderAll()
      }
    },
    [layers, canvas]
  )

  // Undo
  const undo = useCallback(() => {
    if (historyStep > 0 && canvas) {
      const newStep = historyStep - 1
      const objects = history[newStep]

      canvas.clear()
      if (gridEnabled) {
        addGrid(canvas)
      }

      objects.forEach((obj) => {
        canvas.add(obj)
      })

      canvas.renderAll()
      setHistoryStep(newStep)
    }
  }, [historyStep, history, canvas, gridEnabled])

  // Redo
  const redo = useCallback(() => {
    if (historyStep < history.length - 1 && canvas) {
      const newStep = historyStep + 1
      const objects = history[newStep]

      canvas.clear()
      if (gridEnabled) {
        addGrid(canvas)
      }

      objects.forEach((obj) => {
        canvas.add(obj)
      })

      canvas.renderAll()
      setHistoryStep(newStep)
    }
  }, [historyStep, history, canvas, gridEnabled])

  // Export to SVG
  const exportToSVG = useCallback((): string => {
    if (!canvas) return ''
    return canvas.toSVG()
  }, [canvas])

  // Export to PNG
  const exportToPNG = useCallback((): string => {
    if (!canvas) return ''
    return canvas.toDataURL({
      format: 'png',
      quality: 1,
    })
  }, [canvas])

  // Export to PDF (basic implementation)
  const exportToPDF = useCallback(() => {
    if (!canvas) return

    const dataURL = canvas.toDataURL({
      format: 'png',
      quality: 1,
    })

    // In a real implementation, you would use a library like jsPDF
    // For now, we'll just download the PNG
    const link = document.createElement('a')
    link.href = dataURL
    link.download = 'pattern.png'
    link.click()
  }, [canvas])

  // Clear canvas
  const clear = useCallback(() => {
    if (!canvas) return

    canvas.clear()
    if (gridEnabled) {
      addGrid(canvas)
    }
    canvas.renderAll()

    setLayers([])
    setSelectedLayer(null)
    saveHistory(canvas)
  }, [canvas, gridEnabled, saveHistory])

  // Set grid enabled
  const setGridEnabled = useCallback(
    (enabled: boolean) => {
      setGridEnabledState(enabled)
      if (canvas) {
        canvas.clear()
        if (enabled) {
          addGrid(canvas)
        }
        // Re-add all objects
        layers.forEach((layer) => {
          canvas.add(layer.object)
        })
        canvas.renderAll()
      }
    },
    [canvas, layers]
  )

  return {
    canvas,
    layers,
    selectedLayer,
    history,
    historyStep,
    addObject,
    removeObject,
    toggleLayerVisibility,
    toggleLayerLock,
    selectLayer,
    moveLayer,
    undo,
    redo,
    canUndo: historyStep > 0,
    canRedo: historyStep < history.length - 1,
    exportToSVG,
    exportToPNG,
    exportToPDF,
    clear,
    setGridEnabled,
  }
}
