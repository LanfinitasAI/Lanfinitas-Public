import { Upload } from 'lucide-react'

export function NewPatternPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Generate New Pattern
          </h1>
          <p className="mt-2 text-gray-600">
            Upload a 3D model to generate 2D patterns
          </p>
        </div>

        <div className="rounded-lg bg-white p-8 shadow">
          <div className="mb-6">
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Pattern Name
            </label>
            <input
              type="text"
              placeholder="Enter pattern name"
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
            />
          </div>

          <div className="mb-6">
            <label className="mb-2 block text-sm font-medium text-gray-700">
              3D Model File
            </label>
            <div className="flex items-center justify-center rounded-lg border-2 border-dashed border-gray-300 p-12 transition-colors hover:border-indigo-400">
              <div className="text-center">
                <Upload className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                <p className="mb-2 text-sm font-medium text-gray-900">
                  Click to upload or drag and drop
                </p>
                <p className="text-xs text-gray-500">
                  OBJ, FBX, STEP, or STL files
                </p>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Description (Optional)
            </label>
            <textarea
              rows={4}
              placeholder="Add a description for this pattern"
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
            />
          </div>

          <div className="flex gap-4">
            <button className="flex-1 rounded-lg bg-indigo-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-indigo-700">
              Generate Pattern
            </button>
            <button className="rounded-lg border border-gray-300 px-6 py-3 font-semibold text-gray-700 transition-colors hover:bg-gray-50">
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
