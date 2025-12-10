import { useParams } from 'react-router-dom'
import { Download, Edit, Trash2 } from 'lucide-react'

export function PatternDetailPage() {
  const { id } = useParams<{ id: string }>()

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Pattern #{id}
            </h1>
            <p className="mt-2 text-gray-600">View and manage pattern details</p>
          </div>
          <div className="flex gap-2">
            <button className="flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 font-semibold text-gray-700 transition-colors hover:bg-gray-50">
              <Edit className="h-5 w-5" />
              Edit
            </button>
            <button className="flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 font-semibold text-gray-700 transition-colors hover:bg-gray-50">
              <Download className="h-5 w-5" />
              Download
            </button>
            <button className="flex items-center gap-2 rounded-lg border border-red-300 px-4 py-2 font-semibold text-red-600 transition-colors hover:bg-red-50">
              <Trash2 className="h-5 w-5" />
              Delete
            </button>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-lg bg-white p-6 shadow">
            <h2 className="mb-4 text-xl font-semibold text-gray-900">
              Pattern Preview
            </h2>
            <div className="flex aspect-square items-center justify-center rounded-lg bg-gray-100">
              <p className="text-gray-500">Preview not available</p>
            </div>
          </div>

          <div className="rounded-lg bg-white p-6 shadow">
            <h2 className="mb-4 text-xl font-semibold text-gray-900">
              Details
            </h2>
            <dl className="space-y-4">
              <div>
                <dt className="text-sm font-medium text-gray-500">Status</dt>
                <dd className="mt-1 text-sm text-gray-900">Processing</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">
                  Created At
                </dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {new Date().toLocaleDateString()}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">
                  Model File
                </dt>
                <dd className="mt-1 text-sm text-gray-900">model.obj</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </div>
  )
}
