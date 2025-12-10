# Delegation Console Components

This directory contains all components for the Delegation Console, which enables users to create tasks, delegate them to AI agents, monitor execution, and review activity logs.

## Component Overview

### 1. DelegationConsolePage (`/frontend/src/pages/DelegationConsolePage.tsx`)

**Main console page with comprehensive delegation management interface.**

**Features:**
- Dashboard statistics (Total Agents, Available, Running Tasks, Completed, Failed, Active Delegations)
- Three-panel layout: Agent List (left), Task Management (right tabs)
- Tab navigation: Create & Delegate, Task Monitor, Activity Logs
- Real-time data updates via polling (3-second intervals)
- Error handling and loading states

**Layout:**
```
┌─────────────────────────────────────────────────────┐
│  Header: "Delegation Console" + Create Task Button │
├─────────────────────────────────────────────────────┤
│  Statistics Cards (6 metrics)                       │
├──────────────┬──────────────────────────────────────┤
│              │  Tabs: Create | Monitor | Logs       │
│  Agent List  ├──────────────────────────────────────┤
│  (Sidebar)   │  Tab Content                         │
│              │  - TaskCreationForm + DelegationPanel│
│              │  - TaskMonitor                       │
│              │  - ActivityLog                       │
└──────────────┴──────────────────────────────────────┘
```

**Usage:**
```tsx
import { DelegationConsolePage } from '@/pages'

// Route configuration
{
  path: '/delegation',
  element: (
    <ProtectedRoute>
      <DelegationConsolePage />
    </ProtectedRoute>
  ),
}
```

---

### 2. AgentList (`AgentList.tsx`)

**Displays available agents in a selectable card list.**

**Props:**
```typescript
interface AgentListProps {
  agents: Agent[]
  selectedAgentId: string | null
  onSelectAgent: (agentId: string) => void
  isLoading: boolean
}
```

**Features:**
- Agent cards with name, type, and status
- Status indicators:
  - 🟢 Green: AVAILABLE
  - 🟡 Yellow: BUSY
  - ⚪ Gray: OFFLINE
- Capability chips (first 2 + count)
- Click to select agent (blue border when selected)
- Loading and empty states

**Agent Types:**
- `AGENT_SYSTEM`: Purple background
- `AGENT_WORKER`: Blue background

**Usage:**
```tsx
<AgentList
  agents={agents}
  selectedAgentId={selectedAgentId}
  onSelectAgent={setSelectedAgentId}
  isLoading={agentsLoading}
/>
```

---

### 3. TaskCreationForm (`TaskCreationForm.tsx`)

**Form for creating new tasks with validation.**

**Props:**
```typescript
interface TaskCreationFormProps {
  onSubmit: (data: CreateTaskData) => void | Promise<void>
  onCancel?: () => void
  isLoading?: boolean
}

interface CreateTaskData {
  name: string
  description: string
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'BACKGROUND'
  metadata?: Record<string, any>
}
```

**Validation (Zod):**
- **Name**: 3-100 characters
- **Description**: 10-1000 characters
- **Priority**: Required enum value

**Priority Levels:**
- 🔴 **CRITICAL**: Execute immediately, bypass normal queue
- 🟠 **HIGH**: Execute as soon as resources available
- 🔵 **MEDIUM**: Standard priority, normal queue
- 🟢 **LOW**: Execute when system has free capacity
- ⚪ **BACKGROUND**: Lowest priority, run during idle time

**Features:**
- Dynamic border color based on selected priority
- Priority descriptions for guidance
- Real-time validation feedback
- Loading state during submission

**Usage:**
```tsx
<TaskCreationForm
  onSubmit={handleCreateTask}
  onCancel={() => setShowTaskForm(false)}
  isLoading={createTask.isPending}
/>
```

---

### 4. DelegationPanel (`DelegationPanel.tsx`)

**Permission configuration panel for task delegation.**

**Props:**
```typescript
interface DelegationPanelProps {
  agentId: string
  tasks: Task[]
  onDelegate: (taskId: string, agentId: string, permissions: string[]) => void | Promise<void>
  isLoading?: boolean
}
```

