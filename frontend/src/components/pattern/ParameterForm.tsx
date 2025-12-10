import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const parameterSchema = z.object({
  fabricType: z.string().min(1, 'Fabric type is required'),
  outputFormat: z.string().min(1, 'Output format is required'),
  scale: z.string().optional(),
  tolerance: z.string().optional(),
})

type ParameterFormData = z.infer<typeof parameterSchema>

interface ParameterFormProps {
  onSubmit: (data: ParameterFormData) => void
  isLoading?: boolean
}

const fabricTypes = [
  { value: 'cotton', label: 'Cotton' },
  { value: 'silk', label: 'Silk' },
  { value: 'wool', label: 'Wool' },
  { value: 'polyester', label: 'Polyester' },
  { value: 'linen', label: 'Linen' },
  { value: 'denim', label: 'Denim' },
]

const outputFormats = [
  { value: 'dxf', label: 'DXF (AutoCAD)' },
  { value: 'plt', label: 'PLT (Plotter)' },
  { value: 'json', label: 'JSON (Data)' },
  { value: 'svg', label: 'SVG (Vector)' },
  { value: 'pdf', label: 'PDF (Document)' },
]

export function ParameterForm({ onSubmit, isLoading }: ParameterFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ParameterFormData>({
    resolver: zodResolver(parameterSchema),
    defaultValues: {
      fabricType: '',
      outputFormat: '',
      scale: '1.0',
      tolerance: '0.5',
    },
  })

  const fabricType = watch('fabricType')
  const outputFormat = watch('outputFormat')

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pattern Parameters</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Fabric Type */}
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Fabric Type *
            </label>
            <Select
              value={fabricType}
              onValueChange={(value) => setValue('fabricType', value)}
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select fabric type" />
              </SelectTrigger>
              <SelectContent>
                {fabricTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.fabricType && (
              <p className="mt-1 text-sm text-red-600">
                {errors.fabricType.message}
              </p>
            )}
          </div>

          {/* Output Format */}
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Output Format *
            </label>
            <Select
              value={outputFormat}
              onValueChange={(value) => setValue('outputFormat', value)}
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select output format" />
              </SelectTrigger>
              <SelectContent>
                {outputFormats.map((format) => (
                  <SelectItem key={format.value} value={format.value}>
                    {format.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.outputFormat && (
              <p className="mt-1 text-sm text-red-600">
                {errors.outputFormat.message}
              </p>
            )}
          </div>

          {/* Advanced Options */}
          <div className="rounded-lg border border-slate-200 p-4">
            <h4 className="mb-4 text-sm font-medium text-slate-900">
              Advanced Options
            </h4>

            <div className="space-y-4">
              {/* Scale */}
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Scale Factor
                </label>
                <Input
                  type="number"
                  step="0.1"
                  placeholder="1.0"
                  {...register('scale')}
                  disabled={isLoading}
                />
                <p className="mt-1 text-xs text-slate-500">
                  Scaling factor for the output pattern (default: 1.0)
                </p>
              </div>

              {/* Tolerance */}
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Tolerance (mm)
                </label>
                <Input
                  type="number"
                  step="0.1"
                  placeholder="0.5"
                  {...register('tolerance')}
                  disabled={isLoading}
                />
                <p className="mt-1 text-xs text-slate-500">
                  Maximum allowed deviation in millimeters (default: 0.5)
                </p>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Processing...' : 'Generate Pattern'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
