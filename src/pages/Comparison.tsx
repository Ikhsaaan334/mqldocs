import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, Check } from 'lucide-react'
import { COMPARE_ROWS, VERDICT_MQL4, VERDICT_MQL5 } from '@/data/comparison'
import SplitText from '@/components/reactbits/SplitText'
import GlassSurface from '@/components/reactbits/GlassSurface'
import { cn } from '@/lib/utils'

const TABS = [
  { id: 'all', label: 'All' },
  { id: 'syntax', label: 'Syntax' },
  { id: 'concepts', label: 'Concepts' },
  { id: 'ecosystem', label: 'Ecosystem' }
] as const

export default function Comparison() {
  const [tab, setTab] = useState<(typeof TABS)[number]['id']>('all')
  const rows = useMemo(() => (tab === 'all' ? COMPARE_ROWS : COMPARE_ROWS.filter((r) => r.category === tab)), [tab])

  return (
    <div>
      <span className="inline-block rounded-lg border border-electric/40 bg-electric/15 px-3 py-1 font-mono text-[11px] font-bold tracking-wider text-electric-bright">
        COMPARISON
      </span>
      <SplitText
        as="h1"
        text="MQL4 vs MQL5"
        className="mt-5 font-display text-[clamp(1.9rem,4vw,2.8rem)] font-bold tracking-tightest text-frost"
      />
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.6 }}
        className="mt-4 max-w-2xl text-[15px] leading-[1.8] text-frost-dim"
      >
        The complete set of differences across syntax, platform concepts and ecosystem,
        concluded with selection guidance: <strong className="text-frost">the conditions under
        which MQL4 applies</strong> and <strong className="text-frost">those under which MQL5 is the correct choice</strong>.
      </motion.p>

      <div className="mt-8 flex gap-2">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              'rounded-lg border px-3.5 py-1.5 font-mono text-[11.5px] transition',
              tab === t.id
                ? 'border-electric/50 bg-electric-faint text-electric-bright'
                : 'border-frost/10 bg-frost/5 text-frost-faint hover:text-frost-dim'
            )}
          >
            {t.label}
            <span className="ml-1.5 text-[9px] text-frost-faint">
              {t.id === 'all' ? COMPARE_ROWS.length : COMPARE_ROWS.filter((r) => r.category === t.id).length}
            </span>
          </button>
        ))}
      </div>

      <div className="mt-5 overflow-hidden rounded-2xl border border-frost/10">
        <div className="grid grid-cols-1 sm:grid-cols-[minmax(150px,240px)_minmax(0,1fr)_minmax(0,1fr)]">
          <div className="hidden min-w-0 border-b border-frost/10 bg-obsidian-800/80 px-4 py-3 font-mono text-[10px] font-semibold uppercase tracking-wider text-frost-faint sm:block">
            Aspect
          </div>
          <div className="hidden min-w-0 border-b border-l border-frost/10 bg-obsidian-800/80 px-4 py-3 font-mono text-[10px] font-semibold uppercase tracking-wider text-frost-dim sm:block">
            MQL4
          </div>
          <div className="hidden min-w-0 border-b border-l border-electric/20 bg-electric-faint px-4 py-3 font-mono text-[10px] font-semibold uppercase tracking-wider text-electric-bright sm:block">
            MQL5
          </div>

          {rows.map((row, i) => (
            <motion.div
              key={row.aspect}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true, margin: '-20px' }}
              transition={{ duration: 0.4, delay: Math.min(i * 0.04, 0.3) }}
              className="contents"
            >
              <div className="min-w-0 border-b border-frost/8 bg-obsidian-800/40 px-4 py-4">
                <div className="break-words font-display text-[13.5px] font-semibold text-frost sm:pt-0.5">{row.aspect}</div>
                <span className="mt-1.5 inline-block rounded border border-frost/15 bg-frost/5 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wider text-frost-faint sm:hidden">
                  {row.category}
                </span>
              </div>
              <div className="min-w-0 border-b border-l border-frost/8 bg-obsidian-800/20 px-4 py-4">
                <p className="break-words text-[12.5px] leading-relaxed text-frost-dim [overflow-wrap:anywhere]">{row.mql4}</p>
              </div>
              <div className="min-w-0 border-b border-l border-frost/8 bg-electric-faint/60 px-4 py-4">
                <p className="break-words text-[12.5px] leading-relaxed text-frost-dim [overflow-wrap:anywhere]">{row.mql5}</p>
                {row.note && (
                  <p className="mt-2 break-words border-l-2 border-electric/40 pl-2.5 text-[11.5px] italic leading-relaxed text-electric-bright/80">
                    {row.note}
                  </p>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* selection guidance */}
      <h2 className="mb-2 mt-16 font-display text-xl font-bold tracking-tight text-frost">
        Platform selection guidance
      </h2>
      <div className="mt-6 grid gap-5 lg:grid-cols-2">
        <GlassSurface className="rounded-2xl">
          <div className="h-full bg-obsidian-800/60 p-6">
            <div className="flex items-center gap-2.5">
              <span className="rounded-lg border border-frost/20 bg-frost/5 px-2.5 py-1 font-mono text-[11px] font-bold text-frost-dim">MQL4</span>
              <h3 className="font-display text-[15px] font-semibold text-frost">{VERDICT_MQL4.title}</h3>
            </div>
            <ul className="mt-5 flex flex-col gap-3">
              {VERDICT_MQL4.items.map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-[13px] leading-relaxed text-frost-dim">
                  <Check size={14} className="mt-0.5 shrink-0 text-frost-faint" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </GlassSurface>

        <GlassSurface className="rounded-2xl">
          <div className="h-full bg-obsidian-800/60 p-6">
            <div className="flex items-center gap-2.5">
              <span className="rounded-lg border border-electric/40 bg-electric/15 px-2.5 py-1 font-mono text-[11px] font-bold text-electric-bright">MQL5</span>
              <h3 className="font-display text-[15px] font-semibold text-frost">{VERDICT_MQL5.title}</h3>
            </div>
            <ul className="mt-5 flex flex-col gap-3">
              {VERDICT_MQL5.items.map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-[13px] leading-relaxed text-frost-dim">
                  <Check size={14} className="mt-0.5 shrink-0 text-electric" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </GlassSurface>
      </div>

      <GlassSurface className="mt-8 overflow-hidden rounded-2xl">
        <div className="noise-overlay relative bg-obsidian-800/70 p-7">
          <div className="pointer-events-none absolute inset-0 hero-glow" />
          <div className="relative">
            <h3 className="font-display text-lg font-bold text-frost">Summary</h3>
            <p className="mt-3 max-w-2xl text-[13.5px] leading-[1.8] text-frost-dim">
              For projects <strong className="text-frost">not bound to MT4 accounts</strong>, the language
              fundamentals are most accessibly learned through the MQL4 section, while{' '}
              <strong className="text-frost">new projects should be built on MQL5</strong> — the position
              model, handle-based indicators and OOP are the durable investment for the coming
              platform generations, particularly where AI integration is planned.
              For code conversion, the{' '}
              <Link to="/migrasi" className="text-electric-bright underline decoration-electric/40 underline-offset-2 hover:decoration-electric">
                migration mapping table
              </Link>{' '}
              documents each function correspondence.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                to="/mql4"
                className="group flex items-center gap-2 rounded-xl border border-frost/15 bg-frost/5 px-5 py-2.5 text-[13px] font-semibold text-frost transition hover:border-frost/30"
              >
                Open the MQL4 reference
                <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                to="/mql5"
                className="group flex items-center gap-2 rounded-xl bg-electric px-5 py-2.5 text-[13px] font-semibold text-white transition hover:bg-electric-soft"
              >
                Open the MQL5 reference
                <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
        </div>
      </GlassSurface>
    </div>
  )
}
