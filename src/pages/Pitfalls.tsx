import { useState } from 'react'
import { motion } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import { PITFALLS } from '@/data/pitfalls'
import SplitText from '@/components/reactbits/SplitText'
import CodeBlock from '@/components/docs/CodeBlock'
import { cn } from '@/lib/utils'

const SEVERITY_STYLE = {
  Critical: 'border-red-400/40 bg-red-400/10 text-red-300',
  Moderate: 'border-amber-400/40 bg-amber-400/10 text-amber-300',
  Subtle: 'border-sky-400/40 bg-sky-400/10 text-sky-300'
} as const

export default function Pitfalls() {
  const [openId, setOpenId] = useState<string | null>(PITFALLS[0]?.id ?? null)

  return (
    <div>
      <span className="inline-block rounded-lg border border-red-400/40 bg-red-400/10 px-3 py-1 font-mono text-[11px] font-bold tracking-wider text-red-300">
        PITFALLS
      </span>
      <SplitText
        as="h1"
        text="Known Pitfalls and Best Practices"
        className="mt-5 font-display text-[clamp(1.9rem,4vw,2.8rem)] font-bold tracking-tightest text-frost"
      />
      <p className="mt-4 max-w-2xl text-[15px] leading-[1.8] text-frost-dim">
        {PITFALLS.length} recurring defects in MQL development, from signal faults to
        resource leaks. Each entry documents the symptom, the cause and the resolution
        with reference code. Treat this page as a pre-production checklist.
      </p>

      <div className="mt-8 flex flex-col gap-3">
        {PITFALLS.map((p, i) => {
          const open = openId === p.id
          return (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-30px' }}
              transition={{ duration: 0.4, delay: Math.min(i * 0.04, 0.2) }}
              className={cn(
                'overflow-hidden rounded-2xl border transition-colors',
                open ? 'border-electric/30 bg-obsidian-800/70' : 'border-frost/10 bg-obsidian-800/40'
              )}
            >
              <button
                onClick={() => setOpenId(open ? null : p.id)}
                className="flex w-full items-center gap-3.5 px-5 py-4 text-left"
              >
                <span className="font-mono text-[11px] text-frost-faint">{String(i + 1).padStart(2, '0')}</span>
                <span
                  className={cn(
                    'shrink-0 rounded-md border px-2 py-0.5 font-mono text-[9.5px] font-bold uppercase tracking-wider',
                    SEVERITY_STYLE[p.severity]
                  )}
                >
                  {p.severity}
                </span>
                <span className={cn('font-display text-[14px] font-semibold', open ? 'text-frost' : 'text-frost-dim')}>
                  {p.title}
                </span>
                <ChevronDown
                  size={16}
                  className={cn('ml-auto shrink-0 text-frost-faint transition-transform', open && 'rotate-180 text-electric')}
                />
              </button>

              {open && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden border-t border-frost/10"
                >
                  <div className="grid gap-4 px-5 py-5 md:grid-cols-3">
                    <Section title="Symptom" tone="text-sky-300">{p.symptom}</Section>
                    <Section title="Cause" tone="text-amber-300">{p.cause}</Section>
                    <Section title="Resolution" tone="text-emerald-300">{p.resolution}</Section>
                  </div>
                  {p.code && (
                    <div className="grid gap-4 px-5 pb-5 lg:grid-cols-2">
                      {p.code.bad && (
                        <div>
                          <div className="mb-2 font-mono text-[10px] font-semibold uppercase tracking-wider text-red-300">
                            Incorrect
                          </div>
                          <CodeBlock code={p.code.bad} flavor={p.code.flavor} />
                        </div>
                      )}
                      {p.code.good && (
                        <div>
                          <div className="mb-2 font-mono text-[10px] font-semibold uppercase tracking-wider text-emerald-300">
                            Correct
                          </div>
                          <CodeBlock code={p.code.good} flavor={p.code.flavor} />
                        </div>
                      )}
                    </div>
                  )}
                </motion.div>
              )}
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}

function Section({ title, tone, children }: { title: string; tone: string; children: React.ReactNode }) {
  return (
    <div>
      <div className={cn('mb-1.5 font-mono text-[10px] font-semibold uppercase tracking-wider', tone)}>{title}</div>
      <p className="text-[12.5px] leading-relaxed text-frost-dim">{children}</p>
    </div>
  )
}