**Available Permissions:**
- **read**: View task data and results
- **write**: Modify task data
- **execute**: Perform task operations
- **delegate**: Delegate to other agents (sub-delegation)
- **report**: Send status updates

**Default Permissions:** `['read', 'execute', 'report']`

**Features:**
- Task dropdown (only PENDING/ASSIGNED tasks shown)
- Permission checkboxes with descriptions
- Delegation summary box showing:
  - Selected task name
  - Number of permissions granted
  - Permission chips
- Validate: Requires task selection and at least one permission
- Loading state during delegation

**Usage:**
```tsx
<DelegationPanel
  agentId={selectedAgentId}
  tasks={tasks}
  onDelegate={handleDelegate}
  isLoading={createDelegation.isPending}
/>
```

---

### 5. TaskMonitor (`TaskMonitor.tsx`)

**Real-time task status monitoring with expandable details.**

**Props:**
```typescript
interface TaskMonitorProps {
  tasks: Task[]
  delegations: Delegation[]
  agents: Agent[]
  onRevoke: (delegationId: string) => void
  onSelectTask: (taskId: string | null) => void
  selectedTaskId: string | null
  isLoading: boolean
}
```

**Task Statuses:**
- ⏳ **PENDING**: Clock icon (gray)
- ℹ️ **ASSIGNED**: Alert icon (blue)
- ⚙️ **IN_PROGRESS**: Spinning loader (yellow)
- ✅ **COMPLETED**: Check icon (green)
- ❌ **FAILED**: X icon (red)
- 🚫 **CANCELLED**: X icon (gray)

**Features:**
- Card-based task list with status badges
- Priority badges with color coding
- Metadata row: Created time, assigned agent, delegation info
- Expandable details showing:
  - Task creator and timestamps
  - Assigned agent details
  - Active delegation with revoke button
  - Error messages (if failed)
  - Task result (if completed)
  - Task metadata (JSON)
- Click task to select (blue border)
- Confirmation dialog before revoking delegation

**Usage:**
```tsx
<TaskMonitor
  tasks={tasks}
  delegations={delegations}
  agents={agents}
  onRevoke={handleRevoke}
  onSelectTask={setSelectedTaskId}
  selectedTaskId={selectedTaskId}
  isLoading={isLoading}
/>
```

---

### 6. ActivityLog (`ActivityLog.tsx`)

**Chronological activity stream with timeline visualization.**

**Props:**
```typescript
interface ActivityLogProps {
  tasks: Task[]
  delegations: Delegation[]
  agents: Agent[]
  isLoading: boolean
}
```

**Event Types:**
- **task_created**: Task created by user
- **task_assigned**: Task assigned to agent
- **task_started**: Task execution began
- **task_completed**: Task finished successfully
- **task_failed**: Task execution failed
- **task_cancelled**: Task was cancelled
- **delegation_created**: Delegation granted to agent
- **delegation_revoked**: Delegation was revoked
- **delegation_expired**: Delegation reached expiry time

**Features:**
- Timeline visualization with vertical line and colored dots
- Event cards with icon, title, description
- Relative timestamps ("2 minutes ago") + absolute time
- Event metadata (priority, permissions, errors)
- Activity summary stats:
  - Tasks Created
  - Completed
  - Delegations
  - Failed Tasks
- Sorted chronologically (most recent first)

**Usage:**
```tsx
<ActivityLog
  tasks={tasks}
  delegations={delegations}
  agents={agents}
  isLoading={isLoading}
/>
```

---

## Hooks

### 1. useDelegation (`/frontend/src/hooks/useDelegation.ts`)

**Main hook for delegation management with React Query integration.**

**Features:**
- Fetches agents (5-second refetch interval)
- Fetches tasks (3-second refetch interval)
- Fetches delegations (3-second refetch interval)
- Mutations: createTask, createDelegation, revokeDelegation, updateTaskStatus
- Automatic cache invalidation

