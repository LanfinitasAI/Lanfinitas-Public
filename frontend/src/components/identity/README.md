# Identity Management Components

Complete Identity Management system for managing Users, Teams, and AI Agents.

## 📁 Structure

```
identity/
├── UserForm.tsx          # User creation/edit form
├── TeamForm.tsx          # Team creation/edit form
├── AgentForm.tsx         # Agent registration/edit form
├── IdentityList.tsx      # List display component
├── index.ts              # Component exports
└── README.md             # This file
```

## 🎯 Features

### IdentityManagementPage
Main page with tab navigation and comprehensive management features:
- **Tab Navigation**: Switch between Users, Teams, and Agents
- **Search**: Real-time search by name or email
- **Filtering**: Filter users by role (Admin/User/Viewer)
- **Statistics**: Dashboard cards showing totals for each type
- **CRUD Operations**: Create, Read, Update, Delete for all identity types

### UserForm
User creation and editing with validation:
- **Fields**: Name, Email, Role
- **Validation**:
  - Name: 2-100 characters
  - Email: Valid email format
  - Role: ADMIN | USER | VIEWER
- **Features**: Role descriptions, error messages

### TeamForm
Team creation with member management:
- **Fields**: Team Name, Description, Members
- **Validation**:
  - Name: 2-100 characters
  - Description: Max 500 characters
- **Features**:
  - Add/remove members from available users
  - Member selection dropdown
  - Visual member list

### AgentForm
AI Agent registration with capabilities:
- **Fields**: Agent Name, Type, Owner, Capabilities
- **Validation**:
  - Name: 2-100 characters
  - Type: AGENT_SYSTEM | AGENT_WORKER
  - Owner: Required user ID
  - Capabilities: Minimum 1 required
- **Features**:
  - Predefined capability buttons
  - Custom capability input
  - Capability tags with remove option
  - Type descriptions

### IdentityList
Responsive card-based list display:
- **Features**:
  - Expandable details
  - Role/Type badges
  - Capability chips (for agents)
  - Member count (for teams)
  - Timestamps
  - Edit/Delete actions
- **States**: Loading, Error, Empty state handling

## 🔌 API Integration

The components integrate with the `/api/v1/identity` endpoints:

```typescript
// Fetch identities
GET /api/v1/identity?type=HUMAN
GET /api/v1/identity?type=TEAM
GET /api/v1/identity?type=AGENT_SYSTEM,AGENT_WORKER

// Create identity
POST /api/v1/identity
Body: {
  name: string
  email?: string
  role?: 'ADMIN' | 'USER' | 'VIEWER'
  type?: 'HUMAN' | 'TEAM' | 'AGENT_SYSTEM' | 'AGENT_WORKER'
  capabilities?: string[]
  ownerId?: string
  members?: string[]
}

// Update identity
PUT /api/v1/identity/:id
Body: Partial<Identity>

// Delete identity
DELETE /api/v1/identity/:id
```

## 📦 Dependencies

All required dependencies are already installed:
- `react-hook-form`: ^7.49.2 - Form management
- `zod`: ^3.22.4 - Schema validation
- `@hookform/resolvers`: ^3.3.3 - Zod integration
- `date-fns`: ^3.0.0 - Date formatting
- `@tanstack/react-query`: ^5.14.0 - Data fetching
- `lucide-react`: ^0.294.0 - Icons

## 🚀 Usage

### Accessing the Page

Navigate to `/identity` in the application:
```typescript
<Link to="/identity">Identity Management</Link>
```

### Using the Hook

```typescript
import { useIdentities } from '@/hooks/useIdentities'

function MyComponent() {
  const {
    identities,       // Array of identities
    isLoading,        // Loading state
    error,            // Error state
    createIdentity,   // Mutation for creating
    updateIdentity,   // Mutation for updating
    deleteIdentity,   // Mutation for deleting
    refetch,          // Manual refetch function
  } = useIdentities('user') // 'user' | 'team' | 'agent'

  // Create a user
  await createIdentity.mutateAsync({
    name: 'John Doe',
    email: 'john@example.com',
    role: 'USER'
  })
}
```

