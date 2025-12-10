import React, { useMemo } from 'react'
import { Card } from '../ui/card'
import {
  Clock,
  CheckCircle2,
  XCircle,
  Shield,
  ShieldOff,
  Plus,
  AlertCircle,
  Loader2,
  Activity,
  Bot,
  User,
} from 'lucide-react'
import { Task, Delegation, Agent } from '../../hooks/useDelegation'
import { format, formatDistanceToNow } from 'date-fns'

interface ActivityLogProps {
  tasks: Task[]
  delegations: Delegation[]
  agents: Agent[]
  isLoading: boolean
}

type ActivityEvent = {
  id: string
  type:
    | 'task_created'
    | 'task_assigned'
    | 'task_started'
    | 'task_completed'
    | 'task_failed'
    | 'task_cancelled'
    | 'delegation_created'
    | 'delegation_revoked'
    | 'delegation_expired'
  timestamp: Date
  title: string
  description: string
  icon: React.ReactNode
  color: string
  metadata?: Record<string, any>
}

export const ActivityLog: React.FC<ActivityLogProps> = ({
  tasks,
  delegations,
  agents,
  isLoading,
}) => {
  const getAgentName = (agentId?: string): string => {
    if (!agentId) return 'Unknown'
    const agent = agents.find((a) => a.id === agentId)
    return agent?.name || agentId
  }

  const activities = useMemo(() => {
    const events: ActivityEvent[] = []

    // Task events
    tasks.forEach((task) => {
      // Task created
      events.push({
        id: `task-created-${task.id}`,
        type: 'task_created',
        timestamp: new Date(task.createdAt),
        title: 'Task Created',
        description: `"${task.name}" created by ${task.createdBy}`,
        icon: <Plus className="h-4 w-4" />,
        color: 'text-blue-600 bg-blue-100',
        metadata: { taskId: task.id, priority: task.priority },
      })

      // Task assigned
      if (task.assignedAgentId) {
        const assignTime = task.startedAt || task.createdAt
        events.push({
          id: `task-assigned-${task.id}`,
          type: 'task_assigned',
          timestamp: new Date(assignTime),
          title: 'Task Assigned',
          description: `"${task.name}" assigned to ${getAgentName(task.assignedAgentId)}`,
          icon: <Bot className="h-4 w-4" />,
          color: 'text-purple-600 bg-purple-100',
          metadata: { taskId: task.id, agentId: task.assignedAgentId },
        })
      }

      // Task started
      if (task.startedAt) {
        events.push({
          id: `task-started-${task.id}`,
          type: 'task_started',
          timestamp: new Date(task.startedAt),
          title: 'Task Started',
          description: `"${task.name}" execution began`,
          icon: <Loader2 className="h-4 w-4 animate-spin" />,
          color: 'text-yellow-600 bg-yellow-100',
          metadata: { taskId: task.id },
        })
      }

      // Task completed
      if (task.status === 'COMPLETED' && task.completedAt) {
        events.push({
          id: `task-completed-${task.id}`,
          type: 'task_completed',
          timestamp: new Date(task.completedAt),
          title: 'Task Completed',
          description: `"${task.name}" completed successfully`,
          icon: <CheckCircle2 className="h-4 w-4" />,
          color: 'text-green-600 bg-green-100',
          metadata: { taskId: task.id },
        })
      }

      // Task failed
      if (task.status === 'FAILED' && task.completedAt) {
        events.push({
          id: `task-failed-${task.id}`,
          type: 'task_failed',
          timestamp: new Date(task.completedAt),
          title: 'Task Failed',
          description: `"${task.name}" execution failed${task.error ? ': ' + task.error : ''}`,
          icon: <XCircle className="h-4 w-4" />,
          color: 'text-red-600 bg-red-100',
          metadata: { taskId: task.id, error: task.error },
        })
      }

      // Task cancelled
      if (task.status === 'CANCELLED') {
        const cancelTime = task.completedAt || task.createdAt
        events.push({
          id: `task-cancelled-${task.id}`,
          type: 'task_cancelled',
          timestamp: new Date(cancelTime),
          title: 'Task Cancelled',
          description: `"${task.name}" was cancelled`,
          icon: <XCircle className="h-4 w-4" />,
          color: 'text-gray-600 bg-gray-100',
          metadata: { taskId: task.id },
        })
      }
    })

    // Delegation events
    delegations.forEach((delegation) => {
      const task = tasks.find((t) => t.id === delegation.taskId)
      const taskName = task?.name || 'Unknown Task'

      // Delegation created
      events.push({
        id: `delegation-created-${delegation.id}`,
        type: 'delegation_created',
        timestamp: new Date(delegation.createdAt),
        title: 'Delegation Created',
        description: `"${taskName}" delegated to ${getAgentName(delegation.agentId)} by ${
          delegation.delegatedBy
        }`,
        icon: <Shield className="h-4 w-4" />,
        color: 'text-purple-600 bg-purple-100',
        metadata: {
          delegationId: delegation.id,
          permissions: delegation.permissions,
        },
      })

      // Delegation revoked
      if (delegation.status === 'REVOKED' && delegation.revokedAt) {
        events.push({
          id: `delegation-revoked-${delegation.id}`,
          type: 'delegation_revoked',
          timestamp: new Date(delegation.revokedAt),
          title: 'Delegation Revoked',
          description: `Delegation for "${taskName}" was revoked`,
          icon: <ShieldOff className="h-4 w-4" />,
          color: 'text-orange-600 bg-orange-100',
          metadata: { delegationId: delegation.id },
        })
      }

      // Delegation expired
      if (delegation.status === 'EXPIRED' && delegation.expiresAt) {
        events.push({
          id: `delegation-expired-${delegation.id}`,
          type: 'delegation_expired',
          timestamp: new Date(delegation.expiresAt),
          title: 'Delegation Expired',
          description: `Delegation for "${taskName}" has expired`,
          icon: <AlertCircle className="h-4 w-4" />,
          color: 'text-gray-600 bg-gray-100',
          metadata: { delegationId: delegation.id },
        })
      }
    })

    // Sort by timestamp (most recent first)
    return events.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
  }, [tasks, delegations, agents])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    )
  }

  if (activities.length === 0) {
    return (
      <Card className="p-8 bg-gray-50">
        <div className="text-center text-gray-500">
          <Activity className="h-16 w-16 mx-auto mb-4 text-gray-400" />
          <p className="text-lg font-medium">No activity yet</p>
          <p className="text-sm mt-2">Events will appear here as you work</p>
        </div>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* Activity Stream */}
      <div className="relative">
        {/* Timeline Line */}
        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200" />

        {/* Activity Items */}
        <div className="space-y-4">
          {activities.map((activity, index) => (
            <div key={activity.id} className="relative pl-16">
              {/* Timeline Dot */}
              <div
                className={`absolute left-4 top-2 h-5 w-5 rounded-full flex items-center justify-center ${activity.color}`}
              >
                {activity.icon}
              </div>

              {/* Activity Card */}
              <Card className="p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-semibold text-gray-900">{activity.title}</h4>
                    <p className="text-sm text-gray-600 mt-1">{activity.description}</p>

                    {/* Metadata */}
                    {activity.metadata && (
                      <div className="mt-2 space-y-1">
                        {activity.metadata.priority && (
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-500">Priority:</span>
                            <span className="text-xs font-medium">{activity.metadata.priority}</span>
                          </div>
                        )}

                        {activity.metadata.permissions && (
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-500">Permissions:</span>
                            <div className="flex flex-wrap gap-1">
                              {(activity.metadata.permissions as string[]).map((perm) => (
                                <span
                                  key={perm}
                                  className="px-1.5 py-0.5 text-xs bg-purple-100 text-purple-700 rounded"
                                >
                                  {perm}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {activity.metadata.error && (
                          <div className="flex items-start gap-2 mt-2">
                            <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                            <span className="text-xs text-red-600">
                              {activity.metadata.error as string}
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Timestamp */}
                  <div className="text-right flex-shrink-0">
                    <div className="text-xs text-gray-500">
                      {formatDistanceToNow(activity.timestamp, { addSuffix: true })}
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      {format(activity.timestamp, 'MMM d, HH:mm:ss')}
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          ))}
        </div>
      </div>

      {/* Activity Stats */}
      <Card className="p-4 bg-gradient-to-br from-gray-50 to-gray-100">
        <h4 className="text-sm font-semibold text-gray-900 mb-3">Activity Summary</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <div className="text-2xl font-bold text-blue-600">
              {activities.filter((a) => a.type === 'task_created').length}
            </div>
            <div className="text-xs text-gray-600">Tasks Created</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-600">
              {activities.filter((a) => a.type === 'task_completed').length}
            </div>
            <div className="text-xs text-gray-600">Completed</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-purple-600">
              {activities.filter((a) => a.type === 'delegation_created').length}
            </div>
            <div className="text-xs text-gray-600">Delegations</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-red-600">
              {activities.filter((a) => a.type === 'task_failed').length}
            </div>
            <div className="text-xs text-gray-600">Failed Tasks</div>
          </div>
        </div>
      </Card>
    </div>
  )
}
