import React, { useState } from 'react'
import { Card } from '../ui/card'
import { Button } from '../ui/button'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { TrendingUp, TrendingDown, PieChart as PieChartIcon, BarChart3, LineChartIcon } from 'lucide-react'
import { TransactionStats } from '../../hooks/useWallet'

interface IncomeExpenseChartProps {
  stats: TransactionStats | undefined
  isLoading: boolean
}

const COLORS = {
  income: '#10b981', // green-500
  expense: '#ef4444', // red-500
  deposit: '#3b82f6', // blue-500
  withdraw: '#f59e0b', // amber-500
  transfer: '#8b5cf6', // purple-500
  payment: '#ec4899', // pink-500
  reward: '#14b8a6', // teal-500
  refund: '#06b6d4', // cyan-500
}

const PIE_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#14b8a6']

export const IncomeExpenseChart: React.FC<IncomeExpenseChartProps> = ({ stats, isLoading }) => {
  const [chartType, setChartType] = useState<'line' | 'bar' | 'pie'>('line')

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-100 rounded w-48 mb-4"></div>
          <div className="h-64 bg-gray-100 rounded"></div>
        </div>
      </Card>
    )
  }

  if (!stats) {
    return (
      <Card className="p-6">
        <div className="text-center text-gray-500 py-12">
          <PieChartIcon className="h-16 w-16 mx-auto mb-4 text-gray-400" />
          <p>No statistics available</p>
        </div>
      </Card>
    )
  }

  // Prepare data for line/bar chart
  const dailyData = stats.dailyStats || []

  // Prepare data for pie chart (income by type)
  const incomeByTypeData = Object.entries(stats.incomeByType || {}).map(([name, value]) => ({
    name: name.replace(/_/g, ' '),
    value,
  }))

  const expenseByTypeData = Object.entries(stats.expenseByType || {}).map(([name, value]) => ({
    name: name.replace(/_/g, ' '),
    value,
  }))

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="text-sm font-semibold text-gray-900 mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center gap-2 text-sm">
              <div
                className="h-3 w-3 rounded-full"
                style={{ backgroundColor: entry.color }}
              ></div>
              <span className="text-gray-600">{entry.name}:</span>
              <span className="font-semibold text-gray-900">${entry.value.toFixed(2)}</span>
            </div>
          ))}
        </div>
      )
    }
    return null
  }

  return (
    <Card className="overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b bg-gray-50">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Income & Expense Overview</h3>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant={chartType === 'line' ? 'default' : 'outline'}
              onClick={() => setChartType('line')}
            >
              <LineChartIcon className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant={chartType === 'bar' ? 'default' : 'outline'}
              onClick={() => setChartType('bar')}
            >
              <BarChart3 className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant={chartType === 'pie' ? 'default' : 'outline'}
              onClick={() => setChartType('pie')}
            >
              <PieChartIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <div className="text-xs text-gray-600">Total Income</div>
              <div className="text-lg font-bold text-green-600">
                ${stats.totalIncome.toFixed(2)}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-red-100 flex items-center justify-center">
              <TrendingDown className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <div className="text-xs text-gray-600">Total Expense</div>
              <div className="text-lg font-bold text-red-600">
                ${stats.totalExpense.toFixed(2)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Chart Area */}
      <div className="p-6">
        {chartType === 'line' && (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={dailyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="date"
                stroke="#6b7280"
                style={{ fontSize: '12px' }}
              />
              <YAxis stroke="#6b7280" style={{ fontSize: '12px' }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                wrapperStyle={{ fontSize: '14px' }}
                iconType="circle"
              />
              <Line
                type="monotone"
                dataKey="income"
                stroke={COLORS.income}
                strokeWidth={2}
                dot={{ fill: COLORS.income, r: 4 }}
                activeDot={{ r: 6 }}
                name="Income"
              />
              <Line
                type="monotone"
                dataKey="expense"
                stroke={COLORS.expense}
                strokeWidth={2}
                dot={{ fill: COLORS.expense, r: 4 }}
                activeDot={{ r: 6 }}
                name="Expense"
              />
            </LineChart>
          </ResponsiveContainer>
        )}

        {chartType === 'bar' && (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={dailyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="date"
                stroke="#6b7280"
                style={{ fontSize: '12px' }}
              />
              <YAxis stroke="#6b7280" style={{ fontSize: '12px' }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                wrapperStyle={{ fontSize: '14px' }}
                iconType="circle"
              />
              <Bar dataKey="income" fill={COLORS.income} name="Income" radius={[8, 8, 0, 0]} />
              <Bar dataKey="expense" fill={COLORS.expense} name="Expense" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}

        {chartType === 'pie' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Income Pie Chart */}
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-4 text-center">
                Income by Type
              </h4>
              {incomeByTypeData.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={incomeByTypeData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {incomeByTypeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: number) => `$${value.toFixed(2)}`}
                      contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-64 flex items-center justify-center text-gray-400 text-sm">
                  No income data
                </div>
              )}
            </div>

            {/* Expense Pie Chart */}
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-4 text-center">
                Expense by Type
              </h4>
              {expenseByTypeData.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={expenseByTypeData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {expenseByTypeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: number) => `$${value.toFixed(2)}`}
                      contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-64 flex items-center justify-center text-gray-400 text-sm">
                  No expense data
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Footer Stats */}
      <div className="p-4 border-t bg-gray-50">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs text-gray-600">Net Balance</div>
            <div
              className={`text-lg font-bold ${
                stats.totalIncome - stats.totalExpense >= 0 ? 'text-green-600' : 'text-red-600'
              }`}
            >
              ${(stats.totalIncome - stats.totalExpense).toFixed(2)}
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-gray-600">Period</div>
            <div className="text-sm font-medium text-gray-900">Last 30 days</div>
          </div>
        </div>
      </div>
    </Card>
  )
}
