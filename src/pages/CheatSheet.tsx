import { useState } from 'react'
import { motion } from 'framer-motion'
import { CHEAT_MQL4, CHEAT_MQL5 } from '@/data/cheatsheet'
import SplitText from '@/components/reactbits/SplitText'
import Icon from '@/components/docs/Icon'
import { cn } from '@/lib/utils'

export default function CheatSheet() {
  const [lang, setLang] = useState<'mql4' | 'mql5'>('mql5')
  const cats = lang === 'mql5' ? CHEAT_MQL5 : CHEAT_MQL4

  return (
    <div>
      <span className="inline-block rounded-lg border border-electric/40 bg-electric/15 px-3 py-1 font-mono text-[11px] font-bold tracking-wider text-electric-bright">
        QUICK REFERENCE
      </span>
      <SplitText
        as="h1"
        text="Quick Reference"
        className="mt-5 font-display text-[clamp(1.9rem,4vw,2.8rem)] font-bold tracking-tightest text-frost"
      />
      <p className="mt-4 max-w-2xl text-[15px] leading-[1.8] text-frost-dim">
        Core signatures with one-line descriptions, grouped by category. Intended for
        readers familiar with the concepts who require the exact call form.
      </p>

      <div className="mt-7 inline-flex rounded-xl border border-frost/10 bg-obsidian-800/60 p-1">
        {(['mql4', 'mql5'] as const).map((l) => (
          <button
            key={l}
            onClick={() => setLang(l)}
            className={cn(
              'rounded-lg px-5 py-2 font-mono text-[12px] font-bold transition',
              lang === l
                ? l === 'mql5'
                  ? 'bg-electric/20 text-electric-bright ring-1 ring-electric/40'
                  : 'bg-frost/10 text-frost'
                : 'text-frost-faint hover:text-frost-dim'
            )}
          >
            {l.toUpperCase()}
          </button>
        ))}
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {cats.map((cat, i) => (
          <motion.div
            key={cat.category}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.45, delay: (i % 2) * 0.08 }}
            className="overflow-hidden rounded-2xl border border-frost/10 bg-obsidian-800/50"
          >
            <div className="flex items-center gap-2.5 border-b border-frost/10 bg-obsidian-800/80 px-4 py-3">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg border border-electric/25 bg-electric-faint text-electric">
                <Icon name={cat.icon} size={14} />
              </span>
              <h2 className="font-display text-[14px] font-semibold text-frost">{cat.category}</h2>
              <span className="ml-auto font-mono text-[10px] text-frost-faint">{cat.rows.length} API</span>
            </div>
            <div className="divide-y divide-frost/5">
              {cat.rows.map((row) => (
                <div key={row.signature} className="px-4 py-2.5 transition hover:bg-frost/[0.03]">
                  <code className={cn(
                    'block break-words font-mono text-[11.5px] leading-relaxed',
                    lang === 'mql5' ? 'text-electric-bright/90' : 'text-frost'
                  )}>
                    {row.signature}
                  </code>
                  <p className="mt-0.5 text-[11.5px] leading-relaxed text-frost-faint">{row.desc}</p>
                </div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
