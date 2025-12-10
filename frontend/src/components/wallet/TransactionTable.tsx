import React, { useState } from 'react'
import { Card } from '../ui/card'
import { Button } from '../ui/button'
import {
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Download,
  Upload,
  ArrowRightLeft,
  CreditCard,
  Gift,
  RotateCcw,
  ExternalLink,
  Search,
  Filter,
  X,
} from 'lucide-react'
import { Transaction } from '../../hooks/useWallet'
import { format } from 'date-fns'

interface TransactionTableProps {
  transactions: Transaction[]
  total: number
  isLoading: boolean
  page: number
  pageSize: number
  onPageChange: (page: number) => void
  onPageSizeChange: (size: number) => void
}

const getTransactionIcon = (type: string) => {
  switch (type) {
    case 'DEPOSIT':
      return <Download className="h-4 w-4" />
    case 'WITHDRAW':
      return <Upload className="h-4 w-4" />
    case 'TRANSFER':
      return <ArrowRightLeft className="h-4 w-4" />
    case 'PAYMENT':
      return <CreditCard className="h-4 w-4" />
    case 'REWARD':
      return <Gift className="h-4 w-4" />
    case 'REFUND':
      return <RotateCcw className="h-4 w-4" />
    default:
      return <ArrowRightLeft className="h-4 w-4" />
  }
}

const getTransactionColor = (type: string) => {
  switch (type) {
    case 'DEPOSIT':
    case 'REWARD':
    case 'REFUND':
      return 'text-green-600 bg-green-100'
    case 'WITHDRAW':
    case 'PAYMENT':
      return 'text-red-600 bg-red-100'
    case 'TRANSFER':
      return 'text-blue-600 bg-blue-100'
    default:
      return 'text-gray-600 bg-gray-100'
  }
}

const getStatusBadge = (status: string) => {
  const styles: Record<string, string> = {
    PENDING: 'bg-yellow-100 text-yellow-700',
    COMPLETED: 'bg-green-100 text-green-700',
    FAILED: 'bg-red-100 text-red-700',
    CANCELLED: 'bg-gray-100 text-gray-600',
  }

  return (
    <span className={`px-2 py-1 text-xs font-semibold rounded ${styles[status] || styles.PENDING}`}>
      {status}
    </span>
  )
}

