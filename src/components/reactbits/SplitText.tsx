import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'

interface SplitTextProps {
  text: string
  className?: string
  delay?: number
  duration?: number
  stagger?: number
  as?: 'h1' | 'h2' | 'h3' | 'p' | 'span'
}

/**
 * ReactBits SplitText — memecah teks menjadi kata & karakter,
 * lalu masuk dengan animasi stagger dari bawah (masked reveal).
 */
export default function SplitText({
  text,
  className = '',
  delay = 0,
  duration = 0.7,
  stagger = 0.028,
  as = 'span'
}: SplitTextProps) {
  const ref = useRef<HTMLElement>(null)
  const inView = useInView(ref, { once: true, margin: '-10% 0px' })
  const words = text.split(' ')
  const Tag = as as React.ElementType

  let charIndex = 0

  return (
    <Tag ref={ref as never} className={className} aria-label={text}>
      {words.map((word, wi) => {
        const chars = word.split('')
        const wordStart = charIndex
        charIndex += chars.length + 1
        return (
          <span key={wi} className="inline-block whitespace-nowrap">
            {chars.map((char, ci) => (
              <span key={ci} className="inline-block overflow-hidden align-bottom pb-[0.08em] -mb-[0.08em]">
                <motion.span
                  className="inline-block will-change-transform"
                  initial={{ y: '115%', opacity: 0 }}
                  animate={inView ? { y: '0%', opacity: 1 } : {}}
                  transition={{
                    duration,
                    delay: delay + (wordStart + ci) * stagger,
                    ease: [0.22, 1, 0.36, 1]
                  }}
                >
                  {char}
                </motion.span>
              </span>
            ))}
            {wi < words.length - 1 && <span className="inline-block">&nbsp;</span>}
          </span>
        )
      })}
    </Tag>
  )
}
