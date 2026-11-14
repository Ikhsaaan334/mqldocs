import { useEffect, useRef, useState } from 'react'
import { useInView } from 'framer-motion'

interface DecryptedTextProps {
  text: string
  className?: string
  speed?: number
  characters?: string
  revealDirection?: 'start' | 'end'
  animateOn?: 'view' | 'hover'
}

const GLYPHS = 'abcdefghijklmnopqrstuvwxyz#$%&*+=<>/\\{}'

/**
 * ReactBits DecryptedText — karakter "terenkripsi" didekripsi satu per satu
 * saat elemen masuk viewport (atau saat hover).
 */
export default function DecryptedText({
  text,
  className = '',
  speed = 45,
  characters = GLYPHS,
  revealDirection = 'start',
  animateOn = 'view'
}: DecryptedTextProps) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, margin: '-12% 0px' })
  const [display, setDisplay] = useState(text)
  const [started, setStarted] = useState(animateOn === 'view' ? false : false)

  useEffect(() => {
    if (animateOn === 'hover' || !inView) return
    setStarted(true)
  }, [inView, animateOn])

  useEffect(() => {
    if (animateOn === 'hover' && started === false) {
      setDisplay(text)
    }
  }, [started, animateOn, text])

  useEffect(() => {
    if (!started) {
      setDisplay(text.replace(/[^\s]/g, (c) => (/[^\w\s]/.test(c) ? c : text[0] === ' ' ? ' ' : ' ')))
      return
    }
    let frame = 0
    const chars = text.split('')
    const n = chars.length
    const maxIter = Math.max(6, Math.ceil(n * 1.4))

    const timer = window.setInterval(() => {
      frame++
      const revealed =
        revealDirection === 'start'
          ? Math.floor((frame / maxIter) * n)
          : n - Math.floor((frame / maxIter) * n)

      const next = chars
        .map((c, i) => {
          if (c === ' ') return ' '
          if (!/[\w]/.test(c)) return c
          const isRevealed =
            revealDirection === 'start' ? i < revealed : i >= revealed
          if (isRevealed) return c
          return characters[Math.floor(Math.random() * characters.length)]
        })
        .join('')

      setDisplay(next)
      if (frame >= maxIter) {
        setDisplay(text)
        window.clearInterval(timer)
      }
    }, speed)

    return () => window.clearInterval(timer)
  }, [started, text, speed, characters, revealDirection])

  return (
    <span
      ref={ref}
      className={className}
      onMouseEnter={() => {
        if (animateOn === 'hover') {
          setStarted(false)
          requestAnimationFrame(() => setStarted(true))
        }
      }}
    >
      {started ? display : '\u00A0'}
    </span>
  )
}
