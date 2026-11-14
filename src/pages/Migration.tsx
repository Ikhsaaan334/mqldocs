import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, Search } from 'lucide-react'
import { MIGRATION_ROWS } from '@/data/migration'
import SplitText from '@/components/reactbits/SplitText'
import { cn } from '@/lib/utils'

const CATS = ['All', 'Trading', 'Indicators', 'Data & Time', 'Information', 'Other'] as const

export default function Migration() {
  const [cat, setCat] = useState<(typeof CATS)[number]>('All')
  const [q, setQ] = useState('')

  const rows = useMemo(() => {
    let r = cat === 'All' ? MIGRATION_ROWS : MIGRATION_ROWS.filter((x) => x.category === cat)
    const needle = q.trim().toLowerCase()
    if (needle) {
      r = r.filter((x) => `${x.previous} ${x.current} ${x.note}`.toLowerCase().includes(needle))
    }
    return r
  }, [cat, q])

  return (
    <div>
      <span className="inline-block rounded-lg border border-electric/40 bg-electric/15 px-3 py-1 font-mono text-[11px] font-bold tracking-wider text-electric-bright">
        MIGRATION
      </span>
      <SplitText
        as="h1"
        text="MQL4 to MQL5"
        className="mt-5 font-display text-[clamp(1.9rem,4vw,2.8rem)] font-bold tracking-tightest text-frost"
      />
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.6 }}
        className="mt-4 max-w-2xl text-[15px] leading-[1.8] text-frost-dim"
      >
        A function-to-function mapping for porting code from MQL4 to MQL5. Use the search
        field to locate a specific function; the notes column documents the considerations
        attached to each mapping.
      </motion.p>

      <div className="mt-8 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-2">
          {CATS.map((c) => (
            <button
              key={c}
              onClick={() => setCat(c)}
              className={cn(
                'rounded-lg border px-3 py-1.5 font-mono text-[11.5px] transition',
                cat === c
                  ? 'border-electric/50 bg-electric-faint text-electric-bright'
                  : 'border-frost/10 bg-frost/5 text-frost-faint hover:text-frost-dim'
              )}
            >
              {c}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2.5 rounded-xl border border-frost/10 bg-obsidian-800/60 px-3.5 py-2 lg:w-72">
          <Search size={14} className="shrink-0 text-electric" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search a function (OrderSend, iMA)"
            className="w-full bg-transparent font-mono text-[12.5px] text-frost placeholder:text-frost-faint focus:outline-none"
          />
        </div>
      </div>

      <p className="mt-3 font-mono text-[11px] text-frost-faint">{rows.length} mappings</p>

      <div className="mt-4 flex flex-col gap-3">
        {rows.map((row, i) => (
          <motion.div
            key={`${row.previous}-${i}`}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: Math.min(i * 0.03, 0.25) }}
            className="rounded-xl border border-frost/10 bg-obsidian-800/50 p-4 transition hover:border-electric/25"
          >
            <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-wider text-frost-faint">
              <span className="rounded border border-frost/15 bg-frost/5 px-1.5 py-0.5">{row.category}</span>
            </div>
            <div className="mt-3 flex flex-col gap-2.5 lg:flex-row lg:items-center lg:gap-4">
              <code className="flex-1 rounded-lg border border-frost/10 bg-obsidian-900/80 px-3 py-2 font-mono text-[12px] leading-relaxed text-frost-dim line-through decoration-frost/30">
                {row.previous}
              </code>
              <ArrowRight size={15} className="shrink-0 rotate-90 text-electric lg:rotate-0" />
              <code className="flex-1 rounded-lg border border-electric/30 bg-electric-faint px-3 py-2 font-mono text-[12px] leading-relaxed text-electric-bright">
                {row.current}
              </code>
            </div>
            <p className="mt-2.5 text-[12px] leading-relaxed text-frost-faint">{row.note}</p>
          </motion.div>
        ))}
      </div>

      {rows.length === 0 && (
        <div className="mt-10 rounded-xl border border-frost/10 bg-obsidian-800/40 py-14 text-center text-sm text-frost-faint">
          No mapping matches “{q}”
        </div>
      )}

      <div className="mt-10 rounded-xl border border-amber-400/25 bg-amber-400/5 px-4 py-3.5">
        <div className="mb-1 font-mono text-[11px] font-semibold uppercase tracking-wider text-amber-300">
          Migration principle
        </div>
        <p className="text-[13px] leading-relaxed text-frost-dim">
          Line-by-line porting with identical behavior should not be expected. Two model
          differences — handle-based indicators and positions versus orders — require a{' '}
          <strong className="text-frost">refactor of the flow rather than a function rename</strong>.
          Begin with the Handle-Based Indicators and Trading topics in the MQL5 section,
          then use this table as the function dictionary.
        </p>
      </div>
    </div>
  )
}
