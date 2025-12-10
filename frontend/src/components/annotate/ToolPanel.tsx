import { Circle, Minus, ArrowRight, Pentagon, Undo2, Redo2, Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import type { AnnotationType } from './ImageCanvas'

interface Tool {
  id: AnnotationType
  name: string
  icon: React.ComponentType<{ className?: string }>
  description: string
  shortcut: string
}

const tools: Tool[] = [
  {
    id: 'keypoint',
    name: 'Keypoint',
    icon: Circle,
    description: 'Add keypoint markers',
    shortcut: 'K',
  },
  {
    id: 'seam',
    name: 'Seam',
    icon: Minus,
    description: 'Draw seam lines',
    shortcut: 'S',
  },
  {
    id: 'grainline',
    name: 'Grainline',
    icon: ArrowRight,
    description: 'Mark fabric grain direction',
    shortcut: 'G',
  },
  {
    id: 'region',
    name: 'Region',
    icon: Pentagon,
    description: 'Draw polygon regions',
    shortcut: 'R',
  },
]

interface ToolPanelProps {
  activeTool: AnnotationType
  onToolChange: (tool: AnnotationType) => void
  onUndo: () => void
  onRedo: () => void
  canUndo: boolean
  canRedo: boolean
  onImageUpload: (file: File) => void
}

export function ToolPanel({
  activeTool,
  onToolChange,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  onImageUpload,
}: ToolPanelProps) {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && file.type.startsWith('image/')) {
      onImageUpload(file)
    }
  }

  return (
    <Card className="flex h-full flex-col p-4">
      {/* Image Upload */}
      <div className="mb-6">
        <h3 className="mb-3 text-sm font-semibold text-slate-700">Image</h3>
        <label className="block">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
          <Button variant="outline" className="w-full" asChild>
            <span className="cursor-pointer">
              <Upload className="mr-2 h-4 w-4" />
              Upload Image
            </span>
          </Button>
        </label>
      </div>

      {/* Annotation Tools */}
      <div className="mb-6 flex-1">
        <h3 className="mb-3 text-sm font-semibold text-slate-700">
          Annotation Tools
        </h3>
        <div className="space-y-2">
          {tools.map((tool) => {
            const Icon = tool.icon
            const isActive = activeTool === tool.id

            return (
              <button
                key={tool.id}
                onClick={() => onToolChange(tool.id)}
                className={`
                  flex w-full items-start gap-3 rounded-lg border-2 p-3 text-left transition-all
                  ${
                    isActive
                      ? 'border-indigo-500 bg-indigo-50'
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                  }
                `}
                title={`${tool.description} (${tool.shortcut})`}
              >
                <div
                  className={`
                    rounded p-1.5
                    ${isActive ? 'bg-indigo-500 text-white' : 'bg-slate-100 text-slate-600'}
                  `}
                >
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium text-slate-900">
                      {tool.name}
                    </h4>
                    <span className="text-xs text-slate-500">{tool.shortcut}</span>
                  </div>
                  <p className="mt-0.5 text-xs text-slate-600">
                    {tool.description}
                  </p>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Actions */}
      <div className="space-y-3 border-t pt-4">
        <h3 className="text-sm font-semibold text-slate-700">Actions</h3>

        {/* Undo/Redo */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onUndo}
            disabled={!canUndo}
            className="flex-1"
            title="Undo (Ctrl/Cmd + Z)"
          >
            <Undo2 className="mr-2 h-4 w-4" />
            Undo
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onRedo}
            disabled={!canRedo}
            className="flex-1"
            title="Redo (Ctrl/Cmd + Shift + Z)"
          >
            <Redo2 className="mr-2 h-4 w-4" />
            Redo
          </Button>
        </div>
      </div>

      {/* Keyboard Shortcuts Help */}
      <div className="mt-4 rounded-lg bg-slate-50 p-3">
        <h4 className="mb-2 text-xs font-semibold text-slate-700">
          Keyboard Shortcuts
        </h4>
        <div className="space-y-1 text-xs text-slate-600">
          <div className="flex justify-between">
            <span>Undo</span>
            <span className="font-mono">Ctrl+Z</span>
          </div>
          <div className="flex justify-between">
            <span>Redo</span>
            <span className="font-mono">Ctrl+Shift+Z</span>
          </div>
          <div className="flex justify-between">
            <span>Zoom In</span>
            <span className="font-mono">Ctrl++</span>
          </div>
          <div className="flex justify-between">
            <span>Zoom Out</span>
            <span className="font-mono">Ctrl+-</span>
          </div>
          <div className="flex justify-between">
            <span>Reset Zoom</span>
            <span className="font-mono">Ctrl+0</span>
          </div>
        </div>
      </div>
    </Card>
  )
}
