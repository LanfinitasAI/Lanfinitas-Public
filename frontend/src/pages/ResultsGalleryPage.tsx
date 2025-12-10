import { useState, useMemo } from 'react'
import { GitCompare, Grid3x3, List } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  ResultCard,
  FilterPanel,
  ComparisonView,
  DetailModal,
  type Result,
  type FilterOptions,
} from '@/components/results'
import {
  startOfDay,
  startOfWeek,
  startOfMonth,
  startOfYear,
  isAfter,
} from 'date-fns'

type ViewMode = 'grid' | 'comparison'

// Generate demo results
const generateDemoResults = (): Result[] => {
  const modelTypes = [
    'pattern-segmentation',
    'keypoint-detection',
    'seam-detection',
    'grainline-detection',
  ]
  const results: Result[] = []

  for (let i = 1; i <= 24; i++) {
    const daysAgo = Math.floor(Math.random() * 90)
    const createdDate = new Date()
    createdDate.setDate(createdDate.getDate() - daysAgo)

    results.push({
      id: `result-${i}`,
      thumbnailUrl: `https://picsum.photos/400/400?random=${i}`,
      fullImageUrl: `https://picsum.photos/1200/1200?random=${i}`,
      modelType: modelTypes[Math.floor(Math.random() * modelTypes.length)],
      confidence: 0.5 + Math.random() * 0.5, // 0.5 to 1.0
      createdAt: createdDate.toISOString(),
      metadata: {
        inputFile: `pattern-${i}.jpg`,
        processingTime: Math.floor(Math.random() * 15) + 1,
        outputFormat: ['PNG', 'SVG', 'DXF'][Math.floor(Math.random() * 3)],
      },
    })
  }

  return results.sort(
    (a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )
}

export function ResultsGalleryPage() {
  const [allResults] = useState<Result[]>(generateDemoResults())
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [selectedResult, setSelectedResult] = useState<Result | null>(null)
  const [detailModalOpen, setDetailModalOpen] = useState(false)
  const [comparisonResults, setComparisonResults] = useState<Result[]>([])

  const [filters, setFilters] = useState<FilterOptions>({
    searchQuery: '',
    modelType: 'all',
    dateRange: 'all',
    minConfidence: 0,
    sortBy: 'date-desc',
  })

  // Filter and sort results
  const filteredResults = useMemo(() => {
    let filtered = [...allResults]

    // Search filter
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase()
      filtered = filtered.filter(
        (result) =>
          result.modelType.toLowerCase().includes(query) ||
          result.metadata.inputFile.toLowerCase().includes(query) ||
          result.id.toLowerCase().includes(query)
      )
    }

    // Model type filter
    if (filters.modelType !== 'all') {
      filtered = filtered.filter(
        (result) => result.modelType === filters.modelType
      )
    }

    // Date range filter
    if (filters.dateRange !== 'all') {
      const now = new Date()
      let cutoffDate: Date

      switch (filters.dateRange) {
        case 'today':
          cutoffDate = startOfDay(now)
          break
        case 'week':
          cutoffDate = startOfWeek(now)
          break
        case 'month':
          cutoffDate = startOfMonth(now)
          break
        case 'year':
          cutoffDate = startOfYear(now)
          break
        default:
          cutoffDate = new Date(0)
      }

      filtered = filtered.filter((result) =>
        isAfter(new Date(result.createdAt), cutoffDate)
      )
    }

    // Confidence filter
    if (filters.minConfidence > 0) {
      filtered = filtered.filter(
        (result) => result.confidence >= filters.minConfidence
      )
    }

    // Sort
    filtered.sort((a, b) => {
      switch (filters.sortBy) {
        case 'date-desc':
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          )
        case 'date-asc':
          return (
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          )
        case 'confidence-desc':
          return b.confidence - a.confidence
        case 'confidence-asc':
          return a.confidence - b.confidence
        default:
          return 0
      }
    })

    return filtered
  }, [allResults, filters])

  const handleViewResult = (result: Result) => {
    setSelectedResult(result)
    setDetailModalOpen(true)
  }

  const handleDownloadResult = (result: Result) => {
    const link = document.createElement('a')
    link.href = result.fullImageUrl
    link.download = `${result.id}-${result.modelType}.png`
    link.click()
  }

  const handleDeleteResult = (result: Result) => {
    if (confirm(`Are you sure you want to delete result ${result.id}?`)) {
      // In a real app, this would call an API
      console.log('Deleting result:', result.id)
      alert('Delete functionality would be implemented here')
    }
  }

  const handleAddToComparison = (result: Result) => {
    if (comparisonResults.length >= 3) {
      alert('Maximum 3 results can be compared at once')
      return
    }

    if (!comparisonResults.find((r) => r.id === result.id)) {
      setComparisonResults([...comparisonResults, result])
      setViewMode('comparison')
    }
  }

  const handleRemoveFromComparison = (id: string) => {
    setComparisonResults(comparisonResults.filter((r) => r.id !== id))
    if (comparisonResults.length <= 1) {
      setViewMode('grid')
    }
  }

  const handleDownloadAllComparison = () => {
    comparisonResults.forEach((result) => {
      setTimeout(() => handleDownloadResult(result), 100)
    })
  }

  const handleResetFilters = () => {
    setFilters({
      searchQuery: '',
      modelType: 'all',
      dateRange: 'all',
      minConfidence: 0,
      sortBy: 'date-desc',
    })
  }

  return (
    <div className="flex h-screen flex-col bg-slate-50">
      {/* Header */}
      <header className="border-b bg-white px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Results Gallery
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              Browse and manage AI-generated pattern results
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* View Mode Toggle */}
            <div className="flex gap-1 rounded-lg border bg-white p-1">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
                disabled={viewMode === 'grid'}
              >
                <Grid3x3 className="mr-2 h-4 w-4" />
                Grid
              </Button>
              <Button
                variant={viewMode === 'comparison' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('comparison')}
                disabled={comparisonResults.length === 0}
              >
                <GitCompare className="mr-2 h-4 w-4" />
                Compare ({comparisonResults.length})
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-1 gap-4 overflow-hidden p-4">
        {/* Left Sidebar - Filters */}
        <div className="w-80 flex-shrink-0 overflow-y-auto">
          <FilterPanel
            filters={filters}
            onFilterChange={setFilters}
            onReset={handleResetFilters}
          />

          {/* Results Count */}
          <div className="mt-4 rounded-lg bg-white p-4 text-center">
            <p className="text-2xl font-bold text-slate-900">
              {filteredResults.length}
            </p>
            <p className="text-sm text-slate-600">
              {filteredResults.length === 1 ? 'Result' : 'Results'} Found
            </p>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto">
          {viewMode === 'grid' ? (
            /* Grid View */
            filteredResults.length === 0 ? (
              <div className="flex h-full items-center justify-center">
                <div className="text-center">
                  <List className="mx-auto h-16 w-16 text-slate-300" />
                  <p className="mt-4 text-lg font-medium text-slate-900">
                    No results found
                  </p>
                  <p className="mt-2 text-sm text-slate-600">
                    Try adjusting your filters or search query
                  </p>
                  <Button className="mt-4" onClick={handleResetFilters}>
                    Reset Filters
                  </Button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {filteredResults.map((result) => (
                  <ResultCard
                    key={result.id}
                    result={result}
                    onView={handleViewResult}
                    onDownload={handleDownloadResult}
                    onDelete={handleDeleteResult}
                    onCompare={handleAddToComparison}
                    isSelected={comparisonResults.some(
                      (r) => r.id === result.id
                    )}
                  />
                ))}
              </div>
            )
          ) : (
            /* Comparison View */
            <ComparisonView
              results={comparisonResults}
              onRemove={handleRemoveFromComparison}
              onDownloadAll={handleDownloadAllComparison}
              onClose={() => setViewMode('grid')}
            />
          )}
        </div>
      </div>

      {/* Detail Modal */}
      <DetailModal
        result={selectedResult}
        open={detailModalOpen}
        onOpenChange={setDetailModalOpen}
        onDownload={handleDownloadResult}
        onCompare={handleAddToComparison}
      />
    </div>
  )
}