**Usage:**
```tsx
const {
  agents,
  tasks,
  delegations,
  isLoading,
  error,
  createTask,
  createDelegation,
  revokeDelegation,
  updateTaskStatus,
  refetch,
} = useDelegation()

// Create task
await createTask.mutateAsync({
  name: 'Process dataset',
  description: 'Clean and validate user data',
  priority: 'HIGH',
})

// Create delegation
await createDelegation.mutateAsync({
  taskId: 'task-123',
  agentId: 'agent-456',
  permissions: ['read', 'execute', 'report'],
  expiresIn: 3600, // Optional: expires in 1 hour
})

// Revoke delegation
await revokeDelegation.mutateAsync('delegation-789')
```

**Additional Hooks:**
- `useDelegationByTask(taskId)`: Get delegation for specific task
- `useAgent(agentId)`: Get agent details

---

### 2. useTaskPolling (`/frontend/src/hooks/useTaskPolling.ts`)

**Real-time task updates via polling.**

**Features:**
- Configurable polling interval (default: 3 seconds)
- Start/stop polling controls
- Error handling
- Manual refetch function

**Usage:**
```tsx
const {
  tasks,
  isPolling,
  error,
  startPolling,
  stopPolling,
  refetch,
} = useTaskPolling(3000) // 3-second interval

// Control polling
useEffect(() => {
  startPolling()
  return () => stopPolling()
}, [])
```

**WebSocket Alternative:**

A `useTaskWebSocket` hook template is also provided for production use:

```tsx
const {
  tasks,
  isConnected,
  sendMessage,
} = useTaskWebSocket('ws://localhost:8000/ws/tasks')

// Send message to WebSocket
sendMessage({ type: 'subscribe', taskIds: ['task-123'] })
```

---

## API Endpoints

### Agents
- **GET** `/v1/identity?type=AGENT_SYSTEM,AGENT_WORKER` - List agents
- **GET** `/v1/identity/:id` - Get agent details

### Tasks
- **GET** `/v1/tasks` - List all tasks
- **POST** `/v1/tasks` - Create task
  ```json
  {
    "name": "Task name",
    "description": "Task description",
    "priority": "HIGH",
    "metadata": {}
  }
  ```
- **PUT** `/v1/tasks/:id` - Update task status
  ```json
  {
    "status": "IN_PROGRESS"
  }
  ```

### Delegations
- **GET** `/v1/delegation` - List all delegations
- **GET** `/v1/delegation/task/:taskId` - Get delegation by task
- **POST** `/v1/delegation` - Create delegation
  ```json
  {
    "taskId": "task-123",
    "agentId": "agent-456",
    "permissions": ["read", "execute", "report"],
    "expiresIn": 3600
  }
  ```
- **DELETE** `/v1/delegation/:id` - Revoke delegation

---

## Data Models

### Agent
```typescript
interface Agent {
  id: string
  name: string
  type: 'AGENT_SYSTEM' | 'AGENT_WORKER'
  capabilities: string[]
  status: 'AVAILABLE' | 'BUSY' | 'OFFLINE'
  currentTaskId?: string
  metadata?: Record<string, any>
}
```

### Task
```typescript
interface Task {
  id: string
  name: string
  description: string
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'BACKGROUND'
  status: 'PENDING' | 'ASSIGNED' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED' | 'CANCELLED'
  assignedAgentId?: string
  createdBy: string
  createdAt: string
  startedAt?: string
  completedAt?: string
  metadata?: Record<string, any>
  result?: any
  error?: string
}
```

### Delegation
```typescript
interface Delegation {
  id: string
  taskId: string
  agentId: string
  delegatedBy: string
  permissions: string[]
  status: 'ACTIVE' | 'COMPLETED' | 'REVOKED' | 'EXPIRED'
  createdAt: string
  revokedAt?: string
  expiresAt?: string
}
```

---

## Styling

All components use **Tailwind CSS** for styling with consistent design patterns:

**Color Schemes:**
- **Blue**: Primary actions, assigned tasks, AGENT_WORKER
- **Purple**: Delegations, permissions, AGENT_SYSTEM
- **Green**: Success, completed tasks, available agents
- **Yellow**: In-progress tasks, busy agents
- **Red**: Failed tasks, errors, critical priority
- **Orange**: High priority, revoked delegations
- **Gray**: Pending, cancelled, offline

