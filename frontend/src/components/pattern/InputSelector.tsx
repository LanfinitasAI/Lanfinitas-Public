import { Upload, Image, Sliders } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Card, CardContent } from '@/components/ui/card'

export type InputType = '3d-mesh' | 'image' | 'parameters'

interface InputSelectorProps {
  selectedType: InputType
  onSelectType: (type: InputType) => void
}

const inputTypes = [
  {
    id: '3d-mesh' as InputType,
    title: '3D Mesh',
    description: 'Upload 3D model files (.obj, .fbx, .step, .stl)',
    icon: Upload,
    color: 'from-blue-500 to-cyan-500',
  },
  {
    id: 'image' as InputType,
    title: 'Image',
    description: 'Upload 2D images (.jpg, .png)',
    icon: Image,
    color: 'from-purple-500 to-pink-500',
  },
  {
    id: 'parameters' as InputType,
    title: 'Parameters',
    description: 'Define pattern using parametric inputs',
    icon: Sliders,
    color: 'from-green-500 to-emerald-500',
  },
]

export function InputSelector({
  selectedType,
  onSelectType,
}: InputSelectorProps) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {inputTypes.map((type) => {
        const Icon = type.icon
        const isSelected = selectedType === type.id

        return (
          <Card
            key={type.id}
            className={cn(
              'cursor-pointer transition-all hover:shadow-lg',
              isSelected
                ? 'ring-2 ring-indigo-500 shadow-md'
                : 'hover:border-indigo-200'
            )}
            onClick={() => onSelectType(type.id)}
          >
            <CardContent className="p-6">
              <div className="flex flex-col items-center text-center">
                <div
                  className={cn(
                    'mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br',
                    type.color
                  )}
                >
                  <Icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-slate-900">
                  {type.title}
                </h3>
                <p className="text-sm text-slate-600">{type.description}</p>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
