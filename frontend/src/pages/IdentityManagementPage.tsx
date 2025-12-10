import React, { useState } from 'react'
import { useIdentities } from '../hooks/useIdentities'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

// Validation schemas
const userSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  role: z.enum(['ADMIN', 'USER', 'VIEWER']),
})

const teamSchema = z.object({
  name: z.string().min(2).max(100),
  description: z.string().min(10).max(500),
  members: z.array(z.string()).min(1),
})

const agentSchema = z.object({
  name: z.string().min(2).max(100),
  type: z.enum(['AGENT_SYSTEM', 'AGENT_WORKER']),
  capabilities: z.array(z.string()).min(1),
  owner: z.string().optional(),
})

type UserFormData = z.infer<typeof userSchema>
type TeamFormData = z.infer<typeof teamSchema>
type AgentFormData = z.infer<typeof agentSchema>

const IdentityManagementPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'user' | 'team' | 'agent'>('user')
  const [editingId, setEditingId] = useState<string | null>(null)

  const {
    identities,
    isLoading,
    error,
    createIdentity,
    updateIdentity,
    deleteIdentity,
  } = useIdentities(activeTab)

  // User form
  const userForm = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: { role: 'USER' },
  })

  // Team form
  const teamForm = useForm<TeamFormData>({
    resolver: zodResolver(teamSchema),
    defaultValues: { members: [] },
  })

  const [selectedMembers, setSelectedMembers] = useState<string[]>([])
  const [memberInput, setMemberInput] = useState('')

  // Agent form
  const agentForm = useForm<AgentFormData>({
    resolver: zodResolver(agentSchema),
    defaultValues: { type: 'AGENT_WORKER', capabilities: [] },
  })

  const [capabilities, setCapabilities] = useState<string[]>([])
  const [capabilityInput, setCapabilityInput] = useState('')

  const handleUserSubmit = async (data: UserFormData) => {
    try {
      if (editingId) {
        await updateIdentity.mutateAsync({ id: editingId, data: { ...data, type: 'HUMAN' } })
        setEditingId(null)
      } else {
        await createIdentity.mutateAsync({ ...data, type: 'HUMAN' })
      }
      userForm.reset()
    } catch (error) {
      console.error('Failed to save user:', error)
    }
  }

  const handleTeamSubmit = async (data: TeamFormData) => {
    try {
      const teamData = { ...data, members: selectedMembers, type: 'TEAM' }
      if (editingId) {
        await updateIdentity.mutateAsync({ id: editingId, data: teamData })
        setEditingId(null)
      } else {
        await createIdentity.mutateAsync(teamData)
      }
      teamForm.reset()
      setSelectedMembers([])
    } catch (error) {
      console.error('Failed to save team:', error)
    }
  }

  const handleAgentSubmit = async (data: AgentFormData) => {
    try {
      const agentData = { ...data, capabilities }
      if (editingId) {
        await updateIdentity.mutateAsync({ id: editingId, data: agentData })
        setEditingId(null)
      } else {
        await createIdentity.mutateAsync(agentData)
      }
      agentForm.reset()
      setCapabilities([])
    } catch (error) {
      console.error('Failed to save agent:', error)
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm('ARE YOU SURE YOU WANT TO DELETE THIS IDENTITY?')) {
      try {
        await deleteIdentity.mutateAsync(id)
      } catch (error) {
        console.error('Failed to delete:', error)
      }
    }
  }

  const handleEdit = (identity: any) => {
    setEditingId(identity.id)
    if (activeTab === 'user') {
      userForm.reset({
        name: identity.name,
        email: identity.email,
        role: identity.role,
      })
    } else if (activeTab === 'team') {
      teamForm.reset({
        name: identity.name,
        description: identity.description,
        members: identity.members || [],
      })
      setSelectedMembers(identity.members || [])
    } else if (activeTab === 'agent') {
      agentForm.reset({
        name: identity.name,
        type: identity.type,
        capabilities: identity.capabilities || [],
        owner: identity.owner,
      })
      setCapabilities(identity.capabilities || [])
    }
  }

  const addMember = () => {
    if (memberInput.trim() && !selectedMembers.includes(memberInput.trim())) {
      setSelectedMembers([...selectedMembers, memberInput.trim()])
      setMemberInput('')
    }
  }

  const removeMember = (member: string) => {
    setSelectedMembers(selectedMembers.filter((m) => m !== member))
  }

  const addCapability = () => {
    if (capabilityInput.trim() && !capabilities.includes(capabilityInput.trim())) {
      setCapabilities([...capabilities, capabilityInput.trim()])
      setCapabilityInput('')
    }
  }

  const removeCapability = (capability: string) => {
    setCapabilities(capabilities.filter((c) => c !== capability))
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="border-b border-gray-800 px-12 py-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="font-mono text-sm tracking-widest uppercase">LANFINITAS AI</div>
          <div className="flex gap-8 font-mono text-xs tracking-wider uppercase text-gray-400">
            <button className="hover:text-white transition-colors">LOGIN</button>
            <button className="hover:text-white transition-colors">SETTINGS</button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-12 py-16">
        {/* Title */}
        <h1 className="font-impact text-8xl tracking-tighter uppercase mb-16">
          IDENTITY MANAGEMENT
        </h1>

        {/* Tabs */}
        <div className="flex gap-12 mb-12 border-b border-gray-800">
          {(['user', 'team', 'agent'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => {
                setActiveTab(tab)
                setEditingId(null)
              }}
              className={`font-mono text-sm tracking-widest uppercase pb-4 transition-colors ${
                activeTab === tab
                  ? 'text-white border-b-2 border-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Forms */}
        <div className="mb-20">
          {activeTab === 'user' && (
            <form onSubmit={userForm.handleSubmit(handleUserSubmit)} className="space-y-8">
              <div className="font-mono text-sm tracking-wider uppercase text-gray-400 mb-8">
                {editingId ? 'EDIT USER' : 'CREATE NEW USER'}
              </div>

              <div>
                <label className="block font-mono text-xs tracking-wider uppercase text-gray-400 mb-2">
                  USERNAME
                </label>
                <input
                  {...userForm.register('name')}
                  className="font-mono bg-transparent border-0 border-b border-white focus:border-white focus:outline-none w-full py-2 placeholder:text-gray-600"
                  placeholder="username"
                />
                {userForm.formState.errors.name && (
                  <p className="font-mono text-xs text-red-500 mt-1">
                    {userForm.formState.errors.name.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block font-mono text-xs tracking-wider uppercase text-gray-400 mb-2">
                  EMAIL
                </label>
                <input
                  {...userForm.register('email')}
                  type="email"
                  className="font-mono bg-transparent border-0 border-b border-white focus:border-white focus:outline-none w-full py-2 placeholder:text-gray-600"
                  placeholder="email@example.com"
                />
                {userForm.formState.errors.email && (
                  <p className="font-mono text-xs text-red-500 mt-1">
                    {userForm.formState.errors.email.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block font-mono text-xs tracking-wider uppercase text-gray-400 mb-2">
                  ROLE
                </label>
                <select
                  {...userForm.register('role')}
                  className="font-mono bg-black border border-white px-4 py-2 focus:outline-none w-full"
                >
                  <option value="USER">USER</option>
                  <option value="ADMIN">ADMIN</option>
                  <option value="VIEWER">VIEWER</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={createIdentity.isPending || updateIdentity.isPending}
                className="font-mono border border-white px-8 py-3 hover:bg-white hover:text-black transition-colors uppercase tracking-wider text-sm disabled:opacity-50"
              >
                {editingId ? 'UPDATE' : 'CREATE'}
              </button>

              {editingId && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingId(null)
                    userForm.reset()
                  }}
                  className="font-mono border border-gray-600 px-8 py-3 hover:bg-gray-600 hover:text-white transition-colors uppercase tracking-wider text-sm ml-4"
                >
                  CANCEL
                </button>
              )}
            </form>
          )}

          {activeTab === 'team' && (
            <form onSubmit={teamForm.handleSubmit(handleTeamSubmit)} className="space-y-8">
              <div className="font-mono text-sm tracking-wider uppercase text-gray-400 mb-8">
                {editingId ? 'EDIT TEAM' : 'CREATE NEW TEAM'}
              </div>

              <div>
                <label className="block font-mono text-xs tracking-wider uppercase text-gray-400 mb-2">
                  TEAM NAME
                </label>
                <input
                  {...teamForm.register('name')}
                  className="font-mono bg-transparent border-0 border-b border-white focus:border-white focus:outline-none w-full py-2 placeholder:text-gray-600"
                  placeholder="team name"
                />
                {teamForm.formState.errors.name && (
                  <p className="font-mono text-xs text-red-500 mt-1">
                    {teamForm.formState.errors.name.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block font-mono text-xs tracking-wider uppercase text-gray-400 mb-2">
                  DESCRIPTION
                </label>
                <textarea
                  {...teamForm.register('description')}
                  rows={3}
                  className="font-mono bg-transparent border border-white focus:border-white focus:outline-none w-full p-2 placeholder:text-gray-600"
                  placeholder="team description"
                />
                {teamForm.formState.errors.description && (
                  <p className="font-mono text-xs text-red-500 mt-1">
                    {teamForm.formState.errors.description.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block font-mono text-xs tracking-wider uppercase text-gray-400 mb-2">
                  MEMBERS
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    value={memberInput}
                    onChange={(e) => setMemberInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addMember())}
                    className="font-mono bg-transparent border-0 border-b border-white focus:border-white focus:outline-none flex-1 py-2 placeholder:text-gray-600"
                    placeholder="member id or email"
                  />
                  <button
                    type="button"
                    onClick={addMember}
                    className="font-mono border border-white px-4 py-2 hover:bg-white hover:text-black transition-colors uppercase tracking-wider text-xs"
                  >
                    ADD
                  </button>
                </div>
                <div className="flex flex-wrap gap-2 mt-4">
                  {selectedMembers.map((member) => (
                    <div
                      key={member}
                      className="font-mono text-xs border border-white px-3 py-1 flex items-center gap-2"
                    >
                      {member}
                      <button
                        type="button"
                        onClick={() => removeMember(member)}
                        className="hover:text-red-500"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={createIdentity.isPending || updateIdentity.isPending}
                className="font-mono border border-white px-8 py-3 hover:bg-white hover:text-black transition-colors uppercase tracking-wider text-sm disabled:opacity-50"
              >
                {editingId ? 'UPDATE' : 'CREATE'}
              </button>

              {editingId && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingId(null)
                    teamForm.reset()
                    setSelectedMembers([])
                  }}
                  className="font-mono border border-gray-600 px-8 py-3 hover:bg-gray-600 hover:text-white transition-colors uppercase tracking-wider text-sm ml-4"
                >
                  CANCEL
                </button>
              )}
            </form>
          )}

          {activeTab === 'agent' && (
            <form onSubmit={agentForm.handleSubmit(handleAgentSubmit)} className="space-y-8">
              <div className="font-mono text-sm tracking-wider uppercase text-gray-400 mb-8">
                {editingId ? 'EDIT AGENT' : 'REGISTER NEW AGENT'}
              </div>

              <div>
                <label className="block font-mono text-xs tracking-wider uppercase text-gray-400 mb-2">
                  AGENT NAME
                </label>
                <input
                  {...agentForm.register('name')}
                  className="font-mono bg-transparent border-0 border-b border-white focus:border-white focus:outline-none w-full py-2 placeholder:text-gray-600"
                  placeholder="agent name"
                />
                {agentForm.formState.errors.name && (
                  <p className="font-mono text-xs text-red-500 mt-1">
                    {agentForm.formState.errors.name.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block font-mono text-xs tracking-wider uppercase text-gray-400 mb-2">
                  TYPE
                </label>
                <select
                  {...agentForm.register('type')}
                  className="font-mono bg-black border border-white px-4 py-2 focus:outline-none w-full"
                >
                  <option value="AGENT_WORKER">WORKER</option>
                  <option value="AGENT_SYSTEM">SYSTEM</option>
                </select>
              </div>

              <div>
                <label className="block font-mono text-xs tracking-wider uppercase text-gray-400 mb-2">
                  CAPABILITIES
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    value={capabilityInput}
                    onChange={(e) => setCapabilityInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCapability())}
                    className="font-mono bg-transparent border-0 border-b border-white focus:border-white focus:outline-none flex-1 py-2 placeholder:text-gray-600"
                    placeholder="capability name"
                  />
                  <button
                    type="button"
                    onClick={addCapability}
                    className="font-mono border border-white px-4 py-2 hover:bg-white hover:text-black transition-colors uppercase tracking-wider text-xs"
                  >
                    ADD
                  </button>
                </div>
                <div className="flex flex-wrap gap-2 mt-4">
                  {capabilities.map((capability) => (
                    <div
                      key={capability}
                      className="font-mono text-xs border border-white px-3 py-1 flex items-center gap-2"
                    >
                      {capability}
                      <button
                        type="button"
                        onClick={() => removeCapability(capability)}
                        className="hover:text-red-500"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-mono text-xs tracking-wider uppercase text-gray-400 mb-2">
                  OWNER (OPTIONAL)
                </label>
                <input
                  {...agentForm.register('owner')}
                  className="font-mono bg-transparent border-0 border-b border-white focus:border-white focus:outline-none w-full py-2 placeholder:text-gray-600"
                  placeholder="owner id"
                />
              </div>

              <button
                type="submit"
                disabled={createIdentity.isPending || updateIdentity.isPending}
                className="font-mono border border-white px-8 py-3 hover:bg-white hover:text-black transition-colors uppercase tracking-wider text-sm disabled:opacity-50"
              >
                {editingId ? 'UPDATE' : 'CREATE'}
              </button>

              {editingId && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingId(null)
                    agentForm.reset()
                    setCapabilities([])
                  }}
                  className="font-mono border border-gray-600 px-8 py-3 hover:bg-gray-600 hover:text-white transition-colors uppercase tracking-wider text-sm ml-4"
                >
                  CANCEL
                </button>
              )}
            </form>
          )}
        </div>

        {/* Divider */}
        <div className="border-t border-gray-800 mb-12"></div>

        {/* List */}
        <div>
          <h2 className="font-mono text-sm tracking-wider uppercase text-gray-400 mb-8">
            RECENT {activeTab.toUpperCase()}S
          </h2>

          {isLoading ? (
            <div className="font-mono text-sm text-gray-400">LOADING...</div>
          ) : error ? (
            <div className="font-mono text-sm text-red-500">
              ERROR: {error instanceof Error ? error.message : 'UNKNOWN ERROR'}
            </div>
          ) : identities.length === 0 ? (
            <div className="font-mono text-sm text-gray-400">NO {activeTab.toUpperCase()}S FOUND</div>
          ) : (
            <table className="font-mono w-full">
              <thead>
                <tr className="text-left text-xs tracking-wider uppercase text-gray-400 border-b border-gray-800">
                  <th className="pb-4">NAME</th>
                  {activeTab === 'user' && (
                    <>
                      <th className="pb-4">EMAIL</th>
                      <th className="pb-4">ROLE</th>
                    </>
                  )}
                  {activeTab === 'team' && (
                    <>
                      <th className="pb-4">DESCRIPTION</th>
                      <th className="pb-4">MEMBERS</th>
                    </>
                  )}
                  {activeTab === 'agent' && (
                    <>
                      <th className="pb-4">TYPE</th>
                      <th className="pb-4">CAPABILITIES</th>
                    </>
                  )}
                  <th className="pb-4 text-right">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {identities.map((identity) => (
                  <tr key={identity.id} className="border-b border-gray-800">
                    <td className="py-4">{identity.name}</td>
                    {activeTab === 'user' && (
                      <>
                        <td className="py-4">{identity.email}</td>
                        <td className="py-4">{identity.role}</td>
                      </>
                    )}
                    {activeTab === 'team' && (
                      <>
                        <td className="py-4 max-w-xs truncate">{identity.description}</td>
                        <td className="py-4">{identity.members?.length || 0}</td>
                      </>
                    )}
                    {activeTab === 'agent' && (
                      <>
                        <td className="py-4">{identity.type?.replace('AGENT_', '')}</td>
                        <td className="py-4">{identity.capabilities?.length || 0}</td>
                      </>
                    )}
                    <td className="py-4 text-right">
                      <button
                        onClick={() => handleEdit(identity)}
                        className="hover:text-gray-400 mr-4"
                      >
                        EDIT
                      </button>
                      <button
                        onClick={() => handleDelete(identity.id)}
                        className="hover:text-red-500"
                      >
                        DELETE
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </div>
  )
}

export default IdentityManagementPage
