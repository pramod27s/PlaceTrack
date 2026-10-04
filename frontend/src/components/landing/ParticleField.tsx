import { useEffect, useRef, useState } from 'react'
import { cn } from '../../lib/format'
import { prefersReducedMotion } from '../../hooks/useInView'

type Particle = { x: number; y: number; vx: number; vy: number; r: number; c: string; phase: number }

const COLORS = ['129,140,248', '56,189,248', '192,132,252'] // indigo-400, sky-400, purple-400
const LINK_DISTANCE = 130
const CURSOR_REACH = 190

/*
 * A drifting constellation drawn on a canvas: dots float, nearby dots are joined
 * by faint lines, and the cursor pushes dots away while reaching out to them.
 * It sizes itself to its parent, only animates while on screen and the tab is
 * visible, and is not rendered at all for visitors who prefer reduced motion.
 */
export function ParticleField({ density = 1, className }: { density?: number; className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null)
  const [enabled] = useState(() => !prefersReducedMotion())

  useEffect(() => {
    const canvas = ref.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return

    let width = 0
    let height = 0
    let particles: Particle[] = []
    let frame = 0
    let onScreen = false
    const cursor = { x: -9999, y: -9999 }

    const resize = () => {
      const rect = canvas.getBoundingClientRect()
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      width = rect.width
      height = rect.height
      canvas.width = Math.round(width * dpr)
      canvas.height = Math.round(height * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      const count = Math.min(120, Math.round(((width * height) / 11000) * density))
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.32,
        vy: (Math.random() - 0.5) * 0.32,
        r: Math.random() * 1.4 + 0.5,
        c: COLORS[Math.floor(Math.random() * COLORS.length)],
        phase: Math.random() * Math.PI * 2,
      }))
    }

    const draw = (t: number) => {
      ctx.clearRect(0, 0, width, height)

      for (const p of particles) {
        // Ease away from the cursor, then drift and wrap around the edges.
        const dx = p.x - cursor.x
        const dy = p.y - cursor.y
        const d = Math.hypot(dx, dy)
        if (d < 110 && d > 0.1) {
          const push = (110 - d) / 110
          p.x += (dx / d) * push * 1.6
          p.y += (dy / d) * push * 1.6
        }
        p.x += p.vx
        p.y += p.vy
        if (p.x < -10) p.x = width + 10
        else if (p.x > width + 10) p.x = -10
        if (p.y < -10) p.y = height + 10
        else if (p.y > height + 10) p.y = -10
      }

      ctx.lineWidth = 1
      for (let i = 0; i < particles.length; i++) {
        const a = particles[i]
        for (let j = i + 1; j < particles.length; j++) {
          const b = particles[j]
          const d = Math.hypot(a.x - b.x, a.y - b.y)
          if (d < LINK_DISTANCE) {
            ctx.strokeStyle = `rgba(${a.c},${((1 - d / LINK_DISTANCE) * 0.22).toFixed(3)})`
            ctx.beginPath()
            ctx.moveTo(a.x, a.y)
            ctx.lineTo(b.x, b.y)
            ctx.stroke()
          }
        }
        const dc = Math.hypot(a.x - cursor.x, a.y - cursor.y)
        if (dc < CURSOR_REACH) {
          ctx.strokeStyle = `rgba(${a.c},${((1 - dc / CURSOR_REACH) * 0.55).toFixed(3)})`
          ctx.beginPath()
          ctx.moveTo(a.x, a.y)
          ctx.lineTo(cursor.x, cursor.y)
          ctx.stroke()
        }
      }

      for (const p of particles) {
        const twinkle = 0.55 + Math.sin(t / 700 + p.phase) * 0.35
        ctx.fillStyle = `rgba(${p.c},${twinkle.toFixed(3)})`
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fill()
      }
    }

    const loop = (t: number) => {
      draw(t)
      frame = requestAnimationFrame(loop)
    }
    const sync = () => {
      const run = onScreen && !document.hidden
      if (run && !frame) frame = requestAnimationFrame(loop)
      if (!run && frame) {
        cancelAnimationFrame(frame)
        frame = 0
      }
    }

    const onPointer = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect()
      cursor.x = e.clientX - rect.left
      cursor.y = e.clientY - rect.top
    }
    const onLeave = () => {
      cursor.x = -9999
      cursor.y = -9999
    }

    resize()
    const resizeObserver = new ResizeObserver(resize)
    resizeObserver.observe(canvas)
    const visibility = new IntersectionObserver(([entry]) => {
      onScreen = entry.isIntersecting
      sync()
    })
    visibility.observe(canvas)
    document.addEventListener('visibilitychange', sync)
    window.addEventListener('pointermove', onPointer, { passive: true })
    document.documentElement.addEventListener('pointerleave', onLeave)

    return () => {
      cancelAnimationFrame(frame)
      resizeObserver.disconnect()
      visibility.disconnect()
      document.removeEventListener('visibilitychange', sync)
      window.removeEventListener('pointermove', onPointer)
      document.documentElement.removeEventListener('pointerleave', onLeave)
    }
  }, [density])

  if (!enabled) return null
  return <canvas ref={ref} aria-hidden="true" className={cn('pointer-events-none absolute inset-0 h-full w-full', className)} />
}
