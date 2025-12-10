import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '../lib/api-client'

export interface WalletBalance {
  lftToken: number
  usdc: number
  lastUpdated: string
}

export interface Transaction {
  id: string
  type: 'DEPOSIT' | 'WITHDRAW' | 'TRANSFER' | 'PAYMENT' | 'REWARD' | 'REFUND'
  amount: number
  currency: 'LFT' | 'USDC'
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'CANCELLED'
  description: string
  timestamp: string
  from?: string
  to?: string
  txHash?: string
  fee?: number
  metadata?: Record<string, any>
}

export interface TransactionStats {
  totalIncome: number
  totalExpense: number
  incomeByType: Record<string, number>
  expenseByType: Record<string, number>
  dailyStats: Array<{
    date: string
    income: number
    expense: number
  }>
}

export interface DepositRequest {
  amount: number
  currency: 'LFT' | 'USDC'
  method: 'CRYPTO' | 'CREDIT_CARD' | 'BANK_TRANSFER'
}

export interface WithdrawRequest {
  amount: number
  currency: 'LFT' | 'USDC'
  address: string
}

export interface TransactionFilters {
  type?: string[]
  status?: string[]
  currency?: string[]
  startDate?: string
  endDate?: string
  search?: string
}

/**
 * Main hook for wallet management
 */
export const useWallet = () => {
  const queryClient = useQueryClient()

  // Fetch wallet balance
  const {
    data: balance,
    isLoading: balanceLoading,
    error: balanceError,
    refetch: refetchBalance,
  } = useQuery<WalletBalance>({
    queryKey: ['wallet', 'balance'],
    queryFn: async () => {
      const response = await apiClient.get('/v1/wallet/balance')
      return response.data
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  })

  // Fetch transactions with filters
  const {
    data: transactionsData,
    isLoading: transactionsLoading,
    error: transactionsError,
    refetch: refetchTransactions,
  } = useQuery<{ transactions: Transaction[]; total: number }>({
    queryKey: ['wallet', 'transactions'],
    queryFn: async () => {
      const response = await apiClient.get('/v1/wallet/transactions')
      return {
        transactions: response.data.transactions || [],
        total: response.data.total || 0,
      }
    },
    refetchInterval: 60000, // Refetch every 60 seconds
  })

  // Fetch transaction statistics
  const {
    data: stats,
    isLoading: statsLoading,
    error: statsError,
  } = useQuery<TransactionStats>({
    queryKey: ['wallet', 'stats'],
    queryFn: async () => {
      const response = await apiClient.get('/v1/wallet/stats')
      return response.data
    },
    refetchInterval: 60000,
  })

  // Deposit mutation
  const deposit = useMutation({
    mutationFn: async (data: DepositRequest) => {
      const response = await apiClient.post('/v1/wallet/deposit', data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wallet', 'balance'] })
      queryClient.invalidateQueries({ queryKey: ['wallet', 'transactions'] })
      queryClient.invalidateQueries({ queryKey: ['wallet', 'stats'] })
    },
  })

  // Withdraw mutation
  const withdraw = useMutation({
    mutationFn: async (data: WithdrawRequest) => {
      const response = await apiClient.post('/v1/wallet/withdraw', data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wallet', 'balance'] })
      queryClient.invalidateQueries({ queryKey: ['wallet', 'transactions'] })
      queryClient.invalidateQueries({ queryKey: ['wallet', 'stats'] })
    },
  })

  const refetch = () => {
    refetchBalance()
    refetchTransactions()
  }

  return {
    balance,
    transactions: transactionsData?.transactions || [],
    transactionsTotal: transactionsData?.total || 0,
    stats,
    isLoading: balanceLoading || transactionsLoading || statsLoading,
    error: balanceError || transactionsError || statsError,
    deposit,
    withdraw,
    refetch,
  }
}

/**
 * Hook to fetch transactions with filters and pagination
 */
export const useTransactions = (
  filters?: TransactionFilters,
  page: number = 1,
  limit: number = 20
) => {
  return useQuery<{ transactions: Transaction[]; total: number }>({
    queryKey: ['wallet', 'transactions', filters, page, limit],
    queryFn: async () => {
      const params: any = { page, limit }

      if (filters?.type?.length) params.type = filters.type.join(',')
      if (filters?.status?.length) params.status = filters.status.join(',')
      if (filters?.currency?.length) params.currency = filters.currency.join(',')
      if (filters?.startDate) params.startDate = filters.startDate
      if (filters?.endDate) params.endDate = filters.endDate
      if (filters?.search) params.search = filters.search

      const response = await apiClient.get('/v1/wallet/transactions', { params })
      return {
        transactions: response.data.transactions || [],
        total: response.data.total || 0,
      }
    },
    refetchInterval: 60000,
  })
}

/**
 * Hook to get single transaction details
 */
export const useTransaction = (transactionId: string) => {
  return useQuery<Transaction>({
    queryKey: ['wallet', 'transaction', transactionId],
    queryFn: async () => {
      const response = await apiClient.get(`/v1/wallet/transactions/${transactionId}`)
      return response.data
    },
    enabled: !!transactionId,
  })
}
