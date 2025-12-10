import {
  MousePointer2,
  Square,
  Circle,
  Minus,
  Type,
  Ruler,
  Undo2,
  Redo2,
  Download,
  Trash2,
  Grid3x3,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export type EditorTool =
  | 'select'
  | 'rectangle'
  | 'circle'
  | 'line'
  | 'text'
  | 'measure'

export interface EditorToolbarProps {
  activeTool: EditorTool
  onToolChange: (tool: EditorTool) => void
  onUndo?: () => void
  onRedo?: () => void
  onExport?: (format: 'svg' | 'png' | 'pdf') => void
  onClear?: () => void
  onToggleGrid?: () => void
  canUndo?: boolean
  canRedo?: boolean
  showGrid?: boolean
}

const tools = [
  { id: 'select', name: 'Select', icon: MousePointer2, shortcut: 'V' },
  { id: 'rectangle', name: 'Rectangle', icon: Square, shortcut: 'R' },
  { id: 'circle', name: 'Circle', icon: Circle, shortcut: 'C' },
  { id: 'line', name: 'Line', icon: Minus, shortcut: 'L' },
  { id: 'text', name: 'Text', icon: Type, shortcut: 'T' },
  { id: 'measure', name: 'Measure', icon: Ruler, shortcut: 'M' },
] as const

export function EditorToolbar({
  activeTool,
  onToolChange,
  onUndo,
  onRedo,
  onExport,
  onClear,
  onToggleGrid,
  canUndo = false,
  canRedo = false,
  showGrid = true,
}: EditorToolbarProps) {
  return (
    <Card className="flex items-center gap-4 p-3">
      {/* Drawing Tools */}
      <div className="flex gap-1 rounded-lg border bg-slate-50 p-1">
        {tools.map((tool) => {
          const Icon = tool.icon
          const isActive = activeTool === tool.id

          return (
            <Button
              key={tool.id}
              variant={isActive ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onToolChange(tool.id as EditorTool)}
              title={`${tool.name} (${tool.shortcut})`}
              className="h-9 w-9 p-0"
            >
              <Icon className="h-4 w-4" />
            </Button>
          )
        })}
      </div>

      <div className="h-6 w-px bg-slate-300" />

      {/* Undo/Redo */}
      <div className="flex gap-1">
        {onUndo && (
          <Button
            variant="outline"
            size="sm"
            onClick={onUndo}
            disabled={!canUndo}
            title="Undo (Ctrl/Cmd + Z)"
          >
            <Undo2 className="h-4 w-4" />
          </Button>
        )}
        {onRedo && (
          <Button
            variant="outline"
            size="sm"
            onClick={onRedo}
            disabled={!canRedo}
            title="Redo (Ctrl/Cmd + Shift + Z)"
          >
            <Redo2 className="h-4 w-4" />
          </Button>
        )}
      </div>

      <div className="h-6 w-px bg-slate-300" />

      {/* Grid Toggle */}
      {onToggleGrid && (
        <Button
          variant={showGrid ? 'default' : 'outline'}
          size="sm"
          onClick={onToggleGrid}
          title="Toggle Grid (G)"
        >
          <Grid3x3 className="mr-2 h-4 w-4" />
          Grid
        </Button>
      )}

      <div className="flex-1" />

      {/* Export */}
      {onExport && (
        <Select onValueChange={(value) => onExport(value as 'svg' | 'png' | 'pdf')}>
          <SelectTrigger className="w-40">
            <Download className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Export" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="svg">Export as SVG</SelectItem>
            <SelectItem value="png">Export as PNG</SelectItem>
            <SelectItem value="pdf">Export as PDF</SelectItem>
          </SelectContent>
        </Select>
      )}

      {/* Clear */}
      {onClear && (
        <Button
          variant="outline"
          size="sm"
          onClick={onClear}
          title="Clear Canvas"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      )}
    </Card>
  )
}
