import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { ROADMAP } from '@/data/roadmap'
import SplitText from '@/components/reactbits/SplitText'

export default function LearningPath() {
  return (
    <div>
      <span className="inline-block rounded-lg border border-electric/40 bg-electric/15 px-3 py-1 font-mono text-[11px] font-bold tracking-wider text-electric-bright">
        ROADMAP
      </span>
      <SplitText
        as="h1"
        text="Structured Roadmap"
        className="mt-5 font-display text-[clamp(1.9rem,4vw,2.8rem)] font-bold tracking-tightest text-frost"
      />
      <p className="mt-4 max-w-2xl text-[15px] leading-[1.8] text-frost-dim">
        A recommended reading order in which each stage builds on the previous one —
        from language fundamentals to architecture and AI integration.
      </p>

      <div className="mt-10 flex flex-col">
        {ROADMAP.map((stage, idx) => (
          <motion.div
            key={stage.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.55 }}
            className="relative flex gap-5 pb-10 last:pb-0"
          >
            {idx < ROADMAP.length - 1 && (
              <div className="absolute bottom-0 left-[17px] top-12 w-px bg-gradient-to-b from-electric/40 to-frost/10" />
            )}
            <div className="z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-electric/40 bg-electric/15 font-mono text-[12px] font-bold text-electric-bright">
              {idx}
            </div>

            <div className="min-w-0 flex-1">
              <h2 className="font-display text-[16px] font-bold tracking-tight text-frost">{stage.title}</h2>
              <p className="mt-1.5 text-[13px] leading-relaxed text-frost-dim">{stage.desc}</p>

              <div className="mt-4 flex flex-col gap-1.5">
                {stage.items.map((item) =>
                  item.path ? (
                    <Link
                      key={item.label}
                      to={item.path}
                      className="group flex items-center gap-3 rounded-lg border border-frost/10 bg-obsidian-800/50 px-3.5 py-2.5 transition hover:border-electric/30"
                    >
                      <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-electric/60" />
                      <span className="text-[13px] text-frost-dim group-hover:text-frost">{item.label}</span>
                      <ArrowRight size={13} className="ml-auto text-frost/20 transition group-hover:translate-x-0.5 group-hover:text-electric" />
                    </Link>
                  ) : (
                    <div key={item.label} className="flex items-center gap-3 px-3.5 py-2 text-[12.5px] text-frost-faint">
                      <span className="h-1.5 w-1.5 rounded-full bg-electric/40" />
                      {item.label}
                    </div>
                  )
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
