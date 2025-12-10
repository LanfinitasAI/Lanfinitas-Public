import React, { useState } from 'react'
import { Card } from '../ui/card'
import { Button } from '../ui/button'
import {
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2,
  ChevronDown,
  ChevronUp,
  Shield,
  Bot,
  Calendar,
  Activity,
} from 'lucide-react'
import { Task, Delegation, Agent } from '../../hooks/useDelegation'
import { format } from 'date-fns'

interface TaskMonitorProps {
  tasks: Task[]
  delegations: Delegation[]
  agents: Agent[]
  onRevoke: (delegationId: string) => void
  onSelectTask: (taskId: string | null) => void
  selectedTaskId: string | null
  isLoading: boolean
}

export const TaskMonitor: React.FC<TaskMonitorProps> = ({
  tasks,
  delegations,
  agents,
  onRevoke,
  onSelectTask,
  selectedTaskId,
  isLoading,
}) => {
  const [expandedTaskIds, setExpandedTaskIds] = useState<Set<string>>(new Set())

  const toggleExpand = (taskId: string) => {
    const newExpanded = new Set(expandedTaskIds)
    if (newExpanded.has(taskId)) {
      newExpanded.delete(taskId)
    } else {
      newExpanded.add(taskId)
    }
    setExpandedTaskIds(newExpanded)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Clock className="h-5 w-5 text-gray-400" />
      case 'ASSIGNED':
        return <AlertCircle className="h-5 w-5 text-blue-500" />
      case 'IN_PROGRESS':
        return <Loader2 className="h-5 w-5 text-yellow-500 animate-spin" />
      case 'COMPLETED':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />
      case 'FAILED':
        return <XCircle className="h-5 w-5 text-red-500" />
      case 'CANCELLED':
        return <XCircle className="h-5 w-5 text-gray-400" />
      default:
        return <Clock className="h-5 w-5 text-gray-400" />
    }
  }

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      PENDING: 'bg-gray-100 text-gray-700',
      ASSIGNED: 'bg-blue-100 text-blue-700',
      IN_PROGRESS: 'bg-yellow-100 text-yellow-700',
      COMPLETED: 'bg-green-100 text-green-700',
      FAILED: 'bg-red-100 text-red-700',
      CANCELLED: 'bg-gray-100 text-gray-500',
    }

    return (
      <span className={`px-2 py-1 text-xs font-semibold rounded ${styles[status] || styles.PENDING}`}>
        {status.replace('_', ' ')}
      </span>
    )
  }

  const getPriorityBadge = (priority: string) => {
    const styles: Record<string, string> = {
      CRITICAL: 'bg-red-100 text-red-700 border-red-300',
      HIGH: 'bg-orange-100 text-orange-700 border-orange-300',
      MEDIUM: 'bg-blue-100 text-blue-700 border-blue-300',
      LOW: 'bg-green-100 text-green-700 border-green-300',
      BACKGROUND: 'bg-gray-100 text-gray-600 border-gray-300',
    }

    const emoji: Record<string, string> = {
      CRITICAL: '🔴',
      HIGH: '🟠',
      MEDIUM: '🔵',
      LOW: '🟢',
      BACKGROUND: '⚪',
    }

    return (
      <span
        className={`px-2 py-1 text-xs font-semibold rounded border ${styles[priority] || styles.MEDIUM}`}
      >
        {emoji[priority]} {priority}
      </span>
    )
  }

  const getDelegationForTask = (taskId: string): Delegation | undefined => {
    return delegations.find((d) => d.taskId === taskId && d.status === 'ACTIVE')
  }

  const getAgentById = (agentId?: string): Agent | undefined => {
    if (!agentId) return undefined
    return agents.find((a) => a.id === agentId)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    )
  }

  if (tasks.length === 0) {
    return (
      <Card className="p-8 bg-gray-50">
        <div className="text-center text-gray-500">
          <Activity className="h-16 w-16 mx-auto mb-4 text-gray-400" />
          <p className="text-lg font-medium">No tasks to monitor</p>
          <p className="text-sm mt-2">Create a task to get started</p>
        </div>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {tasks.map((task) => {
        const delegation = getDelegationForTask(task.id)
        const agent = getAgentById(task.assignedAgentId)
        const isExpanded = expandedTaskIds.has(task.id)
        const isSelected = selectedTaskId === task.id

        return (
          <Card
            key={task.id}
            className={`p-4 transition-all cursor-pointer ${
              isSelected
                ? 'ring-2 ring-blue-500 bg-blue-50'
                : 'hover:shadow-md hover:bg-gray-50'
            }`}
            onClick={() => onSelectTask(task.id === selectedTaskId ? null : task.id)}
          >
            {/* Header */}
            <div className="flex items-start gap-4">
              {/* Status Icon */}
              <div className="mt-1">{getStatusIcon(task.status)}</div>

              {/* Main Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-4 mb-2">
                  <div className="flex-1">
                    <h4 className="text-lg font-semibold text-gray-900 truncate">{task.name}</h4>
                    <p className="text-sm text-gray-600 line-clamp-2 mt-1">{task.description}</p>
                  </div>

                  {/* Badges */}
                  <div className="flex flex-col gap-2 items-end">
                    {getStatusBadge(task.status)}
                    {getPriorityBadge(task.priority)}
                  </div>
                </div>

                {/* Metadata Row */}
                <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>{format(new Date(task.createdAt), 'MMM d, HH:mm')}</span>
                  </div>

                  {agent && (
                    <div className="flex items-center gap-1">
                      <Bot className="h-4 w-4" />
                      <span className="font-medium">{agent.name}</span>
                    </div>
                  )}

                  {delegation && (
                    <div className="flex items-center gap-1">
                      <Shield className="h-4 w-4 text-purple-600" />
                      <span className="text-purple-600 font-medium">
                        {delegation.permissions.length} permissions
                      </span>
                    </div>
                  )}
                </div>

                {/* Expand Button */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    toggleExpand(task.id)
                  }}
                  className="w-full justify-center text-sm text-gray-600 hover:text-gray-900"
                >
                  {isExpanded ? (
                    <>
                      <ChevronUp className="h-4 w-4 mr-1" />
                      Hide Details
                    </>
                  ) : (
                    <>
                      <ChevronDown className="h-4 w-4 mr-1" />
                      Show Details
                    </>
                  )}
                </Button>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="mt-4 pt-4 border-t space-y-4">
                    {/* Task Details */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-xs font-semibold text-gray-500 uppercase mb-1">
                          Created By
                        </div>
                        <div className="text-sm font-medium">{task.createdBy}</div>
                      </div>

                      {task.startedAt && (
                        <div>
                          <div className="text-xs font-semibold text-gray-500 uppercase mb-1">
                            Started At
                          </div>
                          <div className="text-sm font-medium">
                            {format(new Date(task.startedAt), 'MMM d, yyyy HH:mm:ss')}
                          </div>
                        </div>
                      )}

                      {task.completedAt && (
                        <div>
                          <div className="text-xs font-semibold text-gray-500 uppercase mb-1">
                            Completed At
                          </div>
                          <div className="text-sm font-medium">
                            {format(new Date(task.completedAt), 'MMM d, yyyy HH:mm:ss')}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Agent Details */}
                    {agent && (
                      <div>
                        <div className="text-xs font-semibold text-gray-500 uppercase mb-2">
                          Assigned Agent
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                          <div className="h-10 w-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                            <Bot className="h-5 w-5" />
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900">{agent.name}</div>
                            <div className="text-xs text-gray-600">
                              {agent.type.replace('AGENT_', '')} • {agent.status}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Delegation Details */}
                    {delegation && (
                      <div>
                        <div className="text-xs font-semibold text-gray-500 uppercase mb-2">
                          Delegation
                        </div>
                        <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <Shield className="h-4 w-4 text-purple-600" />
                              <span className="font-semibold text-gray-900">
                                Active Delegation
                              </span>
                            </div>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={(e) => {
                                e.stopPropagation()
                                if (confirm('Are you sure you want to revoke this delegation?')) {
                                  onRevoke(delegation.id)
                                }
                              }}
                            >
                              Revoke
                            </Button>
                          </div>
                          <div className="text-sm space-y-1">
                            <div>
                              <span className="text-gray-600">Delegated by:</span>{' '}
                              <span className="font-medium">{delegation.delegatedBy}</span>
                            </div>
                            <div>
                              <span className="text-gray-600">Created:</span>{' '}
                              <span className="font-medium">
                                {format(new Date(delegation.createdAt), 'MMM d, yyyy HH:mm')}
                              </span>
                            </div>
                            {delegation.expiresAt && (
                              <div>
                                <span className="text-gray-600">Expires:</span>{' '}
                                <span className="font-medium">
                                  {format(new Date(delegation.expiresAt), 'MMM d, yyyy HH:mm')}
                                </span>
                              </div>
                            )}
                            <div className="flex flex-wrap gap-1 mt-2">
                              {delegation.permissions.map((perm) => (
                                <span
                                  key={perm}
                                  className="px-2 py-0.5 text-xs bg-purple-100 text-purple-700 rounded"
                                >
                                  {perm}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Error Message */}
                    {task.error && (
                      <div>
                        <div className="text-xs font-semibold text-gray-500 uppercase mb-2">
                          Error
                        </div>
                        <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                          <p className="text-sm text-red-700">{task.error}</p>
                        </div>
                      </div>
                    )}

                    {/* Result */}
                    {task.result && (
                      <div>
                        <div className="text-xs font-semibold text-gray-500 uppercase mb-2">
                          Result
                        </div>
                        <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                          <pre className="text-xs text-gray-700 whitespace-pre-wrap">
                            {JSON.stringify(task.result, null, 2)}
                          </pre>
                        </div>
                      </div>
                    )}

                    {/* Metadata */}
                    {task.metadata && Object.keys(task.metadata).length > 0 && (
                      <div>
                        <div className="text-xs font-semibold text-gray-500 uppercase mb-2">
                          Metadata
                        </div>
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <pre className="text-xs text-gray-700 whitespace-pre-wrap">
                            {JSON.stringify(task.metadata, null, 2)}
                          </pre>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </Card>
        )
      })}
    </div>
  )
}
