import { Layers, Plus } from 'lucide-react'
import { Link } from 'react-router-dom'

export function PatternsPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Patterns</h1>
            <p className="mt-2 text-gray-600">
              Manage your 3D to 2D pattern conversions
            </p>
          </div>
          <Link
            to="/patterns/new"
            className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 font-semibold text-white transition-colors hover:bg-indigo-700"
          >
            <Plus className="h-5 w-5" />
            New Pattern
          </Link>
        </div>

        <div className="rounded-lg bg-white p-8 shadow">
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Layers className="mb-4 h-16 w-16 text-gray-400" />
            <h2 className="mb-2 text-xl font-semibold text-gray-900">
              No patterns yet
            </h2>
            <p className="mb-6 text-gray-600">
              Get started by creating your first pattern
            </p>
            <Link
              to="/patterns/new"
              className="rounded-lg bg-indigo-600 px-6 py-2 font-semibold text-white transition-colors hover:bg-indigo-700"
            >
              Create Pattern
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
