import type { FC, SVGProps } from 'react'

interface PlaceTrackIconProps extends SVGProps<SVGSVGElement> {
  size?: number | string
  className?: string
}

/**
 * Clean 3-bar pipeline/milestone mark matching the PlaceTrack favicon.
 * Can be used inline or inside custom gradient badges.
 */
export const PlaceTrackIcon: FC<PlaceTrackIconProps> = ({
  size = 20,
  className = 'text-white',
  ...props
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      {/* Bar 1: Full pipeline height */}
      <rect x="3" y="4" width="4.5" height="16" rx="2.25" fill="currentColor" />
      {/* Bar 2: Mid-stage round */}
      <rect x="9.75" y="4" width="4.5" height="11" rx="2.25" fill="currentColor" opacity="0.85" />
      {/* Bar 3: Offer / Target stage */}
      <rect x="16.5" y="4" width="4.5" height="6.5" rx="2.25" fill="currentColor" opacity="0.7" />
    </svg>
  )
}

interface PlaceTrackBadgeProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

/**
 * Standard branded badge with modern gradient & shadow
 */
export const PlaceTrackBadge: FC<PlaceTrackBadgeProps> = ({
  size = 'md',
  className = '',
}) => {
  const sizeClasses = {
    sm: 'h-6 w-6 rounded-md',
    md: 'h-9 w-9 rounded-xl',
    lg: 'h-11 w-11 rounded-2xl',
  }[size]

  const iconSizes = {
    sm: 13,
    md: 18,
    lg: 22,
  }[size]

  return (
    <div
      className={`flex items-center justify-center bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-500 shadow-sm shadow-indigo-600/15 ring-1 ring-white/10 shrink-0 ${sizeClasses} ${className}`}
    >
      <PlaceTrackIcon size={iconSizes} className="text-white" />
    </div>
  )
}

export default PlaceTrackIcon
