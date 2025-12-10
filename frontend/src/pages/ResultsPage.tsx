import { BarChart } from 'lucide-react'

export function ResultsPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Results</h1>
          <p className="mt-2 text-gray-600">
            View training results and metrics
          </p>
        </div>

        <div className="rounded-lg bg-white p-8 shadow">
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <BarChart className="mb-4 h-16 w-16 text-gray-400" />
            <h2 className="mb-2 text-xl font-semibold text-gray-900">
              No Results Available
            </h2>
            <p className="text-gray-600">
              Complete a training job to view results and metrics
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
