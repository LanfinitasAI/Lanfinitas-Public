import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor } from '../../test/test-utils'
import userEvent from '@testing-library/user-event'
import WalletDashboardPage from '../WalletDashboardPage'
import { mockWalletBalance, mockTransactions } from '../../test/mocks'
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

describe('WalletDashboardPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Mock successful API responses
    vi.mocked(apiClient.apiClient.get).mockImplementation((url) => {
      if (url.includes('/v1/wallet/balance')) {
        return Promise.resolve({ data: mockWalletBalance })
      }
      if (url.includes('/v1/wallet/transactions')) {
        return Promise.resolve({
          data: { transactions: mockTransactions, total: mockTransactions.length },
        })
      }
      if (url.includes('/v1/wallet/stats')) {
        return Promise.resolve({
          data: {
            totalIncome: 300.0,
            totalExpense: 50.0,
            incomeByType: {},
            expenseByType: {},
            dailyStats: [],
          },
        })
      }
      return Promise.resolve({ data: {} })
    })
  })

  it('renders page title with Impact font', () => {
    render(<WalletDashboardPage />)
    const title = screen.getByText(/^WALLET$/i)
    expect(title).toBeInTheDocument()
    expect(title).toHaveClass('font-impact')
  })

  it('displays balance with giant Impact font', async () => {
    render(<WalletDashboardPage />)

    await waitFor(() => {
      const balance = screen.getByText(/12,345\.67/i)
      expect(balance).toBeInTheDocument()
      expect(balance).toHaveClass('font-impact')
      expect(balance).toHaveClass('text-9xl') // Giant font
    })
  })

  it('shows LFT TOKEN label', async () => {
    render(<WalletDashboardPage />)

    await waitFor(() => {
      expect(screen.getByText(/LFT TOKEN/i)).toBeInTheDocument()
    })
  })

  it('displays USDC balance', async () => {
    render(<WalletDashboardPage />)

    await waitFor(() => {
      const usdcBalance = screen.getByText(/1,234\.56/i)
      expect(usdcBalance).toBeInTheDocument()
      expect(screen.getByText(/USDC/i)).toBeInTheDocument()
    })
  })

  it('shows transaction history section', async () => {
    render(<WalletDashboardPage />)

    await waitFor(() => {
      expect(screen.getByText(/TRANSACTIONS/i)).toBeInTheDocument()
    })
  })

  it('displays transactions with +/- signs', async () => {
    render(<WalletDashboardPage />)

    await waitFor(() => {
      // Check for transactions with signs
      expect(screen.getByText(/\+100\.00 LFT/i)).toBeInTheDocument() // Reward (incoming)
      expect(screen.getByText(/-50\.00 LFT/i)).toBeInTheDocument() // Payment (outgoing)
    })
  })

  it('shows transaction dates in yyyy-MM-dd format', async () => {
    render(<WalletDashboardPage />)

    await waitFor(() => {
      // Check for formatted dates
      const dates = screen.getAllByText(/\d{4}-\d{2}-\d{2}/)
      expect(dates.length).toBeGreaterThan(0)
    })
  })

  it('displays transaction types', async () => {
    render(<WalletDashboardPage />)

    await waitFor(() => {
      expect(screen.getByText(/AGENT REWARD/i)).toBeInTheDocument()
      expect(screen.getByText(/TASK FEE/i)).toBeInTheDocument()
    })
  })

  it('shows transaction count', async () => {
    render(<WalletDashboardPage />)

    await waitFor(() => {
      expect(screen.getByText(/SHOWING \d+ OF \d+ TRANSACTIONS/i)).toBeInTheDocument()
    })
  })

  it('renders LOAD MORE button when there are more transactions', async () => {
    // Mock more transactions
    vi.mocked(apiClient.apiClient.get).mockImplementation((url) => {
      if (url.includes('/v1/wallet/balance')) {
        return Promise.resolve({ data: mockWalletBalance })
      }
      if (url.includes('/v1/wallet/transactions')) {
        return Promise.resolve({
          data: { transactions: mockTransactions, total: 100 }, // More total than current
        })
      }
      return Promise.resolve({ data: {} })
    })

    render(<WalletDashboardPage />)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /LOAD MORE/i })).toBeInTheDocument()
    })
  })

  it('loads more transactions when LOAD MORE is clicked', async () => {
    const user = userEvent.setup()

    // Mock pagination
    vi.mocked(apiClient.apiClient.get).mockImplementation((url, config) => {
      if (url.includes('/v1/wallet/balance')) {
        return Promise.resolve({ data: mockWalletBalance })
      }
      if (url.includes('/v1/wallet/transactions')) {
        const page = config?.params?.page || 1
        return Promise.resolve({
          data: {
            transactions: mockTransactions,
            total: 100,
          },
        })
      }
      return Promise.resolve({ data: {} })
    })

    render(<WalletDashboardPage />)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /LOAD MORE/i })).toBeInTheDocument()
    })

    const loadMoreButton = screen.getByRole('button', { name: /LOAD MORE/i })
    await user.click(loadMoreButton)

    // Should call API with page 2
    await waitFor(() => {
      const calls = vi.mocked(apiClient.apiClient.get).mock.calls
      const transactionCalls = calls.filter(call => call[0].includes('/v1/wallet/transactions'))
      expect(transactionCalls.length).toBeGreaterThan(1)
    })
  })

  it('uses Typewriter font for transaction table', async () => {
    render(<WalletDashboardPage />)

    await waitFor(() => {
      const table = screen.getByRole('table')
      expect(table).toHaveClass('font-mono')
    })
  })

  it('applies minimalist black/white styling', () => {
    const { container } = render(<WalletDashboardPage />)

    const mainDiv = container.firstChild as HTMLElement
    expect(mainDiv).toHaveClass('bg-black', 'text-white')
  })

  it('handles loading state', () => {
    vi.mocked(apiClient.apiClient.get).mockImplementation(() =>
      new Promise(() => {}) // Never resolves
    )

    render(<WalletDashboardPage />)
    expect(screen.getByText(/LOADING BALANCE/i)).toBeInTheDocument()
  })

  it('handles empty transaction list', async () => {
    vi.mocked(apiClient.apiClient.get).mockImplementation((url) => {
      if (url.includes('/v1/wallet/balance')) {
        return Promise.resolve({ data: mockWalletBalance })
      }
      if (url.includes('/v1/wallet/transactions')) {
        return Promise.resolve({ data: { transactions: [], total: 0 } })
      }
      return Promise.resolve({ data: {} })
    })

    render(<WalletDashboardPage />)

    await waitFor(() => {
      expect(screen.getByText(/NO TRANSACTIONS YET/i)).toBeInTheDocument()
    })
  })

  it('handles API errors gracefully', async () => {
    vi.mocked(apiClient.apiClient.get).mockRejectedValue(new Error('API Error'))

    render(<WalletDashboardPage />)

    // Page should still render without crashing
    expect(screen.getByText(/WALLET/i)).toBeInTheDocument()
  })
})
