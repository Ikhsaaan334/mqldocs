import { useEffect, useRef } from 'react'

interface DotGridProps {
  gap?: number
  baseDotSize?: number
  maxDotSize?: number
  baseAlpha?: number
  maxAlpha?: number
  radius?: number
  baseColor?: string
  activeColor?: string
  speed?: number
  idleWave?: boolean
  className?: string
}

type RGB = [number, number, number]

function parseRgb(hex: string): RGB {
  const h = hex.replace('#', '')
  const n = parseInt(h.length === 3 ? h.split('').map((c) => c + c).join('') : h, 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}

/**
 * ReactBits-style reactive dot grid: matriks titik yang menyala, membesar,
 * dan bergeser halus mengikuti kursor — plus gelombang idle agar tetap hidup.
 */
export default function DotGrid({
  gap = 30,
  baseDotSize = 1.1,
  maxDotSize = 2.6,
  baseAlpha = 0.14,
  maxAlpha = 0.85,
  radius = 190,
  baseColor = '#A78BFA',
  activeColor = '#C4B5FD',
  speed = 0.16,
  idleWave = true,
  className = ''
}: DotGridProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const base = parseRgb(baseColor)
    const active = parseRgb(activeColor)
    const dpr = Math.min(window.devicePixelRatio || 1, 2)

    let width = 0
    let height = 0
    let rafId = 0
    const mouse = { x: -9999, y: -9999, tx: -9999, ty: -9999, active: false }

    const resize = () => {
      const rect = canvas.getBoundingClientRect()
      width = rect.width
      height = rect.height
      canvas.width = Math.max(1, Math.floor(width * dpr))
      canvas.height = Math.max(1, Math.floor(height * dpr))
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    const onMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect()
      mouse.tx = e.clientX - rect.left
      mouse.ty = e.clientY - rect.top
      mouse.active = true
    }
    const onLeave = () => {
      mouse.active = false
    }

    const frame = (now: number) => {
      const t = now * 0.001
      // kursor ter-interpolasi halus (trailing effect)
      if (mouse.active) {
        if (mouse.x < -9000) {
          mouse.x = mouse.tx
          mouse.y = mouse.ty
        }
        mouse.x += (mouse.tx - mouse.x) * speed
        mouse.y += (mouse.ty - mouse.y) * speed
      }

      ctx.clearRect(0, 0, width, height)

      const cols = Math.ceil(width / gap) + 1
      const rows = Math.ceil(height / gap) + 1
      const offsetX = (width - (cols - 1) * gap) / 2
      const offsetY = (height - (rows - 1) * gap) / 2

      for (let ix = 0; ix < cols; ix++) {
        for (let iy = 0; iy < rows; iy++) {
          const x = offsetX + ix * gap
          const y = offsetY + iy * gap

          const dx = x - mouse.x
          const dy = y - mouse.y
          const dist = Math.hypot(dx, dy)
          const raw = Math.max(0, 1 - dist / radius)
          const ease = raw * raw * (3 - 2 * raw) // smoothstep

          // gelombang idle halus — grid tetap bernapas tanpa kursor
          const wave = idleWave
            ? 0.5 + 0.5 * Math.sin(ix * 0.55 + iy * 0.55 + t * 1.1)
            : 0

          const size = baseDotSize + ease * (maxDotSize - baseDotSize) + wave * 0.5
          const alpha = Math.min(
            1,
            baseAlpha + ease * (maxAlpha - baseAlpha) + wave * baseAlpha * 0.5
          )

          const r = Math.round(base[0] + (active[0] - base[0]) * ease)
          const g = Math.round(base[1] + (active[1] - base[1]) * ease)
          const b = Math.round(base[2] + (active[2] - base[2]) * ease)

          ctx.fillStyle = `rgba(${r},${g},${b},${alpha})`
          ctx.beginPath()
          ctx.arc(x, y, size, 0, Math.PI * 2)
          ctx.fill()
        }
      }

      rafId = requestAnimationFrame(frame)
    }

    const observer = new ResizeObserver(resize)
    observer.observe(canvas)
    resize()

    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerleave', onLeave)
    rafId = requestAnimationFrame(frame)

    return () => {
      cancelAnimationFrame(rafId)
      observer.disconnect()
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerleave', onLeave)
    }
  }, [gap, baseDotSize, maxDotSize, baseAlpha, maxAlpha, radius, baseColor, activeColor, speed, idleWave])

  return <canvas ref={canvasRef} className={className} style={{ display: 'block', width: '100%', height: '100%' }} />
}
