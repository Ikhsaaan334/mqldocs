import { motion, useScroll, useTransform, MotionValue } from 'framer-motion'
import { useRef } from 'react'

interface ScrollRevealProps {
  text: string
  className?: string
  startOpacity?: number
}

/**
 * ReactBits ScrollReveal — kata demi kata terungkap dari blur + redup
 * mengikuti progres scroll, gaya halaman dokumen premium.
 */
export default function ScrollReveal({ text, className = '', startOpacity = 0.12 }: ScrollRevealProps) {
  const ref = useRef<HTMLParagraphElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start 0.9', 'start 0.35']
  })

  const words = text.split(' ')

  return (
    <p ref={ref} className={className}>
      {words.map((word, i) => {
        const start = i / words.length
        const end = start + 1 / words.length
        return (
          <Word key={i} progress={scrollYProgress} range={[start, end]} startOpacity={startOpacity}>
            {word}
          </Word>
        )
      })}
    </p>
  )
}

function Word({
  children,
  progress,
  range,
  startOpacity
}: {
  children: string
  progress: MotionValue<number>
  range: [number, number]
  startOpacity: number
}) {
  const opacity = useTransform(progress, range, [startOpacity, 1])
  const blur = useTransform(progress, range, ['blur(6px)', 'blur(0px)'])
  const y = useTransform(progress, range, [8, 0])
  const filter = useTransform(blur, (b) => b)

  return (
    <motion.span style={{ opacity, filter, y }} className="inline-block mr-[0.28em] will-change-[filter]">
      {children}
    </motion.span>
  )
}
