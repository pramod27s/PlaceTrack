import type { CSSProperties, ReactNode } from 'react'
import { cn } from '../../lib/format'
import { useInView } from '../../hooks/useInView'

const HIDDEN = {
  up: 'translate-y-10',
  left: '-translate-x-10',
  right: 'translate-x-10',
  zoom: 'translate-y-6 scale-[0.94]',
} as const

/** Fades, un-blurs and slides its content into place the first time it scrolls into view. */
export function Reveal({
  children,
  delay = 0,
  from = 'up',
  className,
}: {
  children: ReactNode
  /** Milliseconds to wait after entering view, for staggering siblings. */
  delay?: number
  /** Direction the content arrives from. */
  from?: keyof typeof HIDDEN
  className?: string
}) {
  const [ref, inView] = useInView<HTMLDivElement>()
  const style: CSSProperties | undefined = inView && delay ? { transitionDelay: `${delay}ms` } : undefined

  return (
    <div
      ref={ref}
      style={style}
      className={cn(
        'transition-[opacity,translate,scale,filter] duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)]',
        inView ? 'translate-x-0 translate-y-0 scale-100 opacity-100' : cn(HIDDEN[from], 'opacity-0 [filter:blur(6px)]'),
        className,
      )}
    >
      {children}
    </div>
  )
}
