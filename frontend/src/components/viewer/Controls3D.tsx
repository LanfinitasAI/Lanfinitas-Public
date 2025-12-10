import {
  RotateCcw,
  Camera,
  Maximize2,
  Minimize2,
  ZoomIn,
  ZoomOut,
  Grid3x3,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

export interface Controls3DProps {
  onReset?: () => void
  onScreenshot?: () => void
  onToggleFullscreen?: () => void
  onToggleGrid?: () => void
  onZoomIn?: () => void
  onZoomOut?: () => void
  isFullscreen?: boolean
  showGrid?: boolean
}

export function Controls3D({
  onReset,
  onScreenshot,
  onToggleFullscreen,
  onToggleGrid,
  onZoomIn,
  onZoomOut,
  isFullscreen = false,
  showGrid = true,
}: Controls3DProps) {
  return (
    <Card className="absolute right-4 top-4 z-10 p-2">
      <div className="flex flex-col gap-2">
        {/* Reset View */}
        {onReset && (
          <Button
            variant="outline"
            size="sm"
            onClick={onReset}
            title="Reset Camera (R)"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
        )}

        {/* Zoom In */}
        {onZoomIn && (
          <Button
            variant="outline"
            size="sm"
            onClick={onZoomIn}
            title="Zoom In (+)"
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
        )}

        {/* Zoom Out */}
        {onZoomOut && (
          <Button
            variant="outline"
            size="sm"
            onClick={onZoomOut}
            title="Zoom Out (-)"
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
        )}

        {/* Toggle Grid */}
        {onToggleGrid && (
          <Button
            variant={showGrid ? 'default' : 'outline'}
            size="sm"
            onClick={onToggleGrid}
            title="Toggle Grid (G)"
          >
            <Grid3x3 className="h-4 w-4" />
          </Button>
        )}

        {/* Screenshot */}
        {onScreenshot && (
          <Button
            variant="outline"
            size="sm"
            onClick={onScreenshot}
            title="Take Screenshot (S)"
          >
            <Camera className="h-4 w-4" />
          </Button>
        )}

        {/* Fullscreen */}
        {onToggleFullscreen && (
          <Button
            variant="outline"
            size="sm"
            onClick={onToggleFullscreen}
            title="Toggle Fullscreen (F)"
          >
            {isFullscreen ? (
              <Minimize2 className="h-4 w-4" />
            ) : (
              <Maximize2 className="h-4 w-4" />
            )}
          </Button>
        )}
      </div>
    </Card>
  )
}
