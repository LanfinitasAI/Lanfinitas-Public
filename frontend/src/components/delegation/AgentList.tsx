import React from 'react'
import { Bot, Circle, Loader2 } from 'lucide-react'
import { Agent } from '../../hooks/useDelegation'

interface AgentListProps {
  agents: Agent[]
  selectedAgentId: string | null
  onSelectAgent: (agentId: string) => void
  isLoading: boolean
}

export const AgentList: React.FC<AgentListProps> = ({
  agents,
  selectedAgentId,
  onSelectAgent,
  isLoading,
}) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
      </div>
    )
  }

  if (agents.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <Bot className="h-12 w-12 mx-auto mb-2 text-gray-400" />
        <p className="text-sm">No agents available</p>
      </div>
    )
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'AVAILABLE':
        return 'text-green-500'
      case 'BUSY':
        return 'text-yellow-500'
      case 'OFFLINE':
        return 'text-gray-400'
      default:
        return 'text-gray-400'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'AVAILABLE':
        return 'Available'
      case 'BUSY':
        return 'Busy'
      case 'OFFLINE':
        return 'Offline'
      default:
        return status
    }
  }

  return (
    <div className="space-y-2">
      {agents.map((agent) => (
        <button
          key={agent.id}
          onClick={() => onSelectAgent(agent.id)}
          className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
            selectedAgentId === agent.id
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
          }`}
        >
          <div className="flex items-start gap-3">
            <div
              className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                agent.type === 'AGENT_SYSTEM'
                  ? 'bg-purple-100 text-purple-600'
                  : 'bg-blue-100 text-blue-600'
              }`}
            >
              <Bot className="h-5 w-5" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-semibold text-gray-900 truncate">{agent.name}</h4>
                <Circle
                  className={`h-2 w-2 fill-current ${getStatusColor(agent.status)}`}
                />
              </div>

              <div className="text-xs text-gray-600 mb-1">
                {agent.type.replace('AGENT_', '')}
              </div>

              <div className="text-xs font-medium" style={{ color: getStatusColor(agent.status).replace('text-', '') }}>
                {getStatusLabel(agent.status)}
              </div>

              {agent.capabilities && agent.capabilities.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {agent.capabilities.slice(0, 2).map((capability) => (
                    <span
                      key={capability}
                      className="px-1.5 py-0.5 text-xs bg-gray-100 text-gray-700 rounded"
                    >
                      {capability.replace(/_/g, ' ')}
                    </span>
                  ))}
                  {agent.capabilities.length > 2 && (
                    <span className="px-1.5 py-0.5 text-xs bg-gray-100 text-gray-600 rounded">
                      +{agent.capabilities.length - 2}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        </button>
      ))}
    </div>
  )
}
