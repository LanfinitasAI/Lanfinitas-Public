import { useEffect, useRef, useState } from 'react'
import { fabric } from 'fabric'
import { ZoomIn, ZoomOut, Move } from 'lucide-react'
import { Button } from '@/components/ui/button'

export type AnnotationType = 'keypoint' | 'seam' | 'grainline' | 'region' | 'none'

export interface Annotation {
  id: string
  type: AnnotationType
  points: { x: number; y: number }[]
  label?: string
  visible: boolean
  color: string
}

interface ImageCanvasProps {
  imageUrl?: string
  activeTool: AnnotationType
  annotations: Annotation[]
  onAnnotationAdd: (annotation: Annotation) => void
  onAnnotationUpdate: (id: string, annotation: Annotation) => void
  selectedAnnotation?: string | null
}

export function ImageCanvas({
  imageUrl,
  activeTool,
  annotations,
  onAnnotationAdd,
  onAnnotationUpdate,
  selectedAnnotation,
}: ImageCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fabricCanvasRef = useRef<fabric.Canvas | null>(null)
  const [zoom, setZoom] = useState(1)
  const [isPanning, setIsPanning] = useState(false)
  const [coordinates, setCoordinates] = useState({ x: 0, y: 0 })
  const tempObjectsRef = useRef<fabric.Object[]>([])
  const drawingPointsRef = useRef<{ x: number; y: number }[]>([])

  // Initialize Fabric.js canvas
  useEffect(() => {
    if (!canvasRef.current) return

    const canvas = new fabric.Canvas(canvasRef.current, {
      width: 800,
      height: 600,
      backgroundColor: '#f3f4f6',
      selection: false,
    })

    fabricCanvasRef.current = canvas

    // Handle mouse move for coordinates
    canvas.on('mouse:move', (e) => {
      const pointer = canvas.getPointer(e.e)
      setCoordinates({ x: Math.round(pointer.x), y: Math.round(pointer.y) })
    })

    // Handle mouse down for drawing
    canvas.on('mouse:down', (e) => {
      if (isPanning) return

      const pointer = canvas.getPointer(e.e)
      const point = { x: pointer.x, y: pointer.y }

      switch (activeTool) {
        case 'keypoint':
          handleKeypointAdd(point)
          break
        case 'seam':
          handleSeamAdd(point)
          break
        case 'grainline':
          handleGrainlineAdd(point)
          break
        case 'region':
          handleRegionAdd(point)
          break
      }
    })

    // Handle resize
    const handleResize = () => {
      const container = canvasRef.current?.parentElement
      if (container) {
        canvas.setDimensions({
          width: container.clientWidth,
          height: container.clientHeight,
        })
        canvas.renderAll()
      }
    }

    window.addEventListener('resize', handleResize)
    handleResize()

    return () => {
      window.removeEventListener('resize', handleResize)
      canvas.dispose()
    }
  }, [])

  // Load image when imageUrl changes
  useEffect(() => {
    if (!fabricCanvasRef.current || !imageUrl) return

    const canvas = fabricCanvasRef.current

    fabric.Image.fromURL(imageUrl, (img) => {
      // Clear existing objects
      canvas.clear()
      canvas.setBackgroundColor('#f3f4f6', () => {})

      // Scale image to fit canvas
      const canvasWidth = canvas.getWidth()
      const canvasHeight = canvas.getHeight()
      const imgWidth = img.width || 1
      const imgHeight = img.height || 1

      const scale = Math.min(
        (canvasWidth * 0.9) / imgWidth,
        (canvasHeight * 0.9) / imgHeight
      )

      img.scale(scale)
      img.set({
        left: (canvasWidth - imgWidth * scale) / 2,
        top: (canvasHeight - imgHeight * scale) / 2,
        selectable: false,
        evented: false,
      })

      canvas.setBackgroundImage(img, canvas.renderAll.bind(canvas))
    })
  }, [imageUrl])

  // Render annotations
  useEffect(() => {
    if (!fabricCanvasRef.current) return

    const canvas = fabricCanvasRef.current

    // Remove existing annotation objects (not background image)
    const objects = canvas.getObjects()
    objects.forEach((obj) => {
      if (obj.data?.isAnnotation) {
        canvas.remove(obj)
      }
    })

    // Render all annotations
    annotations.forEach((annotation) => {
      if (!annotation.visible) return

      switch (annotation.type) {
        case 'keypoint':
          renderKeypoint(annotation)
          break
        case 'seam':
          renderSeam(annotation)
          break
        case 'grainline':
          renderGrainline(annotation)
          break
        case 'region':
          renderRegion(annotation)
          break
      }
    })

    canvas.renderAll()
  }, [annotations])

  const handleKeypointAdd = (point: { x: number; y: number }) => {
    const annotation: Annotation = {
      id: `keypoint-${Date.now()}`,
      type: 'keypoint',
      points: [point],
      visible: true,
      color: '#3b82f6',
    }
    onAnnotationAdd(annotation)
  }

  const handleSeamAdd = (point: { x: number; y: number }) => {
    drawingPointsRef.current.push(point)

    if (drawingPointsRef.current.length === 2) {
      const annotation: Annotation = {
        id: `seam-${Date.now()}`,
        type: 'seam',
        points: [...drawingPointsRef.current],
        visible: true,
        color: '#10b981',
      }
      onAnnotationAdd(annotation)
      drawingPointsRef.current = []
    } else {
      // Show temporary point
      const tempCircle = new fabric.Circle({
        left: point.x - 3,
        top: point.y - 3,
        radius: 3,
        fill: '#10b981',
        selectable: false,
      })
      fabricCanvasRef.current?.add(tempCircle)
      tempObjectsRef.current.push(tempCircle)
    }
  }

  const handleGrainlineAdd = (point: { x: number; y: number }) => {
    drawingPointsRef.current.push(point)

    if (drawingPointsRef.current.length === 2) {
      const annotation: Annotation = {
        id: `grainline-${Date.now()}`,
        type: 'grainline',
        points: [...drawingPointsRef.current],
        visible: true,
        color: '#f59e0b',
      }
      onAnnotationAdd(annotation)
      drawingPointsRef.current = []
      tempObjectsRef.current.forEach((obj) => fabricCanvasRef.current?.remove(obj))
      tempObjectsRef.current = []
    } else {
      // Show temporary point
      const tempCircle = new fabric.Circle({
        left: point.x - 3,
        top: point.y - 3,
        radius: 3,
        fill: '#f59e0b',
        selectable: false,
      })
      fabricCanvasRef.current?.add(tempCircle)
      tempObjectsRef.current.push(tempCircle)
    }
  }

  const handleRegionAdd = (point: { x: number; y: number }) => {
    drawingPointsRef.current.push(point)

    // Show temporary point
    const tempCircle = new fabric.Circle({
      left: point.x - 3,
      top: point.y - 3,
      radius: 3,
      fill: '#8b5cf6',
      selectable: false,
    })
    fabricCanvasRef.current?.add(tempCircle)
    tempObjectsRef.current.push(tempCircle)

    // Show temporary lines
    if (drawingPointsRef.current.length > 1) {
      const prevPoint = drawingPointsRef.current[drawingPointsRef.current.length - 2]
      const tempLine = new fabric.Line(
        [prevPoint.x, prevPoint.y, point.x, point.y],
        {
          stroke: '#8b5cf6',
          strokeWidth: 2,
          selectable: false,
        }
      )
      fabricCanvasRef.current?.add(tempLine)
      tempObjectsRef.current.push(tempLine)
    }
  }

  const renderKeypoint = (annotation: Annotation) => {
    if (annotation.points.length === 0) return

    const point = annotation.points[0]
    const circle = new fabric.Circle({
      left: point.x - 5,
      top: point.y - 5,
      radius: 5,
      fill: annotation.color,
      stroke: '#fff',
      strokeWidth: 2,
      selectable: false,
      data: { isAnnotation: true, id: annotation.id },
    })

    fabricCanvasRef.current?.add(circle)
  }

  const renderSeam = (annotation: Annotation) => {
    if (annotation.points.length < 2) return

    const [start, end] = annotation.points
    const line = new fabric.Line([start.x, start.y, end.x, end.y], {
      stroke: annotation.color,
      strokeWidth: 3,
      selectable: false,
      data: { isAnnotation: true, id: annotation.id },
    })

    fabricCanvasRef.current?.add(line)
  }

  const renderGrainline = (annotation: Annotation) => {
    if (annotation.points.length < 2) return

    const [start, end] = annotation.points

    // Draw line
    const line = new fabric.Line([start.x, start.y, end.x, end.y], {
      stroke: annotation.color,
      strokeWidth: 2,
      selectable: false,
      data: { isAnnotation: true, id: annotation.id },
    })

    // Draw arrow head
    const angle = Math.atan2(end.y - start.y, end.x - start.x)
    const headLength = 15

    const arrowHead = new fabric.Triangle({
      left: end.x,
      top: end.y,
      width: headLength,
      height: headLength,
      fill: annotation.color,
      selectable: false,
      angle: (angle * 180) / Math.PI + 90,
      originX: 'center',
      originY: 'center',
      data: { isAnnotation: true, id: annotation.id },
    })

    fabricCanvasRef.current?.add(line, arrowHead)
  }

  const renderRegion = (annotation: Annotation) => {
    if (annotation.points.length < 3) return

    const points = annotation.points.map((p) => new fabric.Point(p.x, p.y))
    const polygon = new fabric.Polygon(points, {
      fill: `${annotation.color}30`,
      stroke: annotation.color,
      strokeWidth: 2,
      selectable: false,
      data: { isAnnotation: true, id: annotation.id },
    })

    fabricCanvasRef.current?.add(polygon)
  }

  const handleZoomIn = () => {
    const newZoom = Math.min(zoom * 1.2, 5)
    setZoom(newZoom)
    fabricCanvasRef.current?.setZoom(newZoom)
    fabricCanvasRef.current?.renderAll()
  }

  const handleZoomOut = () => {
    const newZoom = Math.max(zoom / 1.2, 0.1)
    setZoom(newZoom)
    fabricCanvasRef.current?.setZoom(newZoom)
    fabricCanvasRef.current?.renderAll()
  }

  const handleResetZoom = () => {
    setZoom(1)
    fabricCanvasRef.current?.setZoom(1)
    fabricCanvasRef.current?.setViewportTransform([1, 0, 0, 1, 0, 0])
    fabricCanvasRef.current?.renderAll()
  }

  const completeRegion = () => {
    if (drawingPointsRef.current.length >= 3) {
      const annotation: Annotation = {
        id: `region-${Date.now()}`,
        type: 'region',
        points: [...drawingPointsRef.current],
        visible: true,
        color: '#8b5cf6',
      }
      onAnnotationAdd(annotation)
    }
    drawingPointsRef.current = []
    tempObjectsRef.current.forEach((obj) => fabricCanvasRef.current?.remove(obj))
    tempObjectsRef.current = []
  }

  const cancelDrawing = () => {
    drawingPointsRef.current = []
    tempObjectsRef.current.forEach((obj) => fabricCanvasRef.current?.remove(obj))
    tempObjectsRef.current = []
  }

  return (
    <div className="flex h-full flex-col">
      {/* Toolbar */}
      <div className="flex items-center justify-between border-b bg-white px-4 py-2">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleZoomIn}
            title="Zoom In (Ctrl/Cmd +)"
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleZoomOut}
            title="Zoom Out (Ctrl/Cmd -)"
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleResetZoom}
            title="Reset Zoom (Ctrl/Cmd 0)"
          >
            Reset
          </Button>
          <span className="ml-2 text-sm text-slate-600">
            Zoom: {Math.round(zoom * 100)}%
          </span>
        </div>

        <div className="flex items-center gap-4">
          {activeTool === 'region' && drawingPointsRef.current.length >= 3 && (
            <>
              <Button size="sm" onClick={completeRegion}>
                Complete Region
              </Button>
              <Button variant="outline" size="sm" onClick={cancelDrawing}>
                Cancel
              </Button>
            </>
          )}
          <span className="text-sm text-slate-600">
            X: {coordinates.x}, Y: {coordinates.y}
          </span>
        </div>
      </div>

      {/* Canvas */}
      <div className="relative flex-1">
        <canvas ref={canvasRef} className="absolute inset-0" />
        {!imageUrl && (
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-slate-400">Upload an image to start annotating</p>
          </div>
        )}
      </div>
    </div>
  )
}
