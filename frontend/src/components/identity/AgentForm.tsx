import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Card } from '../ui/card'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { AlertCircle, Loader2, X, Plus } from 'lucide-react'
import { useAvailableUsers } from '../../hooks/useIdentities'

// Validation schema
const agentSchema = z.object({
  name: z
    .string()
    .min(2, 'Agent name must be at least 2 characters')
    .max(100, 'Agent name must be less than 100 characters'),
  type: z.enum(['AGENT_SYSTEM', 'AGENT_WORKER'], {
    required_error: 'Please select an agent type',
  }),
  capabilities: z.array(z.string()).min(1, 'At least one capability is required'),
  ownerId: z.string().min(1, 'Owner is required'),
  metadata: z.record(z.any()).optional(),
})

export type AgentFormData = z.infer<typeof agentSchema>

interface AgentFormProps {
  onSubmit: (data: AgentFormData) => void | Promise<void>
  onCancel: () => void
  initialData?: Partial<AgentFormData>
  isLoading?: boolean
}

// Predefined capabilities
const PREDEFINED_CAPABILITIES = [
  'data_processing',
  'machine_learning',
  'pattern_recognition',
  'natural_language_processing',
  'computer_vision',
  'workflow_automation',
  'data_analysis',
  'reporting',
  'monitoring',
  'optimization',
]

export const AgentForm: React.FC<AgentFormProps> = ({
  onSubmit,
  onCancel,
  initialData,
  isLoading = false,
}) => {
  const [capabilities, setCapabilities] = useState<string[]>(initialData?.capabilities || [])
  const [customCapability, setCustomCapability] = useState('')
  const { data: availableUsers, isLoading: usersLoading } = useAvailableUsers()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
  } = useForm<AgentFormData>({
    resolver: zodResolver(agentSchema),
    defaultValues: initialData || {
      type: 'AGENT_WORKER',
    },
  })

  const agentType = watch('type')

  const onFormSubmit = async (data: AgentFormData) => {
    try {
      await onSubmit({
        ...data,
        capabilities,
      })
    } catch (error) {
      console.error('Form submission error:', error)
    }
  }

  const addCapability = (capability: string) => {
    if (capability && !capabilities.includes(capability)) {
      const newCapabilities = [...capabilities, capability]
      setCapabilities(newCapabilities)
      setValue('capabilities', newCapabilities)
    }
  }

  const removeCapability = (capability: string) => {
    const newCapabilities = capabilities.filter((c) => c !== capability)
    setCapabilities(newCapabilities)
    setValue('capabilities', newCapabilities)
  }

  const addCustomCapability = () => {
    if (customCapability.trim()) {
      addCapability(customCapability.trim())
      setCustomCapability('')
    }
  }

  return (
    <Card className="p-6 bg-purple-50 border-purple-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        {initialData ? 'Edit Agent' : 'Register New Agent'}
      </h3>

      <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Agent Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Agent Name <span className="text-red-500">*</span>
            </label>
            <Input
              id="name"
              {...register('name')}
              placeholder="ML Processing Agent"
              className={errors.name ? 'border-red-500' : ''}
            />
            {errors.name && (
              <div className="mt-1 flex items-center gap-1 text-sm text-red-600">
                <AlertCircle className="h-4 w-4" />
                <span>{errors.name.message}</span>
              </div>
            )}
          </div>

          {/* Agent Type */}
          <div>
            <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
              Agent Type <span className="text-red-500">*</span>
            </label>
            <select
              id="type"
              {...register('type')}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                errors.type ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="AGENT_WORKER">Worker Agent</option>
              <option value="AGENT_SYSTEM">System Agent</option>
            </select>
            {errors.type && (
              <div className="mt-1 flex items-center gap-1 text-sm text-red-600">
                <AlertCircle className="h-4 w-4" />
                <span>{errors.type.message}</span>
              </div>
            )}
            <p className="mt-1 text-sm text-gray-500">
              {agentType === 'AGENT_SYSTEM' && 'Critical system-level agent with elevated privileges'}
              {agentType === 'AGENT_WORKER' && 'Standard worker agent for task execution'}
            </p>
          </div>
        </div>

        {/* Owner */}
        <div>
          <label htmlFor="ownerId" className="block text-sm font-medium text-gray-700 mb-1">
            Owner <span className="text-red-500">*</span>
          </label>
          <select
            id="ownerId"
            {...register('ownerId')}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
              errors.ownerId ? 'border-red-500' : 'border-gray-300'
            }`}
            disabled={usersLoading}
          >
            <option value="">Select an owner...</option>
            {availableUsers?.map((user) => (
              <option key={user.id} value={user.id}>
                {user.name} ({user.email})
              </option>
            ))}
          </select>
          {errors.ownerId && (
            <div className="mt-1 flex items-center gap-1 text-sm text-red-600">
              <AlertCircle className="h-4 w-4" />
              <span>{errors.ownerId.message}</span>
            </div>
          )}
        </div>

        {/* Capabilities */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Capabilities <span className="text-red-500">*</span>
          </label>

          {/* Predefined Capabilities */}
          <div className="mb-2">
            <label className="block text-xs text-gray-600 mb-1">Select from common capabilities:</label>
            <div className="flex flex-wrap gap-2">
              {PREDEFINED_CAPABILITIES.map((capability) => (
                <button
                  key={capability}
                  type="button"
                  onClick={() => addCapability(capability)}
                  disabled={capabilities.includes(capability)}
                  className={`px-3 py-1 text-sm rounded-full border transition-colors ${
                    capabilities.includes(capability)
                      ? 'bg-purple-100 border-purple-300 text-purple-700 cursor-not-allowed'
                      : 'bg-white border-gray-300 text-gray-700 hover:bg-purple-50 hover:border-purple-300'
                  }`}
                >
                  {capability.replace(/_/g, ' ')}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Capability */}
          <div className="flex items-center gap-2 mb-2">
            <Input
              placeholder="Add custom capability..."
              value={customCapability}
              onChange={(e) => setCustomCapability(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  addCustomCapability()
                }
              }}
            />
            <Button type="button" variant="outline" onClick={addCustomCapability}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          {/* Selected Capabilities */}
          {capabilities.length > 0 ? (
            <div className="flex flex-wrap gap-2 mb-2">
              {capabilities.map((capability) => (
                <div
                  key={capability}
                  className="flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm"
                >
                  <span>{capability.replace(/_/g, ' ')}</span>
                  <button
                    type="button"
                    onClick={() => removeCapability(capability)}
                    className="text-purple-500 hover:text-purple-700"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-sm text-gray-500 italic">No capabilities selected</div>
          )}

          {errors.capabilities && (
            <div className="mt-1 flex items-center gap-1 text-sm text-red-600">
              <AlertCircle className="h-4 w-4" />
              <span>{errors.capabilities.message}</span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-purple-200">
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
            {initialData ? 'Update Agent' : 'Register Agent'}
          </Button>
        </div>
      </form>
    </Card>
  )
}
