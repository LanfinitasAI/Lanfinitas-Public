import React, { useState, useEffect, useRef } from 'react'
import {
  useTemplates,
  useTemplateMutations,
  Template,
  TemplateFilters as Filters,
} from '../hooks/useTemplates'

/**
 * Template Library Page - Minimalist Black/White Design
 *
 * Features:
 * - Template grid with Unicode star ratings
 * - Search functionality
 * - Use template button
 * - Infinite scroll
 * - Minimalist aesthetic with Impact and Typewriter fonts
 */

const TemplateLibraryPage: React.FC = () => {
  const [filters, setFilters] = useState<Filters>({
    sortBy: 'popular',
  })
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null)
  const [showUseModal, setShowUseModal] = useState(false)
  const [templateName, setTemplateName] = useState('')
  const [searchQuery, setSearchQuery] = useState('')

  const loadMoreRef = useRef<HTMLDivElement>(null)

  // Fetch data
  const {
    data,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useTemplates(filters)

  const { useTemplate } = useTemplateMutations()

  // Flatten all pages of templates
  const templates = data?.pages.flatMap((page) => page.templates) || []
  const total = data?.pages[0]?.total || 0

  // Infinite scroll
  useEffect(() => {
    if (!loadMoreRef.current || !hasNextPage || isFetchingNextPage) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          fetchNextPage()
        }
      },
      { threshold: 0.5 }
    )

    observer.observe(loadMoreRef.current)

    return () => observer.disconnect()
  }, [hasNextPage, isFetchingNextPage, fetchNextPage])

  // Handle search
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchQuery(value)
    setFilters((prev) => ({ ...prev, search: value || undefined }))
  }

  // Render star rating with Unicode
  const renderStars = (rating: number): JSX.Element => {
    const fullStars = Math.floor(rating)
    const emptyStars = 5 - fullStars

    return (
      <div className="text-yellow-400 text-lg">
        {'★'.repeat(fullStars)}
        {'☆'.repeat(emptyStars)}
      </div>
    )
  }

  const handleUseTemplate = (template: Template) => {
    setSelectedTemplate(template)
    setTemplateName(`${template.name} Instance`)
    setShowUseModal(true)
  }

  const handleConfirmUse = async () => {
    if (!selectedTemplate) return

    try {
      await useTemplate.mutateAsync({
        templateId: selectedTemplate.id,
        name: templateName,
      })

      setShowUseModal(false)
      setSelectedTemplate(null)
      setTemplateName('')

      alert('AGENT CREATED SUCCESSFULLY!')
    } catch (error) {
      console.error('Failed to use template:', error)
      alert('FAILED TO CREATE AGENT')
    }
  }

  return (
    <div className="min-h-screen bg-black text-white p-12">
      {/* Header */}
      <div className="mb-16">
        <div className="mb-4">
          <span className="font-mono text-xs tracking-widest uppercase text-gray-400">
            LANFINITAS AI
          </span>
        </div>
        <h1 className="font-impact text-8xl tracking-tighter uppercase mb-4">
          TEMPLATE LIBRARY
        </h1>
        <p className="font-mono text-sm tracking-wider uppercase text-gray-400">
          {total.toLocaleString()} PROFESSIONAL TEMPLATES AVAILABLE
        </p>
      </div>

      {/* Search Bar */}
      <div className="mb-16">
        <input
          type="text"
          value={searchQuery}
          onChange={handleSearch}
          placeholder="SEARCH TEMPLATES"
          className="font-mono bg-transparent border-0 border-b border-white focus:border-white focus:outline-none w-full py-3 placeholder:text-gray-600 uppercase tracking-wider text-lg"
        />
      </div>

      {/* Templates Grid */}
      {isLoading && templates.length === 0 ? (
        <div className="font-mono text-sm text-gray-500 uppercase">
          LOADING TEMPLATES...
        </div>
      ) : templates.length === 0 ? (
        <div className="font-mono text-sm text-gray-500 uppercase">
          NO TEMPLATES FOUND
          {searchQuery && <div className="mt-2">TRY ADJUSTING YOUR SEARCH</div>}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {templates.map((template) => (
              <div
                key={template.id}
                className="font-mono border border-gray-800 p-6 hover:border-white transition-colors"
              >
                {/* Template Name */}
                <h3 className="text-lg tracking-wider uppercase mb-4">
                  {template.name}
                </h3>

                {/* Description */}
                <p className="text-sm text-gray-400 uppercase mb-4 line-clamp-2">
                  {template.description}
                </p>

                {/* Rating */}
                <div className="mb-3">
                  {renderStars(template.rating)}
                </div>

                {/* Usage Count */}
                <div className="text-sm text-gray-400 uppercase mb-4">
                  {template.usageCount.toLocaleString()} USES
                </div>

                {/* Category */}
                <div className="text-xs text-gray-500 uppercase mb-6">
                  {template.category}
                </div>

                {/* Use Button */}
                <button
                  onClick={() => handleUseTemplate(template)}
                  className="w-full border border-white px-6 py-2 hover:bg-white hover:text-black transition-colors uppercase tracking-wider text-sm"
                >
                  USE
                </button>
              </div>
            ))}
          </div>

          {/* Infinite Scroll Trigger */}
          {hasNextPage && (
            <div
              ref={loadMoreRef}
              className="flex justify-center items-center py-12 mt-12"
            >
              {isFetchingNextPage ? (
                <div className="font-mono text-sm text-gray-500 uppercase">
                  LOADING MORE...
                </div>
              ) : (
                <div className="font-mono text-sm text-gray-600 uppercase">
                  SCROLL FOR MORE
                </div>
              )}
            </div>
          )}

          {/* End of List */}
          {!hasNextPage && templates.length > 0 && (
            <div className="text-center py-12 mt-12 border-t border-gray-800">
              <p className="font-mono text-sm text-gray-500 uppercase">
                END OF LIST
              </p>
            </div>
          )}
        </>
      )}

      {/* Use Template Modal */}
      {showUseModal && selectedTemplate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-black border border-white w-full max-w-md p-8">
            <h3 className="font-mono text-lg tracking-wider uppercase mb-6">
              CREATE AGENT FROM TEMPLATE
            </h3>
            <p className="font-mono text-sm text-gray-400 uppercase mb-6">
              CREATING: {selectedTemplate.name}
            </p>
            <div className="mb-6">
              <label className="font-mono text-xs tracking-wider uppercase text-gray-400 block mb-2">
                AGENT NAME
              </label>
              <input
                type="text"
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                placeholder="MY CUSTOM AGENT"
                className="font-mono bg-transparent border-0 border-b border-white focus:border-white focus:outline-none w-full py-2 placeholder:text-gray-600 uppercase tracking-wider"
                autoFocus
              />
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => setShowUseModal(false)}
                disabled={useTemplate.isPending}
                className="flex-1 font-mono border border-gray-600 px-6 py-3 hover:border-white transition-colors uppercase tracking-wider text-sm disabled:opacity-50"
              >
                CANCEL
              </button>
              <button
                onClick={handleConfirmUse}
                disabled={!templateName.trim() || useTemplate.isPending}
                className="flex-1 font-mono border border-white px-6 py-3 hover:bg-white hover:text-black transition-colors uppercase tracking-wider text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {useTemplate.isPending ? 'CREATING...' : 'CREATE'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default TemplateLibraryPage
