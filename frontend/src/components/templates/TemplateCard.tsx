import React from 'react'
import { Card } from '../ui/card'
import { Button } from '../ui/button'
import { RatingStars } from './RatingStars'
import {
  Eye,
  Download,
  User,
  Calendar,
  Crown,
  TrendingUp,
  ChevronRight,
} from 'lucide-react'
import { Template } from '../../hooks/useTemplates'
import { format } from 'date-fns'

interface TemplateCardProps {
  template: Template
  searchQuery?: string
  onViewDetails: (template: Template) => void
  onUseTemplate: (template: Template) => void
}

export const TemplateCard: React.FC<TemplateCardProps> = ({
  template,
  searchQuery,
  onViewDetails,
  onUseTemplate,
}) => {
  const highlightText = (text: string, query?: string) => {
    if (!query || !text) return text

    const regex = new RegExp(`(${query})`, 'gi')
    const parts = text.split(regex)

    return parts.map((part, index) =>
      regex.test(part) ? (
        <mark key={index} className="bg-yellow-200 text-gray-900 font-semibold">
          {part}
        </mark>
      ) : (
        part
      )
    )
  }

  return (
    <Card className="group overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
      {/* Thumbnail */}
      <div className="relative h-48 bg-gradient-to-br from-indigo-500 to-purple-600 overflow-hidden">
        {template.thumbnail ? (
          <img
            src={template.thumbnail}
            alt={template.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-white text-6xl font-bold opacity-20">
              {template.name.charAt(0).toUpperCase()}
            </div>
          </div>
        )}

        {/* Premium Badge */}
        {template.isPremium && (
          <div className="absolute top-3 right-3 bg-gradient-to-r from-yellow-400 to-yellow-500 text-white px-3 py-1 rounded-full flex items-center gap-1 shadow-lg">
            <Crown className="h-3 w-3" />
            <span className="text-xs font-bold">Premium</span>
          </div>
        )}

        {/* Overlay on hover */}
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
          <Button
            size="sm"
            variant="default"
            onClick={() => onViewDetails(template)}
            className="bg-white text-gray-900 hover:bg-gray-100"
          >
            <Eye className="h-4 w-4 mr-2" />
            View Details
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Header */}
        <div className="mb-3">
          <h3 className="text-lg font-bold text-gray-900 mb-1 line-clamp-1">
            {highlightText(template.name, searchQuery)}
          </h3>
          <p className="text-sm text-gray-600 line-clamp-2">
            {highlightText(template.description, searchQuery)}
          </p>
        </div>

        {/* Rating */}
        <div className="mb-3">
          <RatingStars
            rating={template.rating}
            reviewCount={template.reviewCount}
            size="sm"
          />
        </div>

        {/* Tags */}
        {template.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {template.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="px-2 py-0.5 text-xs bg-indigo-50 text-indigo-600 rounded-full"
              >
                {tag}
              </span>
            ))}
            {template.tags.length > 3 && (
              <span className="px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded-full">
                +{template.tags.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Stats */}
        <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
          <div className="flex items-center gap-1">
            <Download className="h-3 w-3" />
            <span>{template.usageCount.toLocaleString()} uses</span>
          </div>
          <div className="flex items-center gap-1">
            <TrendingUp className="h-3 w-3" />
            <span>{template.category}</span>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t">
          <div className="flex items-center gap-2">
            {template.authorAvatar ? (
              <img
                src={template.authorAvatar}
                alt={template.author}
                className="h-6 w-6 rounded-full"
              />
            ) : (
              <div className="h-6 w-6 rounded-full bg-gray-200 flex items-center justify-center">
                <User className="h-3 w-3 text-gray-500" />
              </div>
            )}
            <span className="text-xs text-gray-600 font-medium">{template.author}</span>
          </div>

          <Button
            size="sm"
            onClick={() => onUseTemplate(template)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            Use Template
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>

        {/* Updated date */}
        <div className="flex items-center gap-1 text-xs text-gray-400 mt-2">
          <Calendar className="h-3 w-3" />
          <span>Updated {format(new Date(template.updatedAt), 'MMM d, yyyy')}</span>
        </div>
      </div>
    </Card>
  )
}
