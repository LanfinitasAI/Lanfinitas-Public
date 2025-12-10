import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor } from '../../test/test-utils'
import userEvent from '@testing-library/user-event'
import TemplateLibraryPage from '../TemplateLibraryPage'
import { mockTemplates } from '../../test/mocks'
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

describe('TemplateLibraryPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Mock successful API responses
    vi.mocked(apiClient.apiClient.get).mockImplementation((url) => {
      if (url.includes('/v1/templates')) {
        return Promise.resolve({
          data: {
            templates: mockTemplates,
            total: mockTemplates.length,
            hasMore: false,
          },
        })
      }
      return Promise.resolve({ data: {} })
    })
  })

  it('renders page title with Impact font', () => {
    render(<TemplateLibraryPage />)
    const title = screen.getByText(/TEMPLATE LIBRARY/i)
    expect(title).toBeInTheDocument()
    expect(title).toHaveClass('font-impact')
  })

  it('displays template count', async () => {
    render(<TemplateLibraryPage />)

    await waitFor(() => {
      expect(screen.getByText(/\d+ PROFESSIONAL TEMPLATES AVAILABLE/i)).toBeInTheDocument()
    })
  })

  it('renders search input with underline style', () => {
    render(<TemplateLibraryPage />)

    const searchInput = screen.getByPlaceholderText(/SEARCH TEMPLATES/i)
    expect(searchInput).toBeInTheDocument()
    expect(searchInput).toHaveClass('border-b')
    expect(searchInput).toHaveClass('font-mono')
  })

  it('filters templates when searching', async () => {
    const user = userEvent.setup()
    render(<TemplateLibraryPage />)

    const searchInput = screen.getByPlaceholderText(/SEARCH TEMPLATES/i)
    await user.type(searchInput, 'Fashion')

    // Should update filters and trigger API call
    await waitFor(() => {
      const calls = vi.mocked(apiClient.apiClient.get).mock.calls
      const templateCalls = calls.filter(call => call[0].includes('/v1/templates'))
      expect(templateCalls.length).toBeGreaterThan(1)
    })
  })

  it('displays template cards in grid', async () => {
    render(<TemplateLibraryPage />)

    await waitFor(() => {
      expect(screen.getByText('Fashion Agent')).toBeInTheDocument()
      expect(screen.getByText('Pattern Generator')).toBeInTheDocument()
      expect(screen.getByText('Layout Optimizer')).toBeInTheDocument()
    })
  })

  it('shows Unicode star ratings (★☆)', async () => {
    render(<TemplateLibraryPage />)

    await waitFor(() => {
      // Check for star characters
      const stars = screen.getAllByText(/[★☆]/)
      expect(stars.length).toBeGreaterThan(0)
    })
  })

  it('displays usage count for each template', async () => {
    render(<TemplateLibraryPage />)

    await waitFor(() => {
      expect(screen.getByText(/234 USES/i)).toBeInTheDocument()
      expect(screen.getByText(/567 USES/i)).toBeInTheDocument()
      expect(screen.getByText(/89 USES/i)).toBeInTheDocument()
    })
  })

  it('shows category labels', async () => {
    render(<TemplateLibraryPage />)

    await waitFor(() => {
      expect(screen.getByText(/FASHION/i)).toBeInTheDocument()
      expect(screen.getByText(/PATTERN/i)).toBeInTheDocument()
      expect(screen.getByText(/LAYOUT/i)).toBeInTheDocument()
    })
  })

  it('renders USE button for each template', async () => {
    render(<TemplateLibraryPage />)

    await waitFor(() => {
      const useButtons = screen.getAllByRole('button', { name: /^USE$/i })
      expect(useButtons.length).toBe(mockTemplates.length)
    })
  })

  it('opens modal when USE button is clicked', async () => {
    const user = userEvent.setup()
    render(<TemplateLibraryPage />)

    await waitFor(() => {
      expect(screen.getByText('Fashion Agent')).toBeInTheDocument()
    })

    const useButtons = screen.getAllByRole('button', { name: /^USE$/i })
    await user.click(useButtons[0])

    // Modal should appear
    await waitFor(() => {
      expect(screen.getByText(/CREATE AGENT FROM TEMPLATE/i)).toBeInTheDocument()
    })
  })

  it('shows agent name input in modal', async () => {
    const user = userEvent.setup()
    render(<TemplateLibraryPage />)

    await waitFor(() => {
      expect(screen.getByText('Fashion Agent')).toBeInTheDocument()
    })

    const useButtons = screen.getAllByRole('button', { name: /^USE$/i })
    await user.click(useButtons[0])

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/MY CUSTOM AGENT/i)).toBeInTheDocument()
    })
  })

  it('creates agent when CREATE button is clicked', async () => {
    const user = userEvent.setup()
    vi.mocked(apiClient.apiClient.post).mockResolvedValue({
      data: { id: 'agent-1', name: 'My Agent' },
    })

    render(<TemplateLibraryPage />)

    await waitFor(() => {
      expect(screen.getByText('Fashion Agent')).toBeInTheDocument()
    })

    // Click USE button
    const useButtons = screen.getAllByRole('button', { name: /^USE$/i })
    await user.click(useButtons[0])

    // Wait for modal
    await waitFor(() => {
      expect(screen.getByPlaceholderText(/MY CUSTOM AGENT/i)).toBeInTheDocument()
    })

    // Type agent name
    const nameInput = screen.getByPlaceholderText(/MY CUSTOM AGENT/i)
    await user.clear(nameInput)
    await user.type(nameInput, 'My Custom Agent')

    // Click CREATE
    const createButton = screen.getByRole('button', { name: /^CREATE$/i })
    await user.click(createButton)

    await waitFor(() => {
      expect(apiClient.apiClient.post).toHaveBeenCalledWith(
        '/v1/templates/use',
        expect.objectContaining({
          templateId: mockTemplates[0].id,
          name: 'My Custom Agent',
        })
      )
    })
  })

  it('can cancel template usage', async () => {
    const user = userEvent.setup()
    render(<TemplateLibraryPage />)

    await waitFor(() => {
      expect(screen.getByText('Fashion Agent')).toBeInTheDocument()
    })

    // Click USE button
    const useButtons = screen.getAllByRole('button', { name: /^USE$/i })
    await user.click(useButtons[0])

    // Wait for modal
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /CANCEL/i })).toBeInTheDocument()
    })

    // Click CANCEL
    const cancelButton = screen.getByRole('button', { name: /CANCEL/i })
    await user.click(cancelButton)

    // Modal should close
    await waitFor(() => {
      expect(screen.queryByText(/CREATE AGENT FROM TEMPLATE/i)).not.toBeInTheDocument()
    })
  })

  it('handles infinite scroll', async () => {
    // Mock hasMore = true
    vi.mocked(apiClient.apiClient.get).mockImplementation((url) => {
      if (url.includes('/v1/templates')) {
        return Promise.resolve({
          data: {
            templates: mockTemplates,
            total: 100,
            hasMore: true,
          },
        })
      }
      return Promise.resolve({ data: {} })
    })

    render(<TemplateLibraryPage />)

    await waitFor(() => {
      expect(screen.getByText(/SCROLL FOR MORE/i)).toBeInTheDocument()
    })
  })

  it('shows loading state', () => {
    vi.mocked(apiClient.apiClient.get).mockImplementation(() =>
      new Promise(() => {}) // Never resolves
    )

    render(<TemplateLibraryPage />)
    expect(screen.getByText(/LOADING TEMPLATES/i)).toBeInTheDocument()
  })

  it('handles empty template list', async () => {
    vi.mocked(apiClient.apiClient.get).mockImplementation((url) => {
      if (url.includes('/v1/templates')) {
        return Promise.resolve({
          data: { templates: [], total: 0, hasMore: false },
        })
      }
      return Promise.resolve({ data: {} })
    })

    render(<TemplateLibraryPage />)

    await waitFor(() => {
      expect(screen.getByText(/NO TEMPLATES FOUND/i)).toBeInTheDocument()
    })
  })

  it('uses Typewriter font for all UI elements except title', () => {
    render(<TemplateLibraryPage />)

    const searchInput = screen.getByPlaceholderText(/SEARCH TEMPLATES/i)
    expect(searchInput).toHaveClass('font-mono')
  })

  it('applies minimalist black/white styling', () => {
    const { container } = render(<TemplateLibraryPage />)

    const mainDiv = container.firstChild as HTMLElement
    expect(mainDiv).toHaveClass('bg-black', 'text-white')
  })

  it('star ratings are yellow colored', async () => {
    render(<TemplateLibraryPage />)

    await waitFor(() => {
      // Find elements with yellow color
      const yellowElements = document.querySelectorAll('.text-yellow-400')
      expect(yellowElements.length).toBeGreaterThan(0)
    })
  })

  it('handles API errors gracefully', async () => {
    vi.mocked(apiClient.apiClient.get).mockRejectedValue(new Error('API Error'))

    render(<TemplateLibraryPage />)

    // Page should still render without crashing
    expect(screen.getByText(/TEMPLATE LIBRARY/i)).toBeInTheDocument()
  })
})
