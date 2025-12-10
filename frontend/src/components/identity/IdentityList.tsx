import React, { useState } from 'react'
import { Card } from '../ui/card'
import { Button } from '../ui/button'
import {
  Edit2,
  Trash2,
  User,
  Users,
  Bot,
  Mail,
  Shield,
  Clock,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Loader2,
} from 'lucide-react'
import { Identity } from '../../hooks/useIdentities'
import { format } from 'date-fns'

interface IdentityListProps {
  identities: Identity[]
  type: 'user' | 'team' | 'agent'
  isLoading: boolean
  error: any
  onEdit: (id: string, data: any) => void
  onDelete: (id: string) => void
}

export const IdentityList: React.FC<IdentityListProps> = ({
  identities,
  type,
  isLoading,
  error,
  onEdit,
  onDelete,
}) => {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())

  const toggleExpanded = (id: string) => {
    const newExpanded = new Set(expandedIds)
    if (newExpanded.has(id)) {
      newExpanded.delete(id)
    } else {
      newExpanded.add(id)
    }
    setExpandedIds(newExpanded)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        <span className="ml-3 text-gray-600">Loading...</span>
      </div>
    )
  }

  if (error) {
    return (
      <Card className="p-6 bg-red-50 border-red-200">
        <div className="flex items-center gap-3 text-red-700">
          <AlertCircle className="h-5 w-5" />
          <div>
            <h4 className="font-semibold">Error Loading Data</h4>
            <p className="text-sm">{error.message || 'An unexpected error occurred'}</p>
          </div>
        </div>
      </Card>
    )
  }

  if (!identities || identities.length === 0) {
    return (
      <Card className="p-12 text-center">
        <div className="flex flex-col items-center gap-3 text-gray-500">
          {type === 'user' && <User className="h-12 w-12" />}
          {type === 'team' && <Users className="h-12 w-12" />}
          {type === 'agent' && <Bot className="h-12 w-12" />}
          <h4 className="text-lg font-semibold">No {type}s found</h4>
          <p className="text-sm">
            Create your first {type} to get started
          </p>
        </div>
      </Card>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-4">
      {identities.map((identity) => {
        const isExpanded = expandedIds.has(identity.id)

        return (
          <Card
            key={identity.id}
            className="p-4 hover:shadow-lg transition-shadow duration-200"
          >
            <div className="flex items-start justify-between gap-4">
              {/* Icon and Main Info */}
              <div className="flex items-start gap-3 flex-1">
                {/* Icon */}
                <div
                  className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                    type === 'user'
                      ? 'bg-blue-100 text-blue-600'
                      : type === 'team'
                      ? 'bg-green-100 text-green-600'
                      : 'bg-purple-100 text-purple-600'
                  }`}
                >
                  {type === 'user' && <User className="h-5 w-5" />}
                  {type === 'team' && <Users className="h-5 w-5" />}
                  {type === 'agent' && <Bot className="h-5 w-5" />}
                </div>

                {/* Details */}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-lg font-semibold text-gray-900">
                      {identity.name}
                    </h4>
                    {identity.role && (
                      <span
                        className={`px-2 py-0.5 text-xs font-medium rounded ${
                          identity.role === 'ADMIN'
                            ? 'bg-red-100 text-red-700'
                            : identity.role === 'USER'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {identity.role}
                      </span>
                    )}
                    {identity.type && (
                      <span className="px-2 py-0.5 text-xs font-medium rounded bg-gray-100 text-gray-600">
                        {identity.type.replace('AGENT_', '')}
                      </span>
                    )}
                  </div>

                  {/* Email or Description */}
                  {identity.email && (
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                      <Mail className="h-4 w-4" />
                      <span>{identity.email}</span>
                    </div>
                  )}
                  {identity.description && (
                    <p className="text-sm text-gray-600 mb-2">{identity.description}</p>
                  )}

                  {/* Capabilities (for agents) */}
                  {identity.capabilities && identity.capabilities.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-2">
                      {identity.capabilities.slice(0, 3).map((capability) => (
                        <span
                          key={capability}
                          className="px-2 py-0.5 text-xs bg-purple-50 text-purple-700 rounded"
                        >
                          {capability.replace(/_/g, ' ')}
                        </span>
                      ))}
                      {identity.capabilities.length > 3 && (
                        <span className="px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded">
                          +{identity.capabilities.length - 3} more
                        </span>
                      )}
                    </div>
                  )}

                  {/* Members count (for teams) */}
                  {identity.members && identity.members.length > 0 && (
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">{identity.members.length}</span> members
                    </div>
                  )}

                  {/* Timestamp */}
                  <div className="flex items-center gap-2 text-xs text-gray-500 mt-2">
                    <Clock className="h-3 w-3" />
                    <span>
                      Created {format(new Date(identity.createdAt), 'MMM dd, yyyy')}
                    </span>
                  </div>

                  {/* Expanded Details */}
                  {isExpanded && (
                    <div className="mt-4 pt-4 border-t border-gray-200 space-y-2">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium text-gray-700">ID:</span>
                          <span className="ml-2 text-gray-600 font-mono text-xs">
                            {identity.id}
                          </span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">Type:</span>
                          <span className="ml-2 text-gray-600">{identity.type}</span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">Created:</span>
                          <span className="ml-2 text-gray-600">
                            {format(new Date(identity.createdAt), 'PPpp')}
                          </span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">Updated:</span>
                          <span className="ml-2 text-gray-600">
                            {format(new Date(identity.updatedAt), 'PPpp')}
                          </span>
                        </div>
                      </div>

                      {/* Full Capabilities List */}
                      {identity.capabilities && identity.capabilities.length > 0 && (
                        <div>
                          <span className="font-medium text-gray-700 text-sm">
                            All Capabilities:
                          </span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {identity.capabilities.map((capability) => (
                              <span
                                key={capability}
                                className="px-2 py-0.5 text-xs bg-purple-50 text-purple-700 rounded"
                              >
                                {capability.replace(/_/g, ' ')}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Owner Info (for agents) */}
                      {identity.ownerId && (
                        <div>
                          <span className="font-medium text-gray-700 text-sm">Owner ID:</span>
                          <span className="ml-2 text-gray-600 font-mono text-xs">
                            {identity.ownerId}
                          </span>
                        </div>
                      )}

                      {/* Members (for teams) */}
                      {identity.members && identity.members.length > 0 && (
                        <div>
                          <span className="font-medium text-gray-700 text-sm">Members:</span>
                          <div className="mt-1 space-y-1">
                            {identity.members.map((memberId) => (
                              <div
                                key={memberId}
                                className="text-xs text-gray-600 font-mono bg-gray-50 px-2 py-1 rounded"
                              >
                                {memberId}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-start gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => toggleExpanded(identity.id)}
                  className="h-8 w-8 p-0"
                >
                  {isExpanded ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEdit(identity.id, identity)}
                  className="h-8 w-8 p-0"
                >
                  <Edit2 className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onDelete(identity.id)}
                  className="h-8 w-8 p-0 text-red-600 hover:bg-red-50 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>
        )
      })}
    </div>
  )
}
