import type { CSSProperties, ReactNode } from 'react'
import { cn } from '../../lib/format'
import { useInView } from '../../hooks/useInView'

/** Fades and lifts its content into place the first time it scrolls into view. */
export function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode
  /** Milliseconds to wait after entering view, for staggering siblings. */
  delay?: number
  className?: string
}) {
  const [ref, inView] = useInView<HTMLDivElement>()
  const style: CSSProperties | undefined = inView && delay ? { transitionDelay: `${delay}ms` } : undefined

  return (
    <div
      ref={ref}
      style={style}
      className={cn(
        'transition-[opacity,transform] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]',
        inView ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0',
        className,
      )}
    >
      {children}
    </div>
  )
}
