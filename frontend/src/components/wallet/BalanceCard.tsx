import React from 'react'
import { Card } from '../ui/card'
import { Button } from '../ui/button'
import { Wallet, TrendingUp, TrendingDown, RefreshCw, Download, Upload, Eye, EyeOff } from 'lucide-react'
import { WalletBalance } from '../../hooks/useWallet'
import { format } from 'date-fns'

interface BalanceCardProps {
  balance: WalletBalance | undefined
  isLoading: boolean
  onDeposit: () => void
  onWithdraw: () => void
  onRefresh: () => void
}

export const BalanceCard: React.FC<BalanceCardProps> = ({
  balance,
  isLoading,
  onDeposit,
  onWithdraw,
  onRefresh,
}) => {
  const [showBalance, setShowBalance] = React.useState(true)

  const formatCurrency = (amount: number) => {
    if (!showBalance) return '••••••'
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount)
  }

  const formatLargeNumber = (amount: number) => {
    if (!showBalance) return '••••••'
    if (amount >= 1000000) {
      return `${(amount / 1000000).toFixed(2)}M`
    } else if (amount >= 1000) {
      return `${(amount / 1000).toFixed(2)}K`
    }
    return amount.toFixed(2)
  }

  if (isLoading) {
    return (
      <Card className="p-6 bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
        <div className="animate-pulse">
          <div className="h-6 bg-white/20 rounded w-32 mb-4"></div>
          <div className="h-12 bg-white/20 rounded w-48 mb-6"></div>
          <div className="flex gap-4">
            <div className="h-10 bg-white/20 rounded w-24"></div>
            <div className="h-10 bg-white/20 rounded w-24"></div>
          </div>
        </div>
      </Card>
    )
  }

  return (
    <Card className="overflow-hidden">
      {/* Main Balance Section */}
      <div className="p-6 bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
              <Wallet className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Total Balance</h3>
              <p className="text-sm text-white/80">
                {balance?.lastUpdated
                  ? `Updated ${format(new Date(balance.lastUpdated), 'MMM d, HH:mm')}`
                  : 'Loading...'}
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setShowBalance(!showBalance)}
              className="text-white hover:bg-white/20"
            >
              {showBalance ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={onRefresh}
              className="text-white hover:bg-white/20"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Balance Display */}
        <div className="space-y-4">
          {/* LFT Token */}
          <div>
            <div className="text-sm text-white/80 mb-1">LFT Token</div>
            <div className="text-4xl font-bold tracking-tight">
              {formatLargeNumber(balance?.lftToken || 0)}
              <span className="text-xl ml-2 text-white/80">LFT</span>
            </div>
            <div className="text-sm text-white/80 mt-1">
              ≈ ${formatCurrency((balance?.lftToken || 0) * 0.1)} USD
            </div>
          </div>

          {/* USDC */}
          <div>
            <div className="text-sm text-white/80 mb-1">USDC Balance</div>
            <div className="text-3xl font-bold">
              ${formatCurrency(balance?.usdc || 0)}
              <span className="text-lg ml-2 text-white/80">USDC</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 mt-6">
          <Button
            onClick={onDeposit}
            className="flex-1 bg-white text-indigo-600 hover:bg-white/90"
          >
            <Download className="h-4 w-4 mr-2" />
            Deposit
          </Button>
          <Button
            onClick={onWithdraw}
            className="flex-1 bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm"
          >
            <Upload className="h-4 w-4 mr-2" />
            Withdraw
          </Button>
        </div>
      </div>

      {/* Quick Stats Section */}
      <div className="p-4 bg-gray-50 grid grid-cols-2 gap-4">
        <div>
          <div className="flex items-center gap-2 text-green-600 mb-1">
            <TrendingUp className="h-4 w-4" />
            <span className="text-xs font-medium">Total Income</span>
          </div>
          <div className="text-lg font-bold text-gray-900">
            {showBalance ? `$${formatCurrency(0)}` : '••••••'}
          </div>
        </div>
        <div>
          <div className="flex items-center gap-2 text-red-600 mb-1">
            <TrendingDown className="h-4 w-4" />
            <span className="text-xs font-medium">Total Expense</span>
          </div>
          <div className="text-lg font-bold text-gray-900">
            {showBalance ? `$${formatCurrency(0)}` : '••••••'}
          </div>
        </div>
      </div>
    </Card>
  )
}
