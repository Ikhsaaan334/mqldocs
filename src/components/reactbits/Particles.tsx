import { useEffect, useRef } from 'react'

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  alpha: number
}

interface ParticlesProps {
  quantity?: number
  size?: number
  color?: string
  maxSpeed?: number
  mouseRadius?: number
  className?: string
  opacity?: number
}

/**
 * ReactBits-style particle field: dots drift slowly, gently pushed by the cursor.
 */
export default function Particles({
  quantity = 70,
  size = 1.6,
  color = '#A78BFA',
  maxSpeed = 0.28,
  mouseRadius = 130,
  className = '',
  opacity = 0.55
}: ParticlesProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let rafId = 0
    let particles: Particle[] = []
    const mouse = { x: -9999, y: -9999 }
    let w = 0
    let h = 0
    const dpr = Math.min(window.devicePixelRatio || 1, 2)

    const spawn = (): Particle => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 2 * maxSpeed,
      vy: (Math.random() - 0.5) * 2 * maxSpeed,
      size: size * (0.6 + Math.random() * 0.9),
      alpha: 0.25 + Math.random() * 0.55
    })

    const resize = () => {
      const rect = canvas.getBoundingClientRect()
      w = rect.width
      h = rect.height
      canvas.width = w * dpr
      canvas.height = h * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      const target = Math.max(24, Math.round(quantity * (w / 900)))
      particles = Array.from({ length: target }, spawn)
    }

    const step = () => {
      ctx.clearRect(0, 0, w, h)
      for (const p of particles) {
        const dx = p.x - mouse.x
        const dy = p.y - mouse.y
        const dist = Math.hypot(dx, dy)
        if (dist < mouseRadius && dist > 0.01) {
          const force = ((mouseRadius - dist) / mouseRadius) * 0.6
          p.vx += (dx / dist) * force * 0.35
          p.vy += (dy / dist) * force * 0.35
        }
        p.vx = Math.max(-maxSpeed * 2, Math.min(maxSpeed * 2, p.vx * 0.985))
        p.vy = Math.max(-maxSpeed * 2, Math.min(maxSpeed * 2, p.vy * 0.985))
        p.x += p.vx
        p.y += p.vy
        if (p.x < -10) p.x = w + 10
        if (p.x > w + 10) p.x = -10
        if (p.y < -10) p.y = h + 10
        if (p.y > h + 10) p.y = -10

        ctx.globalAlpha = p.alpha * opacity
        ctx.fillStyle = color
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fill()
      }
      ctx.globalAlpha = 1
      rafId = requestAnimationFrame(step)
    }

    const onMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect()
      mouse.x = e.clientX - rect.left
      mouse.y = e.clientY - rect.top
    }
    const onLeave = () => {
      mouse.x = -9999
      mouse.y = -9999
    }

    const observer = new ResizeObserver(resize)
    observer.observe(canvas)
    resize()
    rafId = requestAnimationFrame(step)

    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerleave', onLeave)

    return () => {
      cancelAnimationFrame(rafId)
      observer.disconnect()
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerleave', onLeave)
    }
  }, [quantity, size, color, maxSpeed, mouseRadius, opacity])

  return <canvas ref={canvasRef} className={className} style={{ display: 'block', width: '100%', height: '100%' }} />
}
