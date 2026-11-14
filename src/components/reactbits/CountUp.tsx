import { useEffect, useRef, useState } from 'react'
import { useInView } from 'framer-motion'

interface CountUpProps {
  to: number
  from?: number
  duration?: number
  className?: string
  separator?: string
  suffix?: string
  prefix?: string
}

/**
 * ReactBits CountUp — angka beranimasi naik ke nilai target saat masuk viewport.
 */
export default function CountUp({
  to,
  from = 0,
  duration = 1.6,
  className = '',
  separator = '',
  suffix = '',
  prefix = ''
}: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, margin: '-8% 0px' })
  const [value, setValue] = useState(from)

  useEffect(() => {
    if (!inView) return
    let rafId = 0
    const start = performance.now()
    const tick = (now: number) => {
      const elapsed = (now - start) / 1000
      const t = Math.min(elapsed / duration, 1)
      // easeOutExpo
      const eased = t === 1 ? 1 : 1 - Math.pow(2, -10 * t)
      setValue(Math.round(from + (to - from) * eased))
      if (t < 1) rafId = requestAnimationFrame(tick)
    }
    rafId = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafId)
  }, [inView, to, from, duration])

  const formatted = separator
    ? value.toLocaleString('id-ID')
    : String(value)

  return (
    <span ref={ref} className={className}>
      {prefix}
      {formatted}
      {suffix}
    </span>
  )
}