**Responsive Design:**
- Mobile: Single column layout
- Desktop: Three-column layout (Agent List | Main Content)
- Breakpoints: `sm`, `md`, `lg`, `xl`

---

## Performance Considerations

1. **Polling vs WebSocket:**
   - Current: Polling (3-5 second intervals)
   - Production: Switch to WebSocket for better performance
   - Template provided in `useTaskPolling.ts`

2. **Query Caching:**
   - React Query handles caching automatically
   - staleTime: 30 seconds for agents
   - refetchInterval: 3-5 seconds for tasks/delegations

3. **Rendering Optimization:**
   - Use `useMemo` for computed data (ActivityLog)
   - Expandable sections reduce initial render size
   - Loading states prevent layout shifts

---

## Error Handling

All components include comprehensive error handling:

1. **Loading States:**
   - Skeleton loaders or spinner indicators
   - Disabled buttons during operations

2. **Error Display:**
   - Toast notifications for mutations
   - Error cards for query failures
   - Confirmation dialogs for destructive actions

3. **Validation:**
   - Zod schema validation for forms
   - Client-side validation feedback
   - Server-side validation error display

---

## Testing Recommendations

### Unit Tests
```tsx
// Test AgentList rendering
describe('AgentList', () => {
  it('displays agents correctly', () => {
    render(<AgentList agents={mockAgents} ... />)
    expect(screen.getByText('Agent 1')).toBeInTheDocument()
  })

  it('handles agent selection', () => {
    const onSelect = jest.fn()
    render(<AgentList onSelectAgent={onSelect} ... />)
    fireEvent.click(screen.getByText('Agent 1'))
    expect(onSelect).toHaveBeenCalledWith('agent-1')
  })
})
```

### Integration Tests
```tsx
// Test task creation flow
describe('Task Creation Flow', () => {
  it('creates task and delegates to agent', async () => {
    render(<DelegationConsolePage />)

    // Create task
    fireEvent.click(screen.getByText('Create Task'))
    fireEvent.change(screen.getByLabelText('Task Name'), {
      target: { value: 'Test Task' }
    })
    fireEvent.submit(screen.getByRole('form'))

    // Delegate task
    fireEvent.click(screen.getByText('Agent 1'))
    fireEvent.click(screen.getByText('Delegate Task'))

    await waitFor(() => {
      expect(screen.getByText('Delegation created')).toBeInTheDocument()
    })
  })
})
```

---

## Future Enhancements

1. **WebSocket Integration:**
   - Replace polling with WebSocket for real-time updates
   - Implement reconnection logic
   - Add connection status indicator

2. **Drag-and-Drop:**
   - Drag tasks onto agents for quick delegation
   - Use `react-dnd` or `@dnd-kit/core`

3. **Advanced Filtering:**
   - Filter tasks by status, priority, agent
   - Filter agents by status, capabilities
   - Search functionality

4. **Task Templates:**
   - Save common task configurations
   - Quick create from templates

5. **Delegation Scheduling:**
   - Schedule tasks for future execution
   - Recurring tasks

6. **Notifications:**
   - Browser notifications for task completion
   - Email notifications for failures

7. **Analytics Dashboard:**
   - Task completion rates
   - Agent performance metrics
   - Delegation patterns

---

## Troubleshooting

### Issue: Tasks not updating in real-time
**Solution:** Check polling interval in `useTaskPolling` or verify WebSocket connection

### Issue: Delegation button disabled
**Solution:** Ensure both task and agent are selected, and at least one permission is granted

### Issue: Agent list empty
**Solution:** Verify agents exist in database with correct type (AGENT_SYSTEM or AGENT_WORKER)

### Issue: "Permission denied" when revoking delegation
**Solution:** Verify user has permission to revoke (must be delegator or admin)

---

## Contributing

When adding new features:

1. Follow existing component patterns
2. Add TypeScript types
3. Include error handling and loading states
4. Update this README
5. Add unit tests
6. Test responsive design

---

## Support

For issues or questions:
- Check API documentation at `/docs/api`
- Review backend delegation controller at `/platform/src/controllers/delegation-controller.ts`
- Consult Identity Management system at `/frontend/src/pages/IdentityManagementPage.tsx`
