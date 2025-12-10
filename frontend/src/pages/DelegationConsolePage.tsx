import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  useDelegation,
  Agent,
  Task,
  CreateTaskData,
} from '../hooks/useDelegation'

/**
 * Delegation Console Page - Minimalist Black/White Design
 *
 * Features:
 * - Agent list with real-time status
 * - Task creation with priority levels
 * - Delegation authorization
 * - Real-time task monitoring
 * - Minimalist aesthetic with Impact and Typewriter fonts
 */

// Zod validation schemas
const taskSchema = z.object({
  name: z.string().min(2, 'NAME TOO SHORT').max(100, 'NAME TOO LONG'),
  description: z.string().min(10, 'DESCRIPTION TOO SHORT').max(500, 'DESCRIPTION TOO LONG'),
  priority: z.enum(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'BACKGROUND']),
})

type TaskFormData = z.infer<typeof taskSchema>

const DelegationConsolePage: React.FC = () => {
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null)
  const [delegatingTaskId, setDelegatingTaskId] = useState<string | null>(null)
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>(['READ', 'WRITE'])

  const {
    agents,
    tasks,
    delegations,
    isLoading,
    createTask,
    createDelegation,
    revokeDelegation,
  } = useDelegation()

  const taskForm = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      priority: 'MEDIUM',
    },
  })

  // Status indicator mapping
  const getStatusIndicator = (status: Agent['status']) => {
    switch (status) {
      case 'AVAILABLE':
        return '○' // Empty circle
      case 'BUSY':
        return '●' // Filled circle
      case 'OFFLINE':
        return '○'
      default:
        return '○'
    }
  }

  const getTaskStatusIndicator = (status: Task['status']) => {
    switch (status) {
      case 'PENDING':
        return '○'
      case 'ASSIGNED':
        return '◐'
      case 'IN_PROGRESS':
        return '●'
      case 'COMPLETED':
        return '✓'
      case 'FAILED':
        return '✗'
      case 'CANCELLED':
        return '○'
      default:
        return '○'
    }
  }

  const getTaskProgress = (task: Task): number => {
    switch (task.status) {
      case 'PENDING':
        return 0
      case 'ASSIGNED':
        return 25
      case 'IN_PROGRESS':
        return 60
      case 'COMPLETED':
        return 100
      case 'FAILED':
        return 0
      default:
        return 0
    }
  }

  const handleCreateTask = async (data: TaskFormData) => {
    try {
      const taskData: CreateTaskData = {
        name: data.name,
        description: data.description,
        priority: data.priority,
      }
      await createTask.mutateAsync(taskData)
      taskForm.reset()
    } catch (error) {
      console.error('Failed to create task:', error)
    }
  }

  const handleDelegateTask = async (taskId: string) => {
    if (!selectedAgentId) {
      alert('PLEASE SELECT AN AGENT')
      return
    }

    try {
      await createDelegation.mutateAsync({
        taskId,
        agentId: selectedAgentId,
        permissions: selectedPermissions,
      })
      setDelegatingTaskId(null)
    } catch (error) {
      console.error('Failed to delegate task:', error)
    }
  }

  const handleRevokeTask = async (taskId: string) => {
    const delegation = delegations?.find((d) => d.taskId === taskId && d.status === 'ACTIVE')
    if (!delegation) return

    if (window.confirm('REVOKE DELEGATION?')) {
      try {
        await revokeDelegation.mutateAsync(delegation.id)
      } catch (error) {
        console.error('Failed to revoke delegation:', error)
      }
    }
  }

  const togglePermission = (permission: string) => {
    setSelectedPermissions((prev) =>
      prev.includes(permission)
        ? prev.filter((p) => p !== permission)
        : [...prev, permission]
    )
  }

  // Filter tasks
  const activeTasks = tasks?.filter(
    (t) => t.status === 'IN_PROGRESS' || t.status === 'ASSIGNED'
  ) || []
  const completedTasks = tasks?.filter((t) => t.status === 'COMPLETED') || []
  const pendingTasks = tasks?.filter((t) => t.status === 'PENDING') || []

  return (
    <div className="min-h-screen bg-black text-white p-12">
      {/* Header */}
      <div className="mb-16">
        <div className="mb-4">
          <span className="font-mono text-xs tracking-widest uppercase text-gray-400">
            LANFINITAS AI
          </span>
        </div>
        <h1 className="font-impact text-8xl tracking-tighter uppercase mb-4">
          DELEGATION CONSOLE
        </h1>
        <p className="font-mono text-sm tracking-wider uppercase text-gray-400">
          MANAGE AGENT DELEGATIONS / MONITOR TASK EXECUTION
        </p>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-12 gap-12">
        {/* Left Sidebar - Agent List */}
        <div className="col-span-3 space-y-8">
          <div>
            <h2 className="font-mono text-sm tracking-widest uppercase text-gray-400 mb-6">
              AGENTS
            </h2>

            {isLoading ? (
              <div className="font-mono text-xs text-gray-500">LOADING...</div>
            ) : agents && agents.length > 0 ? (
              <div className="space-y-4">
                {agents.map((agent) => (
                  <button
                    key={agent.id}
                    onClick={() => setSelectedAgentId(agent.id)}
                    className={`font-mono text-sm w-full text-left p-4 border transition-colors ${
                      selectedAgentId === agent.id
                        ? 'border-white bg-white text-black'
                        : 'border-gray-800 hover:border-gray-600'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="uppercase tracking-wider">{agent.name}</span>
                      <span className="text-xs">
                        {getStatusIndicator(agent.status)} {agent.status}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 uppercase">
                      {agent.capabilities.slice(0, 2).join(', ')}
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="font-mono text-xs text-gray-500">NO AGENTS AVAILABLE</div>
            )}
          </div>

          {/* Statistics */}
          <div className="pt-8 border-t border-gray-800">
            <div className="font-mono text-xs space-y-3 uppercase">
              <div className="flex justify-between">
                <span className="text-gray-400">TOTAL AGENTS</span>
                <span>{agents?.length || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">AVAILABLE</span>
                <span>{agents?.filter((a) => a.status === 'AVAILABLE').length || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">ACTIVE TASKS</span>
                <span>{activeTasks.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">COMPLETED</span>
                <span>{completedTasks.length}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - Task Creation & Monitor */}
        <div className="col-span-9 space-y-12">
          {/* Create Task Section */}
          <div>
            <h2 className="font-mono text-sm tracking-widest uppercase text-gray-400 mb-6">
              CREATE TASK
            </h2>

            <form onSubmit={taskForm.handleSubmit(handleCreateTask)} className="space-y-6">
              {/* Task Name */}
              <div>
                <label className="font-mono text-xs tracking-wider uppercase text-gray-400 block mb-2">
                  TASK NAME
                </label>
                <input
                  {...taskForm.register('name')}
                  className="font-mono bg-transparent border-0 border-b border-white focus:border-white focus:outline-none w-full py-2 placeholder:text-gray-600 uppercase tracking-wider"
                  placeholder="ENTER TASK NAME"
                />
                {taskForm.formState.errors.name && (
                  <p className="font-mono text-xs text-red-500 mt-1 uppercase">
                    {taskForm.formState.errors.name.message}
                  </p>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="font-mono text-xs tracking-wider uppercase text-gray-400 block mb-2">
                  DESCRIPTION
                </label>
                <textarea
                  {...taskForm.register('description')}
                  rows={3}
                  className="font-mono bg-transparent border border-white focus:border-white focus:outline-none w-full p-3 placeholder:text-gray-600 uppercase tracking-wider resize-none"
                  placeholder="TASK DESCRIPTION"
                />
                {taskForm.formState.errors.description && (
                  <p className="font-mono text-xs text-red-500 mt-1 uppercase">
                    {taskForm.formState.errors.description.message}
                  </p>
                )}
              </div>

              {/* Priority */}
              <div>
                <label className="font-mono text-xs tracking-wider uppercase text-gray-400 block mb-3">
                  PRIORITY
                </label>
                <div className="flex gap-4">
                  {(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'BACKGROUND'] as const).map((priority) => (
                    <label
                      key={priority}
                      className="font-mono text-xs uppercase tracking-wider cursor-pointer flex items-center gap-2"
                    >
                      <input
                        type="radio"
                        {...taskForm.register('priority')}
                        value={priority}
                        className="appearance-none w-4 h-4 border border-white checked:bg-white"
                      />
                      {priority}
                    </label>
                  ))}
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={createTask.isPending}
                className="font-mono border border-white px-8 py-3 hover:bg-white hover:text-black transition-colors uppercase tracking-wider text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {createTask.isPending ? 'CREATING...' : 'CREATE TASK'}
              </button>
            </form>
          </div>

          {/* Delegation Section */}
          {selectedAgentId && pendingTasks.length > 0 && (
            <div className="pt-12 border-t border-gray-800">
              <h2 className="font-mono text-sm tracking-widest uppercase text-gray-400 mb-6">
                DELEGATE TO {agents?.find((a) => a.id === selectedAgentId)?.name}
              </h2>

              {/* Permissions */}
              <div className="mb-6">
                <label className="font-mono text-xs tracking-wider uppercase text-gray-400 block mb-3">
                  PERMISSIONS
                </label>
                <div className="flex gap-4">
                  {['READ', 'WRITE', 'EXECUTE', 'DELETE'].map((permission) => (
                    <label
                      key={permission}
                      className="font-mono text-xs uppercase tracking-wider cursor-pointer flex items-center gap-2"
                    >
                      <input
                        type="checkbox"
                        checked={selectedPermissions.includes(permission)}
                        onChange={() => togglePermission(permission)}
                        className="appearance-none w-4 h-4 border border-white checked:bg-white"
                      />
                      {permission}
                    </label>
                  ))}
                </div>
              </div>

              {/* Pending Tasks */}
              <div className="space-y-3">
                {pendingTasks.map((task) => (
                  <div
                    key={task.id}
                    className="font-mono text-sm p-4 border border-gray-800 flex justify-between items-center"
                  >
                    <div>
                      <div className="uppercase tracking-wider mb-1">{task.name}</div>
                      <div className="text-xs text-gray-400 uppercase">{task.priority}</div>
                    </div>
                    <button
                      onClick={() => handleDelegateTask(task.id)}
                      disabled={createDelegation.isPending}
                      className="border border-white px-4 py-2 hover:bg-white hover:text-black transition-colors uppercase tracking-wider text-xs disabled:opacity-50"
                    >
                      DELEGATE
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Active Tasks Monitor */}
          <div className="pt-12 border-t border-gray-800">
            <h2 className="font-mono text-sm tracking-widest uppercase text-gray-400 mb-6">
              ACTIVE TASKS
            </h2>

            {activeTasks.length > 0 ? (
              <div className="space-y-3">
                {activeTasks.map((task) => {
                  const delegation = delegations?.find(
                    (d) => d.taskId === task.id && d.status === 'ACTIVE'
                  )
                  const agent = agents?.find((a) => a.id === task.assignedAgentId)
                  const progress = getTaskProgress(task)

                  return (
                    <div
                      key={task.id}
                      className="font-mono text-sm p-4 border border-gray-800"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-1">
                            <span className="uppercase tracking-wider">{task.name}</span>
                            <span className="text-xs text-gray-400">
                              {getTaskStatusIndicator(task.status)} {task.status}
                            </span>
                          </div>
                          <div className="text-xs text-gray-500 uppercase">
                            {agent ? `AGENT: ${agent.name}` : 'UNASSIGNED'}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl mb-1">{progress}%</div>
                          {delegation && (
                            <button
                              onClick={() => handleRevokeTask(task.id)}
                              className="text-xs uppercase tracking-wider hover:text-red-500"
                            >
                              REVOKE
                            </button>
                          )}
                        </div>
                      </div>
                      <div className="text-xs text-gray-400 uppercase">
                        PRIORITY: {task.priority}
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="font-mono text-xs text-gray-500 uppercase">
                NO ACTIVE TASKS
              </div>
            )}
          </div>

          {/* Completed Tasks */}
          {completedTasks.length > 0 && (
            <div className="pt-12 border-t border-gray-800">
              <h2 className="font-mono text-sm tracking-widest uppercase text-gray-400 mb-6">
                COMPLETED TASKS
              </h2>

              <div className="space-y-2">
                {completedTasks.slice(0, 5).map((task) => {
                  const agent = agents?.find((a) => a.id === task.assignedAgentId)

                  return (
                    <div
                      key={task.id}
                      className="font-mono text-xs p-3 border border-gray-900 flex justify-between items-center"
                    >
                      <div>
                        <span className="uppercase tracking-wider">{task.name}</span>
                        <span className="text-gray-500 ml-3">
                          {agent ? agent.name : 'UNASSIGNED'}
                        </span>
                      </div>
                      <span className="text-gray-400">✓ 100%</span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default DelegationConsolePage
