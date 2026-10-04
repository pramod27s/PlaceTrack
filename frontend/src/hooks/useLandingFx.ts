import { useEffect, useRef } from 'react'
import { prefersReducedMotion } from './useInView'

/*
 * Pointer and scroll effects for the landing page. Everything here writes
 * straight to the element's style (CSS variables or transforms) inside a
 * requestAnimationFrame, so moving the mouse or scrolling never re-renders React.
 * All of it is skipped for visitors who prefer reduced motion.
 */

/** True on devices with a mouse or trackpad, where hover effects make sense. */
export function hasFinePointer(): boolean {
  return typeof window !== 'undefined' && !!window.matchMedia?.('(hover: hover) and (pointer: fine)').matches
}

export const clamp = (v: number, min = 0, max = 1) => Math.min(max, Math.max(min, v))

/**
 * Tracks the cursor over an element. Writes:
 *   --mx / --my  cursor position in px (for `.fx-spotlight` gradients),
 *   --px / --py  cursor position from -1 to 1 (for parallax layers).
 * When `tilt` is set, the element also leans towards the cursor by up to that many degrees.
 */
export function usePointerFx<T extends HTMLElement>(tilt = 0) {
  const ref = useRef<T>(null)

  useEffect(() => {
    const el = ref.current
    if (!el || prefersReducedMotion() || !hasFinePointer()) return
    let frame = 0
    let x = 0
    let y = 0

    const apply = () => {
      frame = 0
      const r = el.getBoundingClientRect()
      const fx = clamp((x - r.left) / r.width)
      const fy = clamp((y - r.top) / r.height)
      el.style.setProperty('--mx', `${x - r.left}px`)
      el.style.setProperty('--my', `${y - r.top}px`)
      el.style.setProperty('--px', (fx * 2 - 1).toFixed(3))
      el.style.setProperty('--py', (fy * 2 - 1).toFixed(3))
      if (tilt) {
        el.style.transform = `perspective(1100px) rotateX(${((0.5 - fy) * tilt * 2).toFixed(2)}deg) rotateY(${((fx - 0.5) * tilt * 2).toFixed(2)}deg)`
      }
    }
    const move = (e: PointerEvent) => {
      x = e.clientX
      y = e.clientY
      if (!frame) frame = requestAnimationFrame(apply)
    }
    const leave = () => {
      cancelAnimationFrame(frame)
      frame = 0
      el.style.setProperty('--px', '0')
      el.style.setProperty('--py', '0')
      if (tilt) el.style.transform = ''
    }

    el.addEventListener('pointermove', move)
    el.addEventListener('pointerleave', leave)
    return () => {
      cancelAnimationFrame(frame)
      el.removeEventListener('pointermove', move)
      el.removeEventListener('pointerleave', leave)
    }
  }, [tilt])

  return ref
}

/** Pulls an element (usually a button) a little way towards the cursor while hovered, then springs it back. */
export function useMagnetic<T extends HTMLElement>(strength = 0.3) {
  const ref = useRef<T>(null)

  useEffect(() => {
    const el = ref.current
    if (!el || prefersReducedMotion() || !hasFinePointer()) return
    let frame = 0
    let tx = 0
    let ty = 0
    let cx = 0
    let cy = 0

    // Ease the current offset towards the target each frame; stop once it has settled.
    const step = () => {
      cx += (tx - cx) * 0.18
      cy += (ty - cy) * 0.18
      el.style.transform = `translate3d(${cx.toFixed(2)}px, ${cy.toFixed(2)}px, 0)`
      frame = Math.abs(tx - cx) + Math.abs(ty - cy) > 0.1 ? requestAnimationFrame(step) : 0
    }
    const kick = () => {
      if (!frame) frame = requestAnimationFrame(step)
    }
    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect()
      tx = (e.clientX - (r.left + r.width / 2)) * strength
      ty = (e.clientY - (r.top + r.height / 2)) * strength
      kick()
    }
    const leave = () => {
      tx = 0
      ty = 0
      kick()
    }

    el.addEventListener('pointermove', move)
    el.addEventListener('pointerleave', leave)
    return () => {
      cancelAnimationFrame(frame)
      el.removeEventListener('pointermove', move)
      el.removeEventListener('pointerleave', leave)
      el.style.transform = ''
    }
  }, [strength])

  return ref
}

/**
 * Calls `onProgress` on every scroll frame with how far the element has travelled
 * through the viewport: 0 when its top meets the bottom edge, 1 when its bottom
 * leaves the top. Pass a stable (module-level) function.
 */
export function useScrollProgress<T extends HTMLElement>(onProgress: (progress: number, el: T) => void) {
  const ref = useRef<T>(null)

  useEffect(() => {
    const el = ref.current
    if (!el || prefersReducedMotion()) return
    let frame = 0

    const update = () => {
      frame = 0
      const r = el.getBoundingClientRect()
      const vh = window.innerHeight
      onProgress(clamp((vh - r.top) / (vh + r.height)), el)
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
  }, [onProgress])

  return ref
}
