import React, { useState } from 'react'
import { Star } from 'lucide-react'

interface RatingStarsProps {
  rating: number
  maxRating?: number
  size?: 'sm' | 'md' | 'lg'
  showNumber?: boolean
  interactive?: boolean
  onChange?: (rating: number) => void
  reviewCount?: number
}

export const RatingStars: React.FC<RatingStarsProps> = ({
  rating,
  maxRating = 5,
  size = 'md',
  showNumber = true,
  interactive = false,
  onChange,
  reviewCount,
}) => {
  const [hoverRating, setHoverRating] = useState<number | null>(null)

  const displayRating = hoverRating !== null ? hoverRating : rating

  const sizeClasses = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
  }

  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  }

  const handleClick = (value: number) => {
    if (interactive && onChange) {
      onChange(value)
    }
  }

  const handleMouseEnter = (value: number) => {
    if (interactive) {
      setHoverRating(value)
    }
  }

  const handleMouseLeave = () => {
    if (interactive) {
      setHoverRating(null)
    }
  }

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-0.5">
        {Array.from({ length: maxRating }, (_, index) => {
          const starValue = index + 1
          const isFilled = starValue <= displayRating
          const isHalfFilled = !isFilled && starValue - 0.5 <= displayRating

          return (
            <button
              key={index}
              type="button"
              onClick={() => handleClick(starValue)}
              onMouseEnter={() => handleMouseEnter(starValue)}
              onMouseLeave={handleMouseLeave}
              disabled={!interactive}
              className={`relative transition-transform ${
                interactive ? 'hover:scale-110 cursor-pointer' : 'cursor-default'
              }`}
            >
              {/* Background star (empty) */}
              <Star
                className={`${sizeClasses[size]} text-gray-300`}
                fill="currentColor"
              />

              {/* Foreground star (filled) */}
              {(isFilled || isHalfFilled) && (
                <Star
                  className={`${sizeClasses[size]} text-yellow-400 absolute top-0 left-0`}
                  fill="currentColor"
                  style={{
                    clipPath: isHalfFilled ? 'inset(0 50% 0 0)' : undefined,
                  }}
                />
              )}
            </button>
          )
        })}
      </div>

      {showNumber && (
        <span className={`${textSizeClasses[size]} font-semibold text-gray-900`}>
          {rating.toFixed(1)}
        </span>
      )}

      {reviewCount !== undefined && (
        <span className={`${textSizeClasses[size]} text-gray-500`}>
          ({reviewCount.toLocaleString()})
        </span>
      )}
    </div>
  )
}
