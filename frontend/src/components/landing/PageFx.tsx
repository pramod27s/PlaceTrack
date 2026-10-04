import { useEffect, useRef } from 'react'
import { prefersReducedMotion } from '../../hooks/useInView'
import { hasFinePointer } from '../../hooks/useLandingFx'

/** A thin gradient bar along the bottom of the navbar that fills as the page is scrolled. */
export function ScrollProgress() {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el || prefersReducedMotion()) return
    let frame = 0
    const update = () => {
      frame = 0
      const max = document.documentElement.scrollHeight - window.innerHeight
      el.style.transform = `scaleX(${max > 0 ? window.scrollY / max : 0})`
    }
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }
    update()
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
    }
  }, [])

  return (
    <div
      ref={ref}
      aria-hidden="true"
      style={{ transform: 'scaleX(0)' }}
      className="absolute inset-x-0 -bottom-px h-px origin-left bg-gradient-to-r from-indigo-500 via-sky-400 to-fuchsia-400"
    />
  )
}

/** A large, soft light that trails the cursor around the page (mouse and trackpad only). */
export function CursorGlow() {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el || prefersReducedMotion() || !hasFinePointer()) return
    let frame = 0
    let tx = window.innerWidth / 2
    let ty = window.innerHeight / 3
    let x = tx
    let y = ty

    // Trail behind the cursor rather than sticking to it; stop once caught up.
    const step = () => {
      x += (tx - x) * 0.12
      y += (ty - y) * 0.12
      el.style.transform = `translate3d(${(x - 300).toFixed(1)}px, ${(y - 300).toFixed(1)}px, 0)`
      frame = Math.abs(tx - x) + Math.abs(ty - y) > 0.5 ? requestAnimationFrame(step) : 0
    }
    const move = (e: PointerEvent) => {
      tx = e.clientX
      ty = e.clientY
      el.style.opacity = '1'
      if (!frame) frame = requestAnimationFrame(step)
    }
    const leave = () => {
      el.style.opacity = '0'
    }

    window.addEventListener('pointermove', move, { passive: true })
    document.documentElement.addEventListener('pointerleave', leave)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('pointermove', move)
      document.documentElement.removeEventListener('pointerleave', leave)
    }
  }, [])

  return (
    <div
      ref={ref}
      aria-hidden="true"
      style={{ opacity: 0 }}
      className="pointer-events-none fixed left-0 top-0 z-30 h-[600px] w-[600px] rounded-full bg-[radial-gradient(closest-side,rgba(99,102,241,0.10),rgba(56,189,248,0.04)_55%,transparent)] mix-blend-screen transition-opacity duration-500"
    />
  )
}
