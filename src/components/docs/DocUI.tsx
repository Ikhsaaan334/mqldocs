import { ReactNode } from 'react'
import { motion } from 'framer-motion'
import { Info, Lightbulb, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'

/** Heading section dengan id untuk TOC + entrance halus. */
export function SectionHeading({ id, children, as = 'h2' }: { id: string; children: ReactNode; as?: 'h2' | 'h3' }) {
  const Tag = as
  return (
    <Tag id={id} className="scroll-mt-24">
      <motion.span
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-40px' }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className={cn(
          'block font-display font-semibold tracking-tight',
          as === 'h2' ? 'mb-5 mt-14 text-[22px] text-frost first:mt-0' : 'mb-3 mt-8 text-base text-frost'
        )}
      >
        {as === 'h2' && (
          <span className="mr-3 font-mono text-sm font-medium text-electric">#</span>
        )}
        {children}
      </motion.span>
    </Tag>
  )
}

export function Paragraph({ children }: { children: ReactNode }) {
  return (
    <motion.p
      initial={{ opacity: 0, y: 8 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-30px' }}
      transition={{ duration: 0.45 }}
      className="mb-4 text-[15px] leading-[1.8] text-frost-dim"
    >
      {children}
    </motion.p>
  )
}

type CalloutType = 'info' | 'tip' | 'warn'

const CALLOUT_STYLE: Record<CalloutType, { icon: typeof Info; border: string; bg: string; label: string; labelColor: string }> = {
  info: { icon: Info, border: 'border-sky-400/25', bg: 'bg-sky-400/5', label: 'Note', labelColor: 'text-sky-300' },
  tip: { icon: Lightbulb, border: 'border-emerald-400/25', bg: 'bg-emerald-400/5', label: 'Recommendation', labelColor: 'text-emerald-300' },
  warn: { icon: AlertTriangle, border: 'border-amber-400/25', bg: 'bg-amber-400/5', label: 'Caution', labelColor: 'text-amber-300' }
}

export function Callout({ type = 'info', title, children }: { type?: CalloutType; title?: string; children: ReactNode }) {
  const s = CALLOUT_STYLE[type]
  const Ico = s.icon
  return (
    <div className={cn('mb-6 rounded-xl border px-4 py-3.5', s.border, s.bg)}>
      <div className={cn('mb-1 flex items-center gap-2 font-mono text-[11px] font-semibold uppercase tracking-wider', s.labelColor)}>
        <Ico size={13} />
        {title ?? s.label}
      </div>
      <div className="text-[13.5px] leading-relaxed text-frost-dim">{children}</div>
    </div>
  )
}

export function Code({ children }: { children: ReactNode }) {
  return <code className="inline-code">{children}</code>
}
