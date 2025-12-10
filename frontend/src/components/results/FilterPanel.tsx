import { Search, SlidersHorizontal, X } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export interface FilterOptions {
  searchQuery: string
  modelType: string
  dateRange: string
  minConfidence: number
  sortBy: string
}

interface FilterPanelProps {
  filters: FilterOptions
  onFilterChange: (filters: FilterOptions) => void
  onReset: () => void
}

const modelTypes = [
  { value: 'all', label: 'All Models' },
  { value: 'pattern-segmentation', label: 'Pattern Segmentation' },
  { value: 'keypoint-detection', label: 'Keypoint Detection' },
  { value: 'seam-detection', label: 'Seam Detection' },
  { value: 'grainline-detection', label: 'Grainline Detection' },
]

const dateRanges = [
  { value: 'all', label: 'All Time' },
  { value: 'today', label: 'Today' },
  { value: 'week', label: 'This Week' },
  { value: 'month', label: 'This Month' },
  { value: 'year', label: 'This Year' },
]

const sortOptions = [
  { value: 'date-desc', label: 'Newest First' },
  { value: 'date-asc', label: 'Oldest First' },
  { value: 'confidence-desc', label: 'Highest Confidence' },
  { value: 'confidence-asc', label: 'Lowest Confidence' },
]

const confidenceLevels = [
  { value: 0, label: 'All Results' },
  { value: 0.5, label: '50% and above' },
  { value: 0.6, label: '60% and above' },
  { value: 0.7, label: '70% and above' },
  { value: 0.8, label: '80% and above' },
  { value: 0.9, label: '90% and above' },
]

export function FilterPanel({
  filters,
  onFilterChange,
  onReset,
}: FilterPanelProps) {
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange({ ...filters, searchQuery: e.target.value })
  }

  const handleModelTypeChange = (value: string) => {
    onFilterChange({ ...filters, modelType: value })
  }

  const handleDateRangeChange = (value: string) => {
    onFilterChange({ ...filters, dateRange: value })
  }

  const handleConfidenceChange = (value: string) => {
    onFilterChange({ ...filters, minConfidence: parseFloat(value) })
  }

  const handleSortChange = (value: string) => {
    onFilterChange({ ...filters, sortBy: value })
  }

  const hasActiveFilters =
    filters.searchQuery ||
    filters.modelType !== 'all' ||
    filters.dateRange !== 'all' ||
    filters.minConfidence > 0 ||
    filters.sortBy !== 'date-desc'

  return (
    <Card className="p-4">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-5 w-5 text-slate-600" />
          <h3 className="font-semibold text-slate-900">Filters</h3>
        </div>
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={onReset}>
            <X className="mr-2 h-4 w-4" />
            Reset
          </Button>
        )}
      </div>

      <div className="space-y-4">
        {/* Search */}
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Search
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              type="text"
              placeholder="Search results..."
              value={filters.searchQuery}
              onChange={handleSearchChange}
              className="pl-10"
            />
          </div>
        </div>

        {/* Model Type */}
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Model Type
          </label>
          <Select value={filters.modelType} onValueChange={handleModelTypeChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select model type" />
            </SelectTrigger>
            <SelectContent>
              {modelTypes.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Date Range */}
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Date Range
          </label>
          <Select value={filters.dateRange} onValueChange={handleDateRangeChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select date range" />
            </SelectTrigger>
            <SelectContent>
              {dateRanges.map((range) => (
                <SelectItem key={range.value} value={range.value}>
                  {range.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Confidence */}
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Minimum Confidence
          </label>
          <Select
            value={filters.minConfidence.toString()}
            onValueChange={handleConfidenceChange}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select confidence level" />
            </SelectTrigger>
            <SelectContent>
              {confidenceLevels.map((level) => (
                <SelectItem key={level.value} value={level.value.toString()}>
                  {level.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Sort By */}
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Sort By
          </label>
          <Select value={filters.sortBy} onValueChange={handleSortChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select sort order" />
            </SelectTrigger>
            <SelectContent>
              {sortOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </Card>
  )
}
