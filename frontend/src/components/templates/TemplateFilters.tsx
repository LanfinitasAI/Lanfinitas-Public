import React, { useState } from 'react'
import { Card } from '../ui/card'
import { Button } from '../ui/button'
import { Search, X, Filter, ChevronDown, ChevronUp, Star } from 'lucide-react'
import { TemplateFilters as Filters } from '../../hooks/useTemplates'

interface TemplateFiltersProps {
  filters: Filters
  onFiltersChange: (filters: Filters) => void
  categories: string[]
  tags: string[]
  isLoading?: boolean
}

export const TemplateFilters: React.FC<TemplateFiltersProps> = ({
  filters,
  onFiltersChange,
  categories,
  tags,
  isLoading,
}) => {
  const [showFilters, setShowFilters] = useState(false)
  const [searchInput, setSearchInput] = useState(filters.search || '')

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onFiltersChange({ ...filters, search: searchInput })
  }

  const handleSearchClear = () => {
    setSearchInput('')
    onFiltersChange({ ...filters, search: undefined })
  }

  const handleCategoryToggle = (category: string) => {
    const currentCategories = filters.category || []
    const newCategories = currentCategories.includes(category)
      ? currentCategories.filter((c) => c !== category)
      : [...currentCategories, category]

    onFiltersChange({
      ...filters,
      category: newCategories.length > 0 ? newCategories : undefined,
    })
  }

  const handleTagToggle = (tag: string) => {
    const currentTags = filters.tags || []
    const newTags = currentTags.includes(tag)
      ? currentTags.filter((t) => t !== tag)
      : [...currentTags, tag]

    onFiltersChange({
      ...filters,
      tags: newTags.length > 0 ? newTags : undefined,
    })
  }

  const handleSortChange = (sortBy: Filters['sortBy']) => {
    onFiltersChange({ ...filters, sortBy })
  }

  const handleMinRatingChange = (rating: number) => {
    onFiltersChange({
      ...filters,
      minRating: filters.minRating === rating ? undefined : rating,
    })
  }

  const handleClearAll = () => {
    setSearchInput('')
    onFiltersChange({})
  }

  const activeFilterCount =
    (filters.category?.length || 0) +
    (filters.tags?.length || 0) +
    (filters.minRating ? 1 : 0) +
    (filters.search ? 1 : 0)

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <Card className="p-4">
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search templates..."
              className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              disabled={isLoading}
            />
            {searchInput && (
              <button
                type="button"
                onClick={handleSearchClear}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
          <Button type="submit" disabled={isLoading}>
            Search
          </Button>
        </form>
      </Card>

      {/* Filter Toggle & Sort */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2"
        >
          <Filter className="h-4 w-4" />
          Filters
          {activeFilterCount > 0 && (
            <span className="ml-1 px-2 py-0.5 text-xs bg-indigo-600 text-white rounded-full">
              {activeFilterCount}
            </span>
          )}
          {showFilters ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </Button>

        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Sort by:</span>
          <select
            value={filters.sortBy || 'popular'}
            onChange={(e) => handleSortChange(e.target.value as Filters['sortBy'])}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="popular">Most Popular</option>
            <option value="rating">Highest Rated</option>
            <option value="recent">Most Recent</option>
            <option value="usage">Most Used</option>
          </select>
        </div>
      </div>

      {/* Expanded Filters */}
      {showFilters && (
        <Card className="p-6 space-y-6">
          {/* Categories */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Categories</h3>
            <div className="flex flex-wrap gap-2">
              {categories.length === 0 ? (
                <p className="text-sm text-gray-500">No categories available</p>
              ) : (
                categories.map((category) => {
                  const isSelected = filters.category?.includes(category)
                  return (
                    <button
                      key={category}
                      onClick={() => handleCategoryToggle(category)}
                      className={`px-3 py-1.5 text-sm rounded-lg border-2 transition-colors ${
                        isSelected
                          ? 'bg-indigo-600 border-indigo-600 text-white'
                          : 'bg-white border-gray-200 text-gray-700 hover:border-indigo-300'
                      }`}
                    >
                      {category}
                    </button>
                  )
                })
              )}
            </div>
          </div>

          {/* Tags */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Tags</h3>
            <div className="flex flex-wrap gap-2">
              {tags.length === 0 ? (
                <p className="text-sm text-gray-500">No tags available</p>
              ) : (
                tags.map((tag) => {
                  const isSelected = filters.tags?.includes(tag)
                  return (
                    <button
                      key={tag}
                      onClick={() => handleTagToggle(tag)}
                      className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${
                        isSelected
                          ? 'bg-indigo-50 border-indigo-300 text-indigo-700'
                          : 'bg-white border-gray-200 text-gray-700 hover:border-indigo-200'
                      }`}
                    >
                      {tag}
                    </button>
                  )
                })
              )}
            </div>
          </div>

          {/* Minimum Rating */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Minimum Rating</h3>
            <div className="flex gap-2">
              {[5, 4, 3].map((rating) => {
                const isSelected = filters.minRating === rating
                return (
                  <button
                    key={rating}
                    onClick={() => handleMinRatingChange(rating)}
                    className={`flex items-center gap-1 px-3 py-2 rounded-lg border-2 transition-colors ${
                      isSelected
                        ? 'bg-indigo-600 border-indigo-600 text-white'
                        : 'bg-white border-gray-200 text-gray-700 hover:border-indigo-300'
                    }`}
                  >
                    <Star className={`h-4 w-4 ${isSelected ? 'fill-current' : ''}`} />
                    <span className="text-sm font-medium">{rating}+</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Clear All */}
          {activeFilterCount > 0 && (
            <div className="pt-4 border-t">
              <Button
                variant="outline"
                onClick={handleClearAll}
                className="w-full text-red-600 border-red-200 hover:bg-red-50"
              >
                Clear All Filters
              </Button>
            </div>
          )}
        </Card>
      )}
    </div>
  )
}
