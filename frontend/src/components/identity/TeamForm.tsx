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
const teamSchema = z.object({
  name: z
    .string()
    .min(2, 'Team name must be at least 2 characters')
    .max(100, 'Team name must be less than 100 characters'),
  description: z.string().max(500, 'Description must be less than 500 characters').optional(),
  members: z.array(z.string()).optional(),
})

export type TeamFormData = z.infer<typeof teamSchema>

interface TeamFormProps {
  onSubmit: (data: TeamFormData) => void | Promise<void>
  onCancel: () => void
  initialData?: Partial<TeamFormData>
  isLoading?: boolean
}

export const TeamForm: React.FC<TeamFormProps> = ({
  onSubmit,
  onCancel,
  initialData,
  isLoading = false,
}) => {
  const [selectedMembers, setSelectedMembers] = useState<string[]>(initialData?.members || [])
  const { data: availableUsers, isLoading: usersLoading } = useAvailableUsers()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<TeamFormData>({
    resolver: zodResolver(teamSchema),
    defaultValues: initialData || {},
  })

  const onFormSubmit = async (data: TeamFormData) => {
    try {
      await onSubmit({
        ...data,
        members: selectedMembers,
      })
    } catch (error) {
      console.error('Form submission error:', error)
    }
  }

  const addMember = (userId: string) => {
    if (!selectedMembers.includes(userId)) {
      setSelectedMembers([...selectedMembers, userId])
    }
  }

  const removeMember = (userId: string) => {
    setSelectedMembers(selectedMembers.filter((id) => id !== userId))
  }

  const getUsername = (userId: string) => {
    return availableUsers?.find((user) => user.id === userId)?.name || userId
  }

  return (
    <Card className="p-6 bg-green-50 border-green-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        {initialData ? 'Edit Team' : 'Create New Team'}
      </h3>

      <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
        {/* Team Name */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Team Name <span className="text-red-500">*</span>
          </label>
          <Input
            id="name"
            {...register('name')}
            placeholder="Engineering Team"
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
            Description
          </label>
          <textarea
            id="description"
            {...register('description')}
            placeholder="Brief description of the team's purpose and responsibilities"
            rows={3}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
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

        {/* Team Members */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Team Members</label>

          {/* Add Member Dropdown */}
          <div className="flex items-center gap-2 mb-2">
            <select
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              onChange={(e) => {
                if (e.target.value) {
                  addMember(e.target.value)
                  e.target.value = ''
                }
              }}
              disabled={usersLoading}
            >
              <option value="">Select a user to add...</option>
              {availableUsers
                ?.filter((user) => !selectedMembers.includes(user.id))
                .map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name} ({user.email})
                  </option>
                ))}
            </select>
          </div>

          {/* Selected Members */}
          {selectedMembers.length > 0 ? (
            <div className="space-y-2">
              {selectedMembers.map((memberId) => (
                <div
                  key={memberId}
                  className="flex items-center justify-between p-2 bg-white border border-gray-200 rounded-lg"
                >
                  <span className="text-sm font-medium">{getUsername(memberId)}</span>
                  <button
                    type="button"
                    onClick={() => removeMember(memberId)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-sm text-gray-500 italic">No members added yet</div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-green-200">
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
            {initialData ? 'Update Team' : 'Create Team'}
          </Button>
        </div>
      </form>
    </Card>
  )
}
