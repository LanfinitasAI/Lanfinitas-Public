import React, { useState } from 'react'
import { format } from 'date-fns'
import { useWallet, useTransactions, Transaction } from '../hooks/useWallet'

/**
 * Wallet Dashboard Page - Minimalist Black/White Design
 *
 * Features:
 * - Large balance display with Impact font
 * - Transaction history table
 * - Load more pagination
 * - Minimalist aesthetic with Impact and Typewriter fonts
 */

const WalletDashboardPage: React.FC = () => {
  const [page, setPage] = useState(1)
  const pageSize = 20

  const { balance, isLoading: balanceLoading } = useWallet()
  const {
    data: transactionsData,
    isLoading: transactionsLoading,
  } = useTransactions(undefined, page, pageSize)

  const transactions = transactionsData?.transactions || []
  const total = transactionsData?.total || 0
  const hasMore = page * pageSize < total

  // Format transaction amount with sign
  const formatAmount = (transaction: Transaction): string => {
    const isIncoming = ['DEPOSIT', 'REWARD', 'REFUND'].includes(transaction.type)
    const sign = isIncoming ? '+' : '-'
    const amount = Math.abs(transaction.amount).toFixed(2)
    return `${sign}${amount}`
  }

  // Get transaction type label
  const getTypeLabel = (transaction: Transaction): string => {
    const labels: Record<string, string> = {
      DEPOSIT: 'DEPOSIT',
      WITHDRAW: 'WITHDRAW',
      TRANSFER: 'TRANSFER',
      PAYMENT: 'TASK FEE',
      REWARD: 'AGENT REWARD',
      REFUND: 'REFUND',
    }
    return labels[transaction.type] || transaction.type
  }

  const handleLoadMore = () => {
    setPage((prev) => prev + 1)
  }

  return (
    <div className="min-h-screen bg-black text-white p-12">
      {/* Header */}
      <div className="mb-16">
        <div className="mb-4">
          <span className="font-mono text-xs tracking-widest uppercase text-gray-400">
            LANFINITAS AI
          </span>
        </div>
        <h1 className="font-impact text-8xl tracking-tighter uppercase mb-4">
          WALLET
        </h1>
        <p className="font-mono text-sm tracking-wider uppercase text-gray-400">
          MANAGE YOUR LFT TOKENS
        </p>
      </div>

      {/* Balance Display */}
      <div className="mb-20">
        {balanceLoading ? (
          <div className="font-mono text-sm text-gray-500 uppercase">
            LOADING BALANCE...
          </div>
        ) : balance ? (
          <div>
            {/* LFT Token Balance */}
            <div className="mb-12">
              <div className="font-impact text-9xl tracking-tighter mb-2">
                {balance.lftToken.toLocaleString('en-US', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </div>
              <div className="font-mono text-sm tracking-widest uppercase text-gray-400">
                LFT TOKEN
              </div>
            </div>

            {/* USDC Balance (Secondary) */}
            <div className="pt-8 border-t border-gray-800">
              <div className="flex items-baseline gap-4">
                <div className="font-impact text-4xl tracking-tighter">
                  {balance.usdc.toLocaleString('en-US', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </div>
                <div className="font-mono text-xs tracking-widest uppercase text-gray-400">
                  USDC
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="font-mono text-sm text-gray-500 uppercase">
            NO BALANCE DATA
          </div>
        )}
      </div>

      {/* Transactions Section */}
      <div className="pt-12 border-t border-gray-800">
        <h2 className="font-mono text-sm tracking-widest uppercase text-gray-400 mb-8">
          TRANSACTIONS
        </h2>

        {transactionsLoading && transactions.length === 0 ? (
          <div className="font-mono text-xs text-gray-500 uppercase">
            LOADING TRANSACTIONS...
          </div>
        ) : transactions.length > 0 ? (
          <div>
            {/* Transaction Table */}
            <table className="font-mono text-sm w-full">
              <thead>
                <tr className="text-left text-xs tracking-wider uppercase text-gray-400 border-b border-gray-800">
                  <th className="pb-4 font-normal">DATE</th>
                  <th className="pb-4 text-right font-normal">AMOUNT</th>
                  <th className="pb-4 font-normal">TYPE</th>
                  <th className="pb-4 font-normal">STATUS</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((transaction) => {
                  const isIncoming = ['DEPOSIT', 'REWARD', 'REFUND'].includes(transaction.type)
                  const amountColor = isIncoming ? 'text-white' : 'text-gray-400'

                  return (
                    <tr
                      key={transaction.id}
                      className="border-b border-gray-900 hover:bg-gray-900/30 transition-colors"
                    >
                      <td className="py-4 uppercase tracking-wider">
                        {format(new Date(transaction.timestamp), 'yyyy-MM-dd')}
                      </td>
                      <td className={`py-4 text-right uppercase tracking-wider ${amountColor}`}>
                        {formatAmount(transaction)} {transaction.currency}
                      </td>
                      <td className="py-4 uppercase tracking-wider text-gray-400">
                        {getTypeLabel(transaction)}
                      </td>
                      <td className="py-4 uppercase tracking-wider text-gray-500 text-xs">
                        {transaction.status}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>

            {/* Transaction Count */}
            <div className="mt-8 font-mono text-xs text-gray-500 uppercase">
              SHOWING {transactions.length} OF {total} TRANSACTIONS
            </div>

            {/* Load More Button */}
            {hasMore && (
              <div className="mt-8">
                <button
                  onClick={handleLoadMore}
                  disabled={transactionsLoading}
                  className="font-mono border border-white px-8 py-3 hover:bg-white hover:text-black transition-colors uppercase tracking-wider text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {transactionsLoading ? 'LOADING...' : 'LOAD MORE'}
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="font-mono text-xs text-gray-500 uppercase">
            NO TRANSACTIONS YET
          </div>
        )}
      </div>
    </div>
  )
}

export default WalletDashboardPage