### Using Individual Components

```typescript
import { UserForm, TeamForm, AgentForm, IdentityList } from '@/components/identity'

// User Form
<UserForm
  onSubmit={handleSubmit}
  onCancel={handleCancel}
  initialData={existingUser}
  isLoading={isLoading}
/>

// Team Form
<TeamForm
  onSubmit={handleSubmit}
  onCancel={handleCancel}
  initialData={existingTeam}
  isLoading={isLoading}
/>

// Agent Form
<AgentForm
  onSubmit={handleSubmit}
  onCancel={handleCancel}
  initialData={existingAgent}
  isLoading={isLoading}
/>

// Identity List
<IdentityList
  identities={identities}
  type="user"
  isLoading={isLoading}
  error={error}
  onEdit={handleEdit}
  onDelete={handleDelete}
/>
```

## 🎨 Styling

All components use Tailwind CSS with consistent color schemes:
- **Users**: Blue theme (bg-blue-50, text-blue-600)
- **Teams**: Green theme (bg-green-50, text-green-600)
- **Agents**: Purple theme (bg-purple-50, text-purple-600)

### Responsive Design
- Mobile-first approach
- Grid layouts adjust for screen size
- Touch-friendly buttons and inputs
- Collapsible sections on mobile

## 🧪 Validation

All forms use Zod schemas for validation:

```typescript
// User Schema
{
  name: string (2-100 chars)
  email: valid email
  role: 'ADMIN' | 'USER' | 'VIEWER'
}

// Team Schema
{
  name: string (2-100 chars)
  description?: string (max 500 chars)
  members?: string[]
}

// Agent Schema
{
  name: string (2-100 chars)
  type: 'AGENT_SYSTEM' | 'AGENT_WORKER'
  capabilities: string[] (min 1)
  ownerId: string (required)
}
```

## 🔒 Security

- All routes are protected with `<ProtectedRoute>`
- API calls include authentication tokens
- Form data is validated client and server-side
- Delete operations require confirmation

## 📱 Features Showcase

### Dashboard Statistics
- Real-time counts for Users, Teams, and Agents
- Color-coded cards with icons
- Automatic updates on data changes

### Search & Filter
- Real-time search across name and email
- Role-based filtering for users
- Debounced input for performance

### CRUD Operations
- **Create**: Inline forms with validation
- **Read**: Expandable cards with full details
- **Update**: Edit mode with pre-filled forms
- **Delete**: Confirmation dialog for safety

### User Experience
- Loading states with spinners
- Error messages with icons
- Empty states with helpful messages
- Success feedback on operations
- Keyboard shortcuts support

## 🐛 Error Handling

All components handle errors gracefully:
- API errors display user-friendly messages
- Form validation shows field-specific errors
- Network errors trigger retry mechanisms
- Loading states prevent duplicate submissions

## 📝 TypeScript Types

```typescript
interface Identity {
  id: string
  name: string
  type: 'HUMAN' | 'TEAM' | 'AGENT_SYSTEM' | 'AGENT_WORKER'
  email?: string
  role?: 'ADMIN' | 'USER' | 'VIEWER'
  description?: string
  capabilities?: string[]
  ownerId?: string
  members?: string[]
  metadata?: Record<string, any>
  createdAt: string
  updatedAt: string
}
```

## 🚧 Future Enhancements

Potential improvements:
- [ ] Bulk operations (bulk delete, bulk role change)
- [ ] Import/Export functionality
- [ ] Advanced filtering (date ranges, multiple fields)
- [ ] Pagination for large lists
- [ ] Audit log viewer
- [ ] Permission inheritance visualization
- [ ] Agent capability recommendations
- [ ] Team hierarchy visualization

## 📚 Related Documentation

- [API Documentation](../../../platform/services/api-gateway/README.md)
- [Database Schema](../../../platform/packages/database/prisma/schema.prisma)
- [Identity System Guide](../../../SETUP_IDENTITY_SYSTEM.md)

---

**Created**: 2025-11-21
**Status**: ✅ Complete and Production-Ready
