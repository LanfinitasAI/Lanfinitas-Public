import { Play, Square } from 'lucide-react'

export function TrainingPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Training Management
            </h1>
            <p className="mt-2 text-gray-600">
              Monitor and manage AI model training jobs
            </p>
          </div>
          <button className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 font-semibold text-white transition-colors hover:bg-indigo-700">
            <Play className="h-5 w-5" />
            Start Training
          </button>
        </div>

        <div className="grid gap-6">
          <div className="rounded-lg bg-white p-6 shadow">
            <h2 className="mb-4 text-xl font-semibold text-gray-900">
              Active Jobs
            </h2>
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Square className="mb-4 h-16 w-16 text-gray-400" />
              <h3 className="mb-2 text-lg font-semibold text-gray-900">
                No active training jobs
              </h3>
              <p className="text-gray-600">
                Start a new training job to see progress here
              </p>
            </div>
          </div>

          <div className="rounded-lg bg-white p-6 shadow">
            <h2 className="mb-4 text-xl font-semibold text-gray-900">
              Completed Jobs
            </h2>
            <div className="text-center py-8 text-gray-500">
              No completed jobs
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