export const TransactionTable: React.FC<TransactionTableProps> = ({
  transactions,
  total,
  isLoading,
  page,
  pageSize,
  onPageChange,
  onPageSizeChange,
}) => {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())
  const [searchQuery, setSearchQuery] = useState('')
  const [showFilters, setShowFilters] = useState(false)

  const toggleExpand = (id: string) => {
    const newExpanded = new Set(expandedIds)
    if (newExpanded.has(id)) {
      newExpanded.delete(id)
    } else {
      newExpanded.add(id)
    }
    setExpandedIds(newExpanded)
  }

  const totalPages = Math.ceil(total / pageSize)

  const filteredTransactions = transactions.filter((tx) => {
    if (!searchQuery) return true
    return (
      tx.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.type.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-100 rounded"></div>
          ))}
        </div>
      </Card>
    )
  }

  return (
    <Card className="overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b bg-gray-50">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Transaction History</h3>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setShowFilters(!showFilters)}
              className={showFilters ? 'bg-indigo-50 text-indigo-600' : ''}
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search transactions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Filter Pills */}
        {showFilters && (
          <div className="mt-4 flex flex-wrap gap-2">
            <Button size="sm" variant="outline" className="text-xs">
              All Types
            </Button>
            <Button size="sm" variant="outline" className="text-xs">
              Deposit
            </Button>
            <Button size="sm" variant="outline" className="text-xs">
              Withdraw
            </Button>
            <Button size="sm" variant="outline" className="text-xs">
              Transfer
            </Button>
            <Button size="sm" variant="outline" className="text-xs">
              Payment
            </Button>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        {filteredTransactions.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <CreditCard className="h-16 w-16 mx-auto mb-4 text-gray-400" />
            <p className="text-lg font-medium">No transactions found</p>
            <p className="text-sm mt-2">Your transactions will appear here</p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                  Type
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                  Description
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">
                  Amount
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                  Date
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">
                  Details
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredTransactions.map((tx) => {
                const isExpanded = expandedIds.has(tx.id)
                const isIncome = ['DEPOSIT', 'REWARD', 'REFUND'].includes(tx.type)

                return (
                  <React.Fragment key={tx.id}>
                    <tr className="hover:bg-gray-50 transition-colors">
                      {/* Type */}
                      <td className="px-4 py-4">
                        <div
                          className={`inline-flex items-center gap-2 px-2 py-1 rounded ${getTransactionColor(
                            tx.type
                          )}`}
                        >
                          {getTransactionIcon(tx.type)}
                          <span className="text-xs font-medium">{tx.type}</span>
                        </div>
                      </td>

                      {/* Description */}
                      <td className="px-4 py-4">
                        <div className="text-sm font-medium text-gray-900">{tx.description}</div>
                        <div className="text-xs text-gray-500 mt-1">ID: {tx.id.slice(0, 8)}...</div>
                      </td>

                      {/* Amount */}
                      <td className="px-4 py-4 text-right">
                        <div className={`text-sm font-bold ${isIncome ? 'text-green-600' : 'text-red-600'}`}>
                          {isIncome ? '+' : '-'}
                          {tx.amount.toFixed(2)} {tx.currency}
                        </div>
                        {tx.fee && (
                          <div className="text-xs text-gray-500 mt-1">Fee: {tx.fee} {tx.currency}</div>
                        )}
                      </td>

                      {/* Status */}
                      <td className="px-4 py-4">{getStatusBadge(tx.status)}</td>

                      {/* Date */}
                      <td className="px-4 py-4">
                        <div className="text-sm text-gray-900">
                          {format(new Date(tx.timestamp), 'MMM d, yyyy')}
                        </div>
                        <div className="text-xs text-gray-500">
                          {format(new Date(tx.timestamp), 'HH:mm:ss')}
                        </div>
                      </td>

                      {/* Details Toggle */}
                      <td className="px-4 py-4 text-center">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => toggleExpand(tx.id)}
                        >
                          {isExpanded ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </Button>
                      </td>
                    </tr>

                    {/* Expanded Details */}
                    {isExpanded && (
                      <tr>
                        <td colSpan={6} className="px-4 py-4 bg-gray-50">
                          <div className="grid grid-cols-2 gap-4">
                            {tx.from && (
                              <div>
                                <div className="text-xs font-semibold text-gray-500 uppercase mb-1">
                                  From
                                </div>
                                <div className="text-sm text-gray-900 font-mono">{tx.from}</div>
                              </div>
                            )}
                            {tx.to && (
                              <div>
                                <div className="text-xs font-semibold text-gray-500 uppercase mb-1">
                                  To
                                </div>
                                <div className="text-sm text-gray-900 font-mono">{tx.to}</div>
                              </div>
                            )}
                            {tx.txHash && (
                              <div>
                                <div className="text-xs font-semibold text-gray-500 uppercase mb-1">
                                  Transaction Hash
                                </div>
                                <div className="flex items-center gap-2">
                                  <div className="text-sm text-gray-900 font-mono truncate">
                                    {tx.txHash}
                                  </div>
                                  <a
                                    href={`https://etherscan.io/tx/${tx.txHash}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-indigo-600 hover:text-indigo-700"
                                  >
                                    <ExternalLink className="h-4 w-4" />
                                  </a>
                                </div>
                              </div>
                            )}
                            {tx.metadata && Object.keys(tx.metadata).length > 0 && (
                              <div className="col-span-2">
                                <div className="text-xs font-semibold text-gray-500 uppercase mb-1">
                                  Additional Info
                                </div>
                                <pre className="text-xs text-gray-700 bg-white p-2 rounded border">
                                  {JSON.stringify(tx.metadata, null, 2)}
                                </pre>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                )
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {filteredTransactions.length > 0 && (
        <div className="p-4 border-t bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Rows per page:</span>
              <select
                value={pageSize}
                onChange={(e) => onPageSizeChange(Number(e.target.value))}
                className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>

            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">
                {(page - 1) * pageSize + 1} - {Math.min(page * pageSize, total)} of {total}
              </span>

              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onPageChange(page - 1)}
                  disabled={page === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onPageChange(page + 1)}
                  disabled={page >= totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Card>
  )
}
