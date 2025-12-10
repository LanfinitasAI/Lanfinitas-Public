import React, { useState } from 'react'
import { Button } from '../ui/button'
import { X, AlertCircle } from 'lucide-react'
import { DepositRequest, WithdrawRequest } from '../../hooks/useWallet'

interface DepositWithdrawModalProps {
  type: 'deposit' | 'withdraw'
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: DepositRequest | WithdrawRequest) => Promise<void>
  isLoading: boolean
}

export const DepositWithdrawModal: React.FC<DepositWithdrawModalProps> = ({
  type,
  isOpen,
  onClose,
  onSubmit,
  isLoading,
}) => {
  const [amount, setAmount] = useState('')
  const [currency, setCurrency] = useState<'LFT' | 'USDC'>('LFT')
  const [method, setMethod] = useState<'CRYPTO' | 'CREDIT_CARD' | 'BANK_TRANSFER'>('CRYPTO')
  const [address, setAddress] = useState('')
  const [error, setError] = useState('')

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    const amountNum = parseFloat(amount)
    if (isNaN(amountNum) || amountNum <= 0) {
      setError('Please enter a valid amount')
      return
    }

    if (type === 'withdraw' && !address) {
      setError('Please enter withdrawal address')
      return
    }

    try {
      if (type === 'deposit') {
        await onSubmit({
          amount: amountNum,
          currency,
          method,
        } as DepositRequest)
      } else {
        await onSubmit({
          amount: amountNum,
          currency,
          address,
        } as WithdrawRequest)
      }

      // Reset form
      setAmount('')
      setAddress('')
      setError('')
      onClose()
    } catch (err: any) {
      setError(err.message || 'Operation failed')
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h3 className="text-xl font-semibold text-gray-900">
            {type === 'deposit' ? 'Deposit Funds' : 'Withdraw Funds'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={isLoading}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Currency Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Currency
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setCurrency('LFT')}
                className={`p-3 border-2 rounded-lg font-medium transition-all ${
                  currency === 'LFT'
                    ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                LFT Token
              </button>
              <button
                type="button"
                onClick={() => setCurrency('USDC')}
                className={`p-3 border-2 rounded-lg font-medium transition-all ${
                  currency === 'USDC'
                    ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                USDC
              </button>
            </div>
          </div>

          {/* Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Amount
            </label>
            <div className="relative">
              <input
                type="number"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-lg"
                disabled={isLoading}
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">
                {currency}
              </div>
            </div>
          </div>

          {/* Deposit Method (Deposit only) */}
          {type === 'deposit' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Payment Method
              </label>
              <select
                value={method}
                onChange={(e) => setMethod(e.target.value as any)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                disabled={isLoading}
              >
                <option value="CRYPTO">Cryptocurrency</option>
                <option value="CREDIT_CARD">Credit Card</option>
                <option value="BANK_TRANSFER">Bank Transfer</option>
              </select>
            </div>
          )}

          {/* Withdrawal Address (Withdraw only) */}
          {type === 'withdraw' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Withdrawal Address
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="0x..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono text-sm"
                disabled={isLoading}
              />
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Info Box */}
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-700">
              {type === 'deposit'
                ? 'Deposits typically take 5-10 minutes to confirm on the blockchain.'
                : 'Withdrawals are processed within 24 hours. Please ensure the address is correct.'}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" className="flex-1" disabled={isLoading}>
              {isLoading
                ? 'Processing...'
                : type === 'deposit'
                ? 'Deposit'
                : 'Withdraw'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
