import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor, fireEvent } from '../../test/test-utils'
import userEvent from '@testing-library/user-event'
import IdentityManagementPage from '../IdentityManagementPage'
import { mockIdentities } from '../../test/mocks'
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

describe('IdentityManagementPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Mock successful API responses
    vi.mocked(apiClient.apiClient.get).mockResolvedValue({
      data: { identities: mockIdentities },
    })
  })

  it('renders page title with Impact font', () => {
    render(<IdentityManagementPage />)
    const title = screen.getByText(/IDENTITY MANAGEMENT/i)
    expect(title).toBeInTheDocument()
    expect(title).toHaveClass('font-impact')
  })

  it('displays branding text', () => {
    render(<IdentityManagementPage />)
    expect(screen.getByText(/LANFINITAS AI/i)).toBeInTheDocument()
  })

  it('shows three tabs: USER, TEAM, AGENT', () => {
    render(<IdentityManagementPage />)
    expect(screen.getByRole('button', { name: /USER/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /TEAM/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /AGENT/i })).toBeInTheDocument()
  })

  it('renders user creation form by default', () => {
    render(<IdentityManagementPage />)
    expect(screen.getByPlaceholderText(/username/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/email/i)).toBeInTheDocument()
  })

  it('validates form input with Zod', async () => {
    const user = userEvent.setup()
    render(<IdentityManagementPage />)

    const submitButton = screen.getByRole('button', { name: /CREATE/i })
    await user.click(submitButton)

    // Should show validation errors
    await waitFor(() => {
      expect(screen.getByText(/TOO SHORT/i)).toBeInTheDocument()
    })
  })

  it('creates a new user successfully', async () => {
    const user = userEvent.setup()
    vi.mocked(apiClient.apiClient.post).mockResolvedValue({
      data: { id: '3', name: 'New User', email: 'new@example.com', role: 'USER' },
    })

    render(<IdentityManagementPage />)

    // Fill in form
    await user.type(screen.getByPlaceholderText(/username/i), 'New User')
    await user.type(screen.getByPlaceholderText(/email/i), 'new@example.com')

    // Submit
    await user.click(screen.getByRole('button', { name: /CREATE/i }))

    await waitFor(() => {
      expect(apiClient.apiClient.post).toHaveBeenCalledWith(
        '/v1/identity',
        expect.objectContaining({
          name: 'New User',
          email: 'new@example.com',
        })
      )
    })
  })

  it('switches between tabs', async () => {
    const user = userEvent.setup()
    render(<IdentityManagementPage />)

    // Click TEAM tab
    await user.click(screen.getByRole('button', { name: /TEAM/i }))

    // Should show team form
    await waitFor(() => {
      expect(screen.getByPlaceholderText(/team name/i)).toBeInTheDocument()
    })

    // Click AGENT tab
    await user.click(screen.getByRole('button', { name: /AGENT/i }))

    // Should show agent form
    await waitFor(() => {
      expect(screen.getByPlaceholderText(/agent name/i)).toBeInTheDocument()
    })
  })

  it('displays list of identities', async () => {
    render(<IdentityManagementPage />)

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument()
      expect(screen.getByText('Jane Smith')).toBeInTheDocument()
    })
  })

  it('handles API errors gracefully', async () => {
    vi.mocked(apiClient.apiClient.get).mockRejectedValue(new Error('API Error'))

    render(<IdentityManagementPage />)

    // Page should still render without crashing
    expect(screen.getByText(/IDENTITY MANAGEMENT/i)).toBeInTheDocument()
  })

  it('uses Typewriter font for all UI elements', () => {
    render(<IdentityManagementPage />)

    const input = screen.getByPlaceholderText(/username/i)
    const button = screen.getByRole('button', { name: /CREATE/i })

    expect(input).toHaveClass('font-mono')
    expect(button).toHaveClass('font-mono')
  })

  it('applies minimalist black/white styling', () => {
    const { container } = render(<IdentityManagementPage />)

    const mainDiv = container.firstChild as HTMLElement
    expect(mainDiv).toHaveClass('bg-black', 'text-white')
  })
})
