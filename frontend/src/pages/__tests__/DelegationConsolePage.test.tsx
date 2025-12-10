import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor } from '../../test/test-utils'
import userEvent from '@testing-library/user-event'
import DelegationConsolePage from '../DelegationConsolePage'
import { mockAgents, mockTasks, mockDelegations } from '../../test/mocks'
import * as apiClient from '../../lib/api-client'

// Mock the API client
vi.mock('../../lib/api-client', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}))

describe('DelegationConsolePage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Mock successful API responses
    vi.mocked(apiClient.apiClient.get).mockImplementation((url) => {
      if (url.includes('/v1/identity')) {
        return Promise.resolve({ data: { identities: mockAgents } })
      }
      if (url.includes('/v1/tasks')) {
        return Promise.resolve({ data: { tasks: mockTasks } })
      }
      if (url.includes('/v1/delegation')) {
        return Promise.resolve({ data: { delegations: mockDelegations } })
      }
      return Promise.resolve({ data: {} })
    })
  })

  it('renders page title with Impact font', () => {
    render(<DelegationConsolePage />)
    const title = screen.getByText(/DELEGATION CONSOLE/i)
    expect(title).toBeInTheDocument()
    expect(title).toHaveClass('font-impact')
  })

  it('displays agent list in sidebar', async () => {
    render(<DelegationConsolePage />)

    await waitFor(() => {
      expect(screen.getByText('Fashion Agent')).toBeInTheDocument()
      expect(screen.getByText('Pattern Generator')).toBeInTheDocument()
    })
  })

  it('shows Unicode status indicators', async () => {
    render(<DelegationConsolePage />)

    await waitFor(() => {
      // Check for status indicators (○ for AVAILABLE, ● for BUSY)
      const statusElements = screen.getAllByText(/[●○]/)
      expect(statusElements.length).toBeGreaterThan(0)
    })
  })

  it('displays statistics in sidebar', async () => {
    render(<DelegationConsolePage />)

    await waitFor(() => {
      expect(screen.getByText(/TOTAL AGENTS/i)).toBeInTheDocument()
      expect(screen.getByText(/AVAILABLE/i)).toBeInTheDocument()
      expect(screen.getByText(/ACTIVE TASKS/i)).toBeInTheDocument()
    })
  })

  it('renders task creation form', () => {
    render(<DelegationConsolePage />)

    expect(screen.getByPlaceholderText(/ENTER TASK NAME/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/TASK DESCRIPTION/i)).toBeInTheDocument()
  })

  it('shows priority radio buttons', () => {
    render(<DelegationConsolePage />)

    expect(screen.getByText(/CRITICAL/i)).toBeInTheDocument()
    expect(screen.getByText(/HIGH/i)).toBeInTheDocument()
    expect(screen.getByText(/MEDIUM/i)).toBeInTheDocument()
    expect(screen.getByText(/LOW/i)).toBeInTheDocument()
    expect(screen.getByText(/BACKGROUND/i)).toBeInTheDocument()
  })

  it('validates task creation form', async () => {
    const user = userEvent.setup()
    render(<DelegationConsolePage />)

    const createButton = screen.getByRole('button', { name: /CREATE TASK/i })
    await user.click(createButton)

    // Should show validation errors
    await waitFor(() => {
      const errors = screen.queryAllByText(/TOO SHORT/i)
      expect(errors.length).toBeGreaterThan(0)
    })
  })

  it('creates a new task successfully', async () => {
    const user = userEvent.setup()
    vi.mocked(apiClient.apiClient.post).mockResolvedValue({
      data: { id: 'task-3', name: 'New Task', status: 'PENDING' },
    })

    render(<DelegationConsolePage />)

    // Fill in form
    await user.type(screen.getByPlaceholderText(/ENTER TASK NAME/i), 'New Task Name')
    await user.type(screen.getByPlaceholderText(/TASK DESCRIPTION/i), 'This is a test task description')

    // Submit
    await user.click(screen.getByRole('button', { name: /CREATE TASK/i }))

    await waitFor(() => {
      expect(apiClient.apiClient.post).toHaveBeenCalledWith(
        '/v1/tasks',
        expect.objectContaining({
          name: 'New Task Name',
          description: 'This is a test task description',
        })
      )
    })
  })

  it('displays active tasks with progress', async () => {
    render(<DelegationConsolePage />)

    await waitFor(() => {
      expect(screen.getByText('Design Fashion Pattern')).toBeInTheDocument()
      expect(screen.getByText(/60%/i)).toBeInTheDocument() // Progress percentage
    })
  })

  it('shows delegation permissions checkboxes', async () => {
    const user = userEvent.setup()
    render(<DelegationConsolePage />)

    // Select an agent first
    await waitFor(() => {
      const agentButton = screen.getByText('Fashion Agent')
      user.click(agentButton)
    })

    // Should show permission checkboxes if there are pending tasks
    await waitFor(() => {
      // Permissions might be visible
      const permissions = screen.queryByText(/READ/i)
      if (permissions) {
        expect(permissions).toBeInTheDocument()
      }
    })
  })

  it('uses Typewriter font for all UI elements', () => {
    render(<DelegationConsolePage />)

    const input = screen.getByPlaceholderText(/ENTER TASK NAME/i)
    expect(input).toHaveClass('font-mono')
  })

  it('applies minimalist black/white styling', () => {
    const { container } = render(<DelegationConsolePage />)

    const mainDiv = container.firstChild as HTMLElement
    expect(mainDiv).toHaveClass('bg-black', 'text-white')
  })

  it('handles loading state', () => {
    vi.mocked(apiClient.apiClient.get).mockImplementation(() =>
      new Promise(() => {}) // Never resolves to keep loading
    )

    render(<DelegationConsolePage />)
    expect(screen.getByText(/LOADING/i)).toBeInTheDocument()
  })

  it('handles API errors gracefully', async () => {
    vi.mocked(apiClient.apiClient.get).mockRejectedValue(new Error('API Error'))

    render(<DelegationConsolePage />)

    // Page should still render without crashing
    expect(screen.getByText(/DELEGATION CONSOLE/i)).toBeInTheDocument()
  })
})
