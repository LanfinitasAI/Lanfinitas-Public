import React, { useState } from 'react'
import { Card } from '../ui/card'
import { Button } from '../ui/button'
import { Loader2, Shield, CheckSquare, Square } from 'lucide-react'
import { Task } from '../../hooks/useDelegation'

interface DelegationPanelProps {
  agentId: string
  tasks: Task[]
  onDelegate: (taskId: string, agentId: string, permissions: string[]) => void | Promise<void>
  isLoading?: boolean
}

const AVAILABLE_PERMISSIONS = [
  { id: 'read', label: 'Read Data', description: 'View task data and results' },
  { id: 'write', label: 'Write Data', description: 'Modify task data' },
  { id: 'execute', label: 'Execute Actions', description: 'Perform task operations' },
  { id: 'delegate', label: 'Sub-delegate', description: 'Delegate to other agents' },
  { id: 'report', label: 'Report Status', description: 'Send status updates' },
]

export const DelegationPanel: React.FC<DelegationPanelProps> = ({
  agentId,
  tasks,
  onDelegate,
  isLoading = false,
}) => {
  const [selectedTaskId, setSelectedTaskId] = useState<string>('')
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>(['read', 'execute', 'report'])
  const [isDelegating, setIsDelegating] = useState(false)

  const availableTasks = tasks.filter(
    (task) => task.status === 'PENDING' || task.status === 'ASSIGNED'
  )

  const togglePermission = (permissionId: string) => {
    if (selectedPermissions.includes(permissionId)) {
      setSelectedPermissions(selectedPermissions.filter((p) => p !== permissionId))
    } else {
      setSelectedPermissions([...selectedPermissions, permissionId])
    }
  }

  const handleDelegate = async () => {
    if (!selectedTaskId) return

    setIsDelegating(true)
    try {
      await onDelegate(selectedTaskId, agentId, selectedPermissions)
      setSelectedTaskId('')
      setSelectedPermissions(['read', 'execute', 'report'])
    } catch (error) {
      console.error('Delegation failed:', error)
    } finally {
      setIsDelegating(false)
    }
  }

  if (availableTasks.length === 0) {
    return (
      <Card className="p-6 bg-gray-50">
        <div className="text-center text-gray-500">
          <Shield className="h-12 w-12 mx-auto mb-2 text-gray-400" />
          <p>No tasks available for delegation</p>
          <p className="text-sm mt-1">Create a task first</p>
        </div>
      </Card>
    )
  }

  return (
    <Card className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <Shield className="h-5 w-5 text-purple-600" />
        Delegation Configuration
      </h3>

      {/* Task Selection */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Task to Delegate
        </label>
        <select
          value={selectedTaskId}
          onChange={(e) => setSelectedTaskId(e.target.value)}
          className="w-full px-3 py-2 border border-purple-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
        >
          <option value="">-- Select a task --</option>
          {availableTasks.map((task) => (
            <option key={task.id} value={task.id}>
              {task.name} ({task.priority})
            </option>
          ))}
        </select>
      </div>

      {/* Permissions */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Grant Permissions
        </label>
        <div className="space-y-2">
          {AVAILABLE_PERMISSIONS.map((permission) => (
            <button
              key={permission.id}
              onClick={() => togglePermission(permission.id)}
              className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
                selectedPermissions.includes(permission.id)
                  ? 'border-purple-500 bg-purple-50'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              <div className="flex items-start gap-3">
                {selectedPermissions.includes(permission.id) ? (
                  <CheckSquare className="h-5 w-5 text-purple-600 mt-0.5" />
                ) : (
                  <Square className="h-5 w-5 text-gray-400 mt-0.5" />
                )}
                <div>
                  <div className="font-semibold text-gray-900">{permission.label}</div>
                  <div className="text-sm text-gray-600">{permission.description}</div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Summary */}
      {selectedTaskId && (
        <div className="mb-4 p-3 bg-white rounded-lg border border-purple-200">
          <h4 className="text-sm font-semibold text-gray-900 mb-2">Delegation Summary</h4>
          <div className="text-sm space-y-1">
            <div>
              <span className="text-gray-600">Task:</span>{' '}
              <span className="font-medium">
                {availableTasks.find((t) => t.id === selectedTaskId)?.name}
              </span>
            </div>
            <div>
              <span className="text-gray-600">Permissions:</span>{' '}
              <span className="font-medium">{selectedPermissions.length} granted</span>
            </div>
            <div className="flex flex-wrap gap-1 mt-2">
              {selectedPermissions.map((p) => (
                <span
                  key={p}
                  className="px-2 py-0.5 text-xs bg-purple-100 text-purple-700 rounded"
                >
                  {AVAILABLE_PERMISSIONS.find((perm) => perm.id === p)?.label}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Action Button */}
      <Button
        onClick={handleDelegate}
        disabled={!selectedTaskId || selectedPermissions.length === 0 || isDelegating || isLoading}
        className="w-full"
      >
        {(isDelegating || isLoading) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Delegate Task
      </Button>
    </Card>
  )
}
