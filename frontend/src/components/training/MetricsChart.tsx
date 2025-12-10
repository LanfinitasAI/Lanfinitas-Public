import { Card } from '@/components/ui/card'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

export interface MetricPoint {
  epoch: number
  loss: number
  accuracy?: number
  valLoss?: number
  valAccuracy?: number
}

interface MetricsChartProps {
  data: MetricPoint[]
  title?: string
  showValidation?: boolean
}

export function MetricsChart({
  data,
  title = 'Training Metrics',
  showValidation = false,
}: MetricsChartProps) {
  if (data.length === 0) {
    return (
      <Card className="p-6">
        <h3 className="mb-4 text-lg font-semibold text-slate-900">{title}</h3>
        <div className="flex h-64 items-center justify-center text-slate-400">
          No data available
        </div>
      </Card>
    )
  }

  return (
    <Card className="p-6">
      <h3 className="mb-4 text-lg font-semibold text-slate-900">{title}</h3>

      {/* Loss Chart */}
      <div className="mb-8">
        <h4 className="mb-3 text-sm font-medium text-slate-700">Loss</h4>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis
              dataKey="epoch"
              label={{ value: 'Epoch', position: 'insideBottom', offset: -5 }}
              stroke="#64748b"
            />
            <YAxis
              label={{ value: 'Loss', angle: -90, position: 'insideLeft' }}
              stroke="#64748b"
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
              }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="loss"
              stroke="#ef4444"
              strokeWidth={2}
              dot={{ fill: '#ef4444', r: 4 }}
              name="Training Loss"
            />
            {showValidation && (
              <Line
                type="monotone"
                dataKey="valLoss"
                stroke="#f97316"
                strokeWidth={2}
                dot={{ fill: '#f97316', r: 4 }}
                name="Validation Loss"
                strokeDasharray="5 5"
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Accuracy Chart */}
      {data.some((d) => d.accuracy !== undefined) && (
        <div>
          <h4 className="mb-3 text-sm font-medium text-slate-700">Accuracy</h4>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis
                dataKey="epoch"
                label={{ value: 'Epoch', position: 'insideBottom', offset: -5 }}
                stroke="#64748b"
              />
              <YAxis
                label={{ value: 'Accuracy', angle: -90, position: 'insideLeft' }}
                stroke="#64748b"
                domain={[0, 1]}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                }}
                formatter={(value: number) => `${(value * 100).toFixed(2)}%`}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="accuracy"
                stroke="#10b981"
                strokeWidth={2}
                dot={{ fill: '#10b981', r: 4 }}
                name="Training Accuracy"
              />
              {showValidation && (
                <Line
                  type="monotone"
                  dataKey="valAccuracy"
                  stroke="#14b8a6"
                  strokeWidth={2}
                  dot={{ fill: '#14b8a6', r: 4 }}
                  name="Validation Accuracy"
                  strokeDasharray="5 5"
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </Card>
  )
}
