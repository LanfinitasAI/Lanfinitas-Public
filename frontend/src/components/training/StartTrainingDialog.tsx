import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Play, Cpu, Database, Settings } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'

const trainingSchema = z.object({
  jobName: z.string().min(1, 'Job name is required'),
  modelType: z.string().min(1, 'Model type is required'),
  dataset: z.string().min(1, 'Dataset is required'),
  epochs: z.string().min(1, 'Epochs is required'),
  batchSize: z.string().min(1, 'Batch size is required'),
  learningRate: z.string().min(1, 'Learning rate is required'),
})

type TrainingFormData = z.infer<typeof trainingSchema>

export interface TrainingConfig {
  jobName: string
  modelType: string
  dataset: string
  epochs: number
  batchSize: number
  learningRate: number
}

interface StartTrainingDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onStart: (config: TrainingConfig) => void
}

const modelTypes = [
  {
    value: 'pattern-segmentation',
    label: 'Pattern Segmentation',
    description: 'Segment pattern pieces from images',
  },
  {
    value: 'keypoint-detection',
    label: 'Keypoint Detection',
    description: 'Detect key points on patterns',
  },
  {
    value: 'seam-detection',
    label: 'Seam Detection',
    description: 'Detect seam lines on patterns',
  },
  {
    value: 'grainline-detection',
    label: 'Grainline Detection',
    description: 'Detect fabric grain direction',
  },
]

const datasets = [
  { value: 'dataset-1', label: 'Fashion Patterns Dataset v1', size: '1,250 images' },
  { value: 'dataset-2', label: 'Fashion Patterns Dataset v2', size: '2,500 images' },
  { value: 'dataset-3', label: 'Annotated Patterns', size: '850 images' },
  { value: 'custom', label: 'Custom Dataset', size: 'Variable' },
]

export function StartTrainingDialog({
  open,
  onOpenChange,
  onStart,
}: StartTrainingDialogProps) {
  const [selectedModel, setSelectedModel] = useState<string>('')
  const [selectedDataset, setSelectedDataset] = useState<string>('')

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    reset,
  } = useForm<TrainingFormData>({
    resolver: zodResolver(trainingSchema),
    defaultValues: {
      jobName: '',
      modelType: '',
      dataset: '',
      epochs: '100',
      batchSize: '32',
      learningRate: '0.001',
    },
  })

  const onSubmit = (data: TrainingFormData) => {
    const config: TrainingConfig = {
      jobName: data.jobName,
      modelType: data.modelType,
      dataset: data.dataset,
      epochs: parseInt(data.epochs),
      batchSize: parseInt(data.batchSize),
      learningRate: parseFloat(data.learningRate),
    }

    onStart(config)
    reset()
    setSelectedModel('')
    setSelectedDataset('')
    onOpenChange(false)
  }

  const handleModelChange = (value: string) => {
    setSelectedModel(value)
    setValue('modelType', value)
  }

  const handleDatasetChange = (value: string) => {
    setSelectedDataset(value)
    setValue('dataset', value)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Start New Training Job</DialogTitle>
          <DialogDescription>
            Configure and start a new model training job
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Job Name */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">
              Job Name <span className="text-red-500">*</span>
            </label>
            <Input
              {...register('jobName')}
              placeholder="e.g., Pattern Segmentation Training v1"
            />
            {errors.jobName && (
              <p className="text-sm text-red-600">{errors.jobName.message}</p>
            )}
          </div>

          {/* Model Type Selection */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
              <Cpu className="h-4 w-4" />
              Model Type <span className="text-red-500">*</span>
            </label>
            <Select value={selectedModel} onValueChange={handleModelChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select model type" />
              </SelectTrigger>
              <SelectContent>
                {modelTypes.map((model) => (
                  <SelectItem key={model.value} value={model.value}>
                    <div>
                      <div className="font-medium">{model.label}</div>
                      <div className="text-xs text-slate-500">
                        {model.description}
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.modelType && (
              <p className="text-sm text-red-600">{errors.modelType.message}</p>
            )}
          </div>

          {/* Dataset Selection */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
              <Database className="h-4 w-4" />
              Dataset <span className="text-red-500">*</span>
            </label>
            <Select value={selectedDataset} onValueChange={handleDatasetChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select dataset" />
              </SelectTrigger>
              <SelectContent>
                {datasets.map((dataset) => (
                  <SelectItem key={dataset.value} value={dataset.value}>
                    <div>
                      <div className="font-medium">{dataset.label}</div>
                      <div className="text-xs text-slate-500">{dataset.size}</div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.dataset && (
              <p className="text-sm text-red-600">{errors.dataset.message}</p>
            )}
          </div>

          {/* Hyperparameters */}
          <div className="space-y-4">
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
              <Settings className="h-4 w-4" />
              Hyperparameters
            </label>

            <div className="grid grid-cols-3 gap-4">
              {/* Epochs */}
              <div className="space-y-2">
                <label className="text-sm text-slate-600">Epochs</label>
                <Input
                  {...register('epochs')}
                  type="number"
                  min="1"
                  placeholder="100"
                />
                {errors.epochs && (
                  <p className="text-xs text-red-600">{errors.epochs.message}</p>
                )}
              </div>

              {/* Batch Size */}
              <div className="space-y-2">
                <label className="text-sm text-slate-600">Batch Size</label>
                <Input
                  {...register('batchSize')}
                  type="number"
                  min="1"
                  placeholder="32"
                />
                {errors.batchSize && (
                  <p className="text-xs text-red-600">{errors.batchSize.message}</p>
                )}
              </div>

              {/* Learning Rate */}
              <div className="space-y-2">
                <label className="text-sm text-slate-600">Learning Rate</label>
                <Input
                  {...register('learningRate')}
                  type="number"
                  step="0.0001"
                  min="0"
                  placeholder="0.001"
                />
                {errors.learningRate && (
                  <p className="text-xs text-red-600">
                    {errors.learningRate.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Info Alert */}
          <Alert>
            <AlertDescription>
              Training will start immediately after clicking Start. You can monitor
              progress in the job details panel.
            </AlertDescription>
          </Alert>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit">
              <Play className="mr-2 h-4 w-4" />
              Start Training
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
