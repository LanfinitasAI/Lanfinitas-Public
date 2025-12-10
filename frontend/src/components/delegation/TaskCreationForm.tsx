import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Card } from '../ui/card'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { AlertCircle, Loader2 } from 'lucide-react'

const taskSchema = z.object({
  name: z.string().min(3, 'Task name must be at least 3 characters').max(100),
  description: z.string().min(10, 'Description must be at least 10 characters').max(1000),
  priority: z.enum(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'BACKGROUND']),
})

export type TaskFormData = z.infer<typeof taskSchema>

interface TaskCreationFormProps {
  onSubmit: (data: TaskFormData) => void | Promise<void>
  onCancel: () => void
  isLoading?: boolean
}

export const TaskCreationForm: React.FC<TaskCreationFormProps> = ({
  onSubmit,
  onCancel,
  isLoading = false,
}) => {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      priority: 'MEDIUM',
    },
  })

  const priority = watch('priority')

  const getPriorityDescription = (p: string) => {
    switch (p) {
      case 'CRITICAL':
        return 'Highest priority - Execute immediately, bypass normal queue'
      case 'HIGH':
        return 'High priority - Execute as soon as resources available'
      case 'MEDIUM':
        return 'Normal priority - Standard queue processing'
      case 'LOW':
        return 'Low priority - Execute when system has idle capacity'
      case 'BACKGROUND':
        return 'Background task - Execute only during off-peak hours'
      default:
        return ''
    }
  }

  const getPriorityColor = (p: string) => {
    switch (p) {
      case 'CRITICAL':
        return 'border-red-500 bg-red-50'
      case 'HIGH':
        return 'border-orange-500 bg-orange-50'
      case 'MEDIUM':
        return 'border-blue-500 bg-blue-50'
      case 'LOW':
        return 'border-green-500 bg-green-50'
      case 'BACKGROUND':
        return 'border-gray-500 bg-gray-50'
      default:
        return 'border-gray-300 bg-white'
    }
  }

  return (
    <Card className={`p-6 border-2 transition-all ${getPriorityColor(priority)}`}>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Create New Task</h3>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Task Name */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Task Name <span className="text-red-500">*</span>
          </label>
          <Input
            id="name"
            {...register('name')}
            placeholder="e.g., Process customer data"
            className={errors.name ? 'border-red-500' : ''}
          />
          {errors.name && (
            <div className="mt-1 flex items-center gap-1 text-sm text-red-600">
              <AlertCircle className="h-4 w-4" />
              <span>{errors.name.message}</span>
            </div>
          )}
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Description <span className="text-red-500">*</span>
          </label>
          <textarea
            id="description"
            {...register('description')}
            rows={4}
            placeholder="Detailed description of what this task should accomplish..."
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.description ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.description && (
            <div className="mt-1 flex items-center gap-1 text-sm text-red-600">
              <AlertCircle className="h-4 w-4" />
              <span>{errors.description.message}</span>
            </div>
          )}
        </div>

        {/* Priority */}
        <div>
          <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-1">
            Priority Level <span className="text-red-500">*</span>
          </label>
          <select
            id="priority"
            {...register('priority')}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="CRITICAL">🔴 Critical</option>
            <option value="HIGH">🟠 High</option>
            <option value="MEDIUM">🔵 Medium</option>
            <option value="LOW">🟢 Low</option>
            <option value="BACKGROUND">⚪ Background</option>
          </select>
          <p className="mt-1 text-sm text-gray-600">{getPriorityDescription(priority)}</p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting || isLoading}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting || isLoading}>
            {(isSubmitting || isLoading) && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Create Task
          </Button>
        </div>
      </form>
    </Card>
  )
}
