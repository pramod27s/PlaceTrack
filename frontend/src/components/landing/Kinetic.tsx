import { Fragment, useEffect, useRef, useState } from 'react'
import type { CSSProperties, ReactNode } from 'react'
import { cn } from '../../lib/format'
import { prefersReducedMotion, useInView } from '../../hooks/useInView'

/**
 * Splits `text` into words that blur and rise into place one after another.
 * `offset` continues the stagger from an earlier run of words; nothing animates until `play` is true.
 */
export function SplitWords({
  text,
  play = true,
  delay = 0,
  step = 70,
  offset = 0,
  className,
}: {
  text: string
  play?: boolean
  delay?: number
  step?: number
  offset?: number
  className?: string
}) {
  return text.split(' ').map((word, i) => (
    <Fragment key={i}>
      {i > 0 && ' '}
      <span
        style={play ? { animationDelay: `${delay + (offset + i) * step}ms` } : undefined}
        className={cn('inline-block', play ? 'animate-word' : 'opacity-0', className)}
      >
        {word}
      </span>
    </Fragment>
  ))
}

/** A section heading whose words cascade in the first time it scrolls into view. */
export function RevealHeading({ text, className }: { text: string; className?: string }) {
  const [ref, inView] = useInView<HTMLHeadingElement>()
  return (
    <h2 ref={ref} className={className}>
      <SplitWords text={text} play={inView} step={55} />
    </h2>
  )
}

/** Counts up from zero to `to` once it scrolls into view. Writes to the DOM directly to avoid re-rendering each frame. */
export function CountUp({ to, duration = 1600 }: { to: number; duration?: number }) {
  const [ref, inView] = useInView<HTMLSpanElement>()
  const textRef = useRef<HTMLSpanElement>(null)
  // Start from zero unless the count will never animate.
  const [initial] = useState(() => (prefersReducedMotion() ? to : 0))

  useEffect(() => {
    const el = textRef.current
    if (!inView || !el || prefersReducedMotion()) return
    let frame = 0
    const start = performance.now()
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration)
      el.textContent = String(Math.round(to * (1 - Math.pow(1 - t, 4))))
      if (t < 1) frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [inView, to, duration])

  return (
    <span ref={ref} className="tabular-nums">
      <span ref={textRef}>{initial}</span>
    </span>
  )
}

/** A list whose items slide in one by one, from the left or right, when it scrolls into view. */
export function StaggerList({
  items,
  from = 'left',
  icon,
  className,
}: {
  items: string[]
  from?: 'left' | 'right'
  icon: ReactNode
  className?: string
}) {
  const [ref, inView] = useInView<HTMLUListElement>()
  return (
    <ul ref={ref} className={className}>
      {items.map((item, i) => (
        <li
          key={item}
          style={inView ? ({ animationDelay: `${250 + i * 110}ms` } as CSSProperties) : undefined}
          className={cn('flex items-start gap-3', inView ? (from === 'left' ? 'animate-in-left' : 'animate-in-right') : 'opacity-0')}
        >
          <span
            style={inView ? { animationDelay: `${450 + i * 110}ms` } : undefined}
            className={cn('mt-0.5 shrink-0', inView ? 'animate-icon-pop' : 'opacity-0')}
          >
            {icon}
          </span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  )
}
