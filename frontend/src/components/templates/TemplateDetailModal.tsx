import React, { useState } from 'react'
import { Button } from '../ui/button'
import { RatingStars } from './RatingStars'
import {
  X,
  Download,
  Calendar,
  User,
  Crown,
  ThumbsUp,
  ChevronRight,
  AlertCircle,
} from 'lucide-react'
import { Template, useTemplate, useTemplateReviews, useTemplateMutations } from '../../hooks/useTemplates'
import { format } from 'date-fns'

interface TemplateDetailModalProps {
  template: Template
  isOpen: boolean
  onClose: () => void
  onUseTemplate: (template: Template) => void
}

export const TemplateDetailModal: React.FC<TemplateDetailModalProps> = ({
  template,
  isOpen,
  onClose,
  onUseTemplate,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'reviews'>('overview')
  const [reviewPage, setReviewPage] = useState(1)
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [newRating, setNewRating] = useState(5)
  const [newComment, setNewComment] = useState('')

  const { data: templateDetails } = useTemplate(template.id)
  const { data: reviewsData, isLoading: reviewsLoading } = useTemplateReviews(
    template.id,
    reviewPage,
    5
  )
  const { submitReview, markReviewHelpful } = useTemplateMutations()

  if (!isOpen) return null

  const displayTemplate = templateDetails || template

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault()

    if (newComment.trim().length < 10) {
      alert('Review must be at least 10 characters')
      return
    }

    try {
      await submitReview.mutateAsync({
        templateId: template.id,
        rating: newRating,
        comment: newComment,
      })

      setNewRating(5)
      setNewComment('')
      setShowReviewForm(false)
    } catch (error) {
      console.error('Failed to submit review:', error)
    }
  }

  const handleMarkHelpful = async (reviewId: string) => {
    try {
      await markReviewHelpful.mutateAsync({
        templateId: template.id,
        reviewId,
      })
    } catch (error) {
      console.error('Failed to mark review helpful:', error)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-2xl font-bold text-gray-900">{displayTemplate.name}</h2>
              {displayTemplate.isPremium && (
                <div className="flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-yellow-400 to-yellow-500 text-white rounded-full">
                  <Crown className="h-3 w-3" />
                  <span className="text-xs font-bold">Premium</span>
                </div>
              )}
            </div>
            <p className="text-sm text-gray-600 mb-3">{displayTemplate.description}</p>
            <div className="flex items-center gap-4">
              <RatingStars rating={displayTemplate.rating} reviewCount={displayTemplate.reviewCount} />
              <div className="flex items-center gap-1 text-sm text-gray-500">
                <Download className="h-4 w-4" />
                <span>{displayTemplate.usageCount.toLocaleString()} uses</span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex-1 px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === 'overview'
                ? 'text-indigo-600 border-b-2 border-indigo-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('reviews')}
            className={`flex-1 px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === 'reviews'
                ? 'text-indigo-600 border-b-2 border-indigo-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Reviews ({displayTemplate.reviewCount})
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Thumbnail */}
              {displayTemplate.thumbnail && (
                <div className="rounded-lg overflow-hidden">
                  <img
                    src={displayTemplate.thumbnail}
                    alt={displayTemplate.name}
                    className="w-full h-64 object-cover"
                  />
                </div>
              )}

              {/* Info Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-semibold text-gray-500 uppercase mb-1">Category</h4>
                  <p className="text-base font-medium text-gray-900">{displayTemplate.category}</p>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-gray-500 uppercase mb-1">Author</h4>
                  <div className="flex items-center gap-2">
                    {displayTemplate.authorAvatar ? (
                      <img
                        src={displayTemplate.authorAvatar}
                        alt={displayTemplate.author}
                        className="h-6 w-6 rounded-full"
                      />
                    ) : (
                      <div className="h-6 w-6 rounded-full bg-gray-200 flex items-center justify-center">
                        <User className="h-3 w-3 text-gray-500" />
                      </div>
                    )}
                    <span className="text-base font-medium text-gray-900">
                      {displayTemplate.author}
                    </span>
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-gray-500 uppercase mb-1">Created</h4>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-700">
                      {format(new Date(displayTemplate.createdAt), 'MMM d, yyyy')}
                    </span>
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-gray-500 uppercase mb-1">Updated</h4>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-700">
                      {format(new Date(displayTemplate.updatedAt), 'MMM d, yyyy')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Tags */}
              <div>
                <h4 className="text-sm font-semibold text-gray-500 uppercase mb-2">Tags</h4>
                <div className="flex flex-wrap gap-2">
                  {displayTemplate.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 text-sm bg-indigo-50 text-indigo-600 rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Capabilities */}
              <div>
                <h4 className="text-sm font-semibold text-gray-500 uppercase mb-2">Capabilities</h4>
                <ul className="space-y-2">
                  {displayTemplate.capabilities.map((capability, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <ChevronRight className="h-5 w-5 text-indigo-600 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-gray-700">{capability}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Config Preview */}
              {displayTemplate.config && Object.keys(displayTemplate.config).length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-500 uppercase mb-2">Configuration</h4>
                  <pre className="p-4 bg-gray-50 rounded-lg text-xs overflow-x-auto">
                    {JSON.stringify(displayTemplate.config, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="space-y-6">
              {/* Write Review Button */}
              {!showReviewForm && (
                <Button onClick={() => setShowReviewForm(true)} className="w-full">
                  Write a Review
                </Button>
              )}

              {/* Review Form */}
              {showReviewForm && (
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="text-sm font-semibold text-gray-900 mb-3">Write Your Review</h4>
                  <form onSubmit={handleSubmitReview} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Rating
                      </label>
                      <RatingStars
                        rating={newRating}
                        interactive
                        onChange={setNewRating}
                        size="lg"
                        showNumber={false}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Comment
                      </label>
                      <textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Share your experience with this template..."
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        required
                        minLength={10}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button type="submit" disabled={submitReview.isPending}>
                        {submitReview.isPending ? 'Submitting...' : 'Submit Review'}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setShowReviewForm(false)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                </div>
              )}

              {/* Reviews List */}
              {reviewsLoading ? (
                <div className="text-center py-8">
                  <p className="text-sm text-gray-500">Loading reviews...</p>
                </div>
              ) : reviewsData && reviewsData.reviews.length > 0 ? (
                <div className="space-y-4">
                  {reviewsData.reviews.map((review) => (
                    <div key={review.id} className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-3">
                          {review.userAvatar ? (
                            <img
                              src={review.userAvatar}
                              alt={review.userName}
                              className="h-10 w-10 rounded-full"
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                              <User className="h-5 w-5 text-gray-500" />
                            </div>
                          )}
                          <div>
                            <p className="font-medium text-gray-900">{review.userName}</p>
                            <p className="text-xs text-gray-500">
                              {format(new Date(review.createdAt), 'MMM d, yyyy')}
                            </p>
                          </div>
                        </div>
                        <RatingStars rating={review.rating} showNumber={false} size="sm" />
                      </div>
                      <p className="text-sm text-gray-700 mb-3">{review.comment}</p>
                      <button
                        onClick={() => handleMarkHelpful(review.id)}
                        className="flex items-center gap-1 text-sm text-gray-500 hover:text-indigo-600"
                      >
                        <ThumbsUp className="h-4 w-4" />
                        <span>Helpful ({review.helpful})</span>
                      </button>
                    </div>
                  ))}

                  {/* Pagination */}
                  {reviewsData.total > 5 && (
                    <div className="flex justify-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setReviewPage(reviewPage - 1)}
                        disabled={reviewPage === 1}
                      >
                        Previous
                      </Button>
                      <span className="px-4 py-2 text-sm text-gray-600">
                        Page {reviewPage} of {Math.ceil(reviewsData.total / 5)}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setReviewPage(reviewPage + 1)}
                        disabled={reviewPage >= Math.ceil(reviewsData.total / 5)}
                      >
                        Next
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12">
                  <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-sm text-gray-500">No reviews yet</p>
                  <p className="text-xs text-gray-400 mt-1">Be the first to review this template!</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t bg-gray-50">
          <div className="text-sm text-gray-600">
            {displayTemplate.isPremium && displayTemplate.price && (
              <span className="font-semibold text-indigo-600">${displayTemplate.price}</span>
            )}
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
            <Button
              onClick={() => {
                onUseTemplate(displayTemplate)
                onClose()
              }}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              Use This Template
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
