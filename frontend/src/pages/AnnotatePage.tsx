import { Tag } from 'lucide-react'

export function AnnotatePage() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Annotation Tool
          </h1>
          <p className="mt-2 text-gray-600">
            Annotate patterns for training data
          </p>
        </div>

        <div className="rounded-lg bg-white p-8 shadow">
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Tag className="mb-4 h-16 w-16 text-gray-400" />
            <h2 className="mb-2 text-xl font-semibold text-gray-900">
              Annotation Tool
            </h2>
            <p className="text-gray-600">
              Coming soon - Advanced pattern annotation features
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
