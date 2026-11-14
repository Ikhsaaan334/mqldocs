import { Link, useParams, Navigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, FileCode2, Info } from 'lucide-react'
import { MQL4_TOPICS } from '@/data/mql4'
import { MQL5_TOPICS } from '@/data/mql5'
import SpotlightCard from '@/components/reactbits/SpotlightCard'
import Icon from '@/components/docs/Icon'

const CONFIG = {
  mql4: {
    topics: MQL4_TOPICS,
    badge: 'MQL4',
    intro: 'MQL4 is the language of the MetaTrader 4 platform: a single order model, direct-value indicators, and the largest body of reference code. This section documents it in a consistent format: syntax, use cases, performance considerations, and an implementation example.',
    verdict: 'MQL4 applies when the broker is MT4-bound, legacy advisors must be maintained, or the widest body of reference code is required.'
  },
  mql5: {
    topics: MQL5_TOPICS,
    badge: 'MQL5',
    intro: 'MQL5 is the language of the modern MetaTrader 5 platform: full OOP, the Standard Library, handle-based indicators, a real-tick Strategy Tester, and a native ONNX runtime. This section documents every concept that distinguishes it from MQL4.',
    verdict: 'MQL5 applies to new projects, serious backtesting, multi-symbol systems, and AI-based integrations.'
  }
}

export default function SectionOverview() {
  const { section } = useParams<{ section: 'mql4' | 'mql5' }>()
  const cfg = section === 'mql5' ? CONFIG.mql5 : section === 'mql4' ? CONFIG.mql4 : null

  if (!cfg || !section) return <Navigate to="/mql4" replace />

  return (
    <div>
      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
        <span
          className={`inline-block rounded-lg border px-3 py-1 font-mono text-[11px] font-bold tracking-wider ${
            section === 'mql5'
              ? 'border-electric/40 bg-electric/15 text-electric-bright'
              : 'border-frost/20 bg-frost/5 text-frost-dim'
          }`}
        >
          {cfg.badge}
        </span>
        <h1 className="mt-5 font-display text-[clamp(1.9rem,4vw,2.8rem)] font-bold tracking-tightest text-frost">
          {cfg.badge} Reference
        </h1>
        <p className="mt-4 max-w-2xl text-[15px] leading-[1.8] text-frost-dim">{cfg.intro}</p>

        <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 font-mono text-[11.5px] text-frost-faint">
          <span className="flex items-center gap-1.5"><FileCode2 size={13} className="text-electric" />{cfg.topics.length} topics</span>
        </div>

        <div className="mt-7 flex items-start gap-3 rounded-xl border border-electric/20 bg-electric-faint px-4 py-3.5">
          <Info size={15} className="mt-0.5 shrink-0 text-electric" />
          <p className="text-[13px] leading-relaxed text-frost-dim">{cfg.verdict}</p>
        </div>
      </motion.div>

      <h2 className="mb-6 mt-14 font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-frost-faint">
        Topics — the listed order is the recommended reading order
      </h2>
      <div className="grid gap-4 sm:grid-cols-2">
        {cfg.topics.map((t, i) => {
          return (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.5, delay: (i % 4) * 0.07 }}
            >
              <Link to={`/${section}/${t.id}`}>
                <SpotlightCard className="h-full p-5">
                  <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-electric/25 bg-electric-faint text-electric">
                      <Icon name={t.icon} size={17} />
                    </div>
                    <div className="min-w-0">
                      <span className="font-mono text-[10px] text-frost-faint">
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <h3 className="mt-0.5 font-display text-[14.5px] font-semibold leading-snug text-frost">
                        {t.title}
                      </h3>
                      <p className="mt-1 line-clamp-2 text-[12.5px] leading-relaxed text-frost-faint">
                        {t.subtitle}
                      </p>
                    </div>
                    <ArrowRight size={15} className="ml-auto mt-1 shrink-0 text-frost/20 transition group-hover:translate-x-0.5 group-hover:text-electric" />
                  </div>
                  <div className="mt-4 border-t border-frost/5 pt-3 font-mono text-[10.5px] text-frost-faint">
                    syntax · use cases · performance · example
                  </div>
                </SpotlightCard>
              </Link>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
