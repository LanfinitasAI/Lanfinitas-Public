import { Eye, EyeOff, Lock, Unlock, ChevronUp, ChevronDown, Trash2 } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import type { Layer } from '@/hooks/useFabricCanvas'

export interface LayerPanelProps {
  layers: Layer[]
  selectedLayer: string | null
  onSelectLayer: (id: string) => void
  onToggleVisibility: (id: string) => void
  onToggleLock: (id: string) => void
  onMoveLayer: (id: string, direction: 'up' | 'down') => void
  onDeleteLayer: (id: string) => void
}

export function LayerPanel({
  layers,
  selectedLayer,
  onSelectLayer,
  onToggleVisibility,
  onToggleLock,
  onMoveLayer,
  onDeleteLayer,
}: LayerPanelProps) {
  if (layers.length === 0) {
    return (
      <Card className="h-full p-4">
        <h3 className="mb-4 text-sm font-semibold text-slate-900">Layers</h3>
        <div className="flex h-full items-center justify-center text-center">
          <p className="text-sm text-slate-400">
            No layers yet. Add objects to create layers.
          </p>
        </div>
      </Card>
    )
  }

  return (
    <Card className="flex h-full flex-col">
      {/* Header */}
      <div className="border-b px-4 py-3">
        <h3 className="text-sm font-semibold text-slate-900">
          Layers ({layers.length})
        </h3>
      </div>

      {/* Layer List */}
      <div className="flex-1 overflow-y-auto p-2">
        <div className="space-y-1">
          {layers.map((layer, index) => {
            const isSelected = selectedLayer === layer.id
            const isFirst = index === 0
            const isLast = index === layers.length - 1

            return (
              <div
                key={layer.id}
                onClick={() => onSelectLayer(layer.id)}
                className={`
                  group flex items-center gap-2 rounded-lg border-2 p-2 transition-all cursor-pointer
                  ${
                    isSelected
                      ? 'border-indigo-500 bg-indigo-50'
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                  }
                `}
              >
                {/* Layer Info */}
                <div className="flex-1 min-w-0">
                  <p className="truncate text-sm font-medium text-slate-900">
                    {layer.name}
                  </p>
                  <p className="text-xs text-slate-500">
                    {layer.object.type || 'Object'}
                  </p>
                </div>

                {/* Controls */}
                <div className="flex items-center gap-1">
                  {/* Move Up */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      if (!isFirst) onMoveLayer(layer.id, 'up')
                    }}
                    disabled={isFirst}
                    className="rounded p-1 hover:bg-slate-200 disabled:opacity-30"
                    title="Move Up"
                  >
                    <ChevronUp className="h-3.5 w-3.5 text-slate-600" />
                  </button>

                  {/* Move Down */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      if (!isLast) onMoveLayer(layer.id, 'down')
                    }}
                    disabled={isLast}
                    className="rounded p-1 hover:bg-slate-200 disabled:opacity-30"
                    title="Move Down"
                  >
                    <ChevronDown className="h-3.5 w-3.5 text-slate-600" />
                  </button>

                  {/* Visibility Toggle */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      onToggleVisibility(layer.id)
                    }}
                    className="rounded p-1 hover:bg-slate-200"
                    title={layer.visible ? 'Hide' : 'Show'}
                  >
                    {layer.visible ? (
                      <Eye className="h-3.5 w-3.5 text-slate-600" />
                    ) : (
                      <EyeOff className="h-3.5 w-3.5 text-slate-400" />
                    )}
                  </button>

                  {/* Lock Toggle */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      onToggleLock(layer.id)
                    }}
                    className="rounded p-1 hover:bg-slate-200"
                    title={layer.locked ? 'Unlock' : 'Lock'}
                  >
                    {layer.locked ? (
                      <Lock className="h-3.5 w-3.5 text-red-600" />
                    ) : (
                      <Unlock className="h-3.5 w-3.5 text-slate-600" />
                    )}
                  </button>

                  {/* Delete */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      onDeleteLayer(layer.id)
                    }}
                    className="rounded p-1 hover:bg-red-100"
                    title="Delete"
                  >
                    <Trash2 className="h-3.5 w-3.5 text-red-600" />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Footer */}
      <div className="border-t bg-slate-50 px-4 py-3">
        <div className="grid grid-cols-3 gap-4 text-xs">
          <div>
            <span className="text-slate-600">Visible:</span>{' '}
            <span className="font-medium text-slate-900">
              {layers.filter((l) => l.visible).length}
            </span>
          </div>
          <div>
            <span className="text-slate-600">Locked:</span>{' '}
            <span className="font-medium text-slate-900">
              {layers.filter((l) => l.locked).length}
            </span>
          </div>
          <div>
            <span className="text-slate-600">Total:</span>{' '}
            <span className="font-medium text-slate-900">{layers.length}</span>
          </div>
        </div>
      </div>
    </Card>
  )
}
