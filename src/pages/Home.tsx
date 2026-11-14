import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ArrowRight, ArrowUpRight, Boxes, Braces, Layers, Brain, ShieldCheck,
  Table2, Rocket
} from 'lucide-react'
import GhostFibers from '@/components/reactbits/GhostFibers'
import SplitText from '@/components/reactbits/SplitText'
import DecryptedText from '@/components/reactbits/DecryptedText'
import SpotlightCard from '@/components/reactbits/SpotlightCard'
import GlassSurface from '@/components/reactbits/GlassSurface'
import Footer from '@/components/layout/Footer'

const FEATURES = [
  {
    icon: Braces,
    title: 'Structured syntax reference',
    desc: 'Each topic decomposes the syntax into its core constructs with precise definitions and context.'
  },
  {
    icon: Boxes,
    title: 'Documented use cases',
    desc: 'Every concept is mapped to the conditions under which it applies and the alternatives it supersedes.'
  },
  {
    icon: Rocket,
    title: 'Performance considerations',
    desc: 'Established efficiency patterns alongside the anti-patterns that degrade advisor performance.'
  },
  {
    icon: Layers,
    title: 'Application architecture',
    desc: 'Layered architecture, state machines and .mqh module structure — from single-file advisors to production systems.'
  },
  {
    icon: Brain,
    title: 'Four AI integration patterns',
    desc: 'WebRequest REST to Python, native ONNX in MQL5, file handshake and socket bridges, with documented trade-offs.'
  },
  {
    icon: ShieldCheck,
    title: 'Known pitfalls',
    desc: 'Repaint, handle leaks, overfitting and missing magic numbers — each with its resolution and reference code.'
  }
]

export default function Home() {
  return (
    <div className="min-h-screen bg-obsidian-950">
      {/* full-page Ghost Fibers background */}
      <div className="fixed inset-0 z-0" aria-hidden="true">
        <GhostFibers
          glowColor="#8B5CF6"
          secondaryColor="#6D28D9"
          speed={0.45}
          brightness={0.85}
          vignette={0.22}
          grain={0.05}
        />
      </div>

      <div className="relative z-10">
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 hero-glow opacity-70" />
        <div className="relative mx-auto flex min-h-[88vh] max-w-6xl flex-col items-center justify-center px-6 pb-20 pt-24 text-center">
          <SplitText
            as="h1"
            text="The MQL4 and MQL5"
            delay={0.25}
            className="font-display text-[clamp(2.6rem,7vw,5rem)] font-bold leading-[1.04] tracking-tightest text-frost"
          />
          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.9 }}
            className="mt-2 font-display text-[clamp(1.6rem,4vw,2.6rem)] font-semibold tracking-tight"
          >
            <span className="text-gradient">Language Reference</span>
          </motion.p>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 1.15 }}
            className="mt-6 max-w-2xl text-[15px] leading-[1.8] text-frost-dim"
          >
            A structured reference for the MQL4 and MQL5 languages: syntax, usage,
            performance considerations, application architecture, and AI integration —
            each topic documented with reference implementations.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 1.35 }}
            className="mt-9 flex flex-wrap items-center justify-center gap-3"
          >
            <Link
              to="/learning-path"
              className="group flex items-center gap-2 rounded-xl bg-electric px-6 py-3 text-sm font-semibold text-white shadow-[0_16px_40px_-12px_rgba(139,92,246,0.6)] transition hover:bg-electric-soft"
            >
              Reading Order
              <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              to="/perbandingan"
              className="flex items-center gap-2 rounded-xl border border-frost/15 bg-frost/5 px-6 py-3 text-sm font-semibold text-frost transition hover:border-electric/40 hover:bg-electric-faint"
            >
              MQL4 vs MQL5 — Platform Selection
              <ArrowUpRight size={15} />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* CONTENTS */}
      <section className="relative mx-auto max-w-6xl px-6 py-24">
        <SectionLabel index="01" title="Contents" />
        <h2 className="font-display text-[clamp(1.6rem,3.5vw,2.4rem)] font-bold tracking-tight text-frost">
          A structured reference, <span className="text-gradient">not a cheat sheet</span>
        </h2>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.6, delay: (i % 3) * 0.1 }}
            >
              <SpotlightCard className="h-full p-6">
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg border border-electric/25 bg-electric-faint text-electric">
                  <f.icon size={18} />
                </div>
                <h3 className="mb-2 font-display text-[15px] font-semibold text-frost">{f.title}</h3>
                <p className="text-[13.5px] leading-relaxed text-frost-dim">{f.desc}</p>
              </SpotlightCard>
            </motion.div>
          ))}
        </div>
      </section>

      {/* TWO LANGUAGES */}
      <section className="relative mx-auto max-w-6xl px-6 py-10">
        <SectionLabel index="02" title="Two languages, one foundation" />
        <h2 className="font-display text-[clamp(1.6rem,3.5vw,2.4rem)] font-bold tracking-tight text-frost">
          Separately documented, <span className="text-gradient">from the first page</span>
        </h2>
        <div className="mt-10 grid gap-5 lg:grid-cols-2">
          <LangCard
            badge="MQL4"
            title="The MetaTrader 4 platform language"
            desc="A single order model and direct-value indicators. Documented here for platform-bound deployments, legacy codebases, and the widest available body of reference implementations."
            topics={11}
            accent="outline"
            href="/mql4"
            bullets={['Program structure and event handlers', 'OrderSend, OrderSelect, OrderModify', 'Direct-value indicators and iCustom', 'Performance patterns and error recovery']}
          />
          <LangCard
            badge="MQL5"
            title="The MetaTrader 5 platform language"
            desc="Full OOP, the Standard Library, real-tick backtesting and a native ONNX runtime. The documented platform for new projects and AI-based systems."
            topics={12}
            accent="fill"
            href="/mql5"
            bullets={['Handle-based indicators and CTrade', 'OOP: classes, interfaces, state machines', 'Strategy Tester with custom scoring', 'ONNX inference inside the advisor']}
          />
        </div>
      </section>

      {/* ARCHITECTURE */}
      <section className="relative mx-auto max-w-6xl px-6 py-24">
        <SectionLabel index="03" title="From scripts to systems" />
        <div className="overflow-hidden rounded-3xl border border-frost/10 bg-obsidian-800/40">
          <div className="relative border-b border-frost/10 p-8 lg:p-10">
            <div className="pointer-events-none absolute inset-0 bg-dots opacity-40" />
            <div className="relative flex flex-col gap-8 lg:flex-row lg:items-center">
              <div className="max-w-md">
                <h3 className="font-display text-2xl font-bold tracking-tight text-frost">
                  A sound architecture is <span className="text-gradient">layered and event-driven</span>
                </h3>
                <p className="mt-3 text-[14px] leading-relaxed text-frost-dim">
                  Signal Engine, Risk Manager, Execution Engine — components with single
                  responsibilities governed by a state machine, plus four documented AI
                  integration patterns and their respective trade-offs.
                </p>
                <Link
                  to="/arsitektur"
                  className="group mt-6 inline-flex items-center gap-2 rounded-xl border border-electric/40 bg-electric-faint px-5 py-2.5 text-sm font-semibold text-electric-bright transition hover:bg-electric/15"
                >
                  Architecture reference
                  <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
              <div className="flex flex-1 flex-col gap-2.5">
                {[
                  { name: 'Market Data Layer', detail: 'SymbolInfoTick · CopyRates · indicator handles' },
                  { name: 'Signal Engine', detail: 'pure functions · pluggable strategies · zero side effects' },
                  { name: 'Risk Manager', detail: 'risk-based sizing · drawdown guard · absolute veto' },
                  { name: 'Execution Engine', detail: 'CTrade · classified retries · journaling' }
                ].map((layer, i) => (
                  <motion.div
                    key={layer.name}
                    initial={{ opacity: 0, x: 24 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: i * 0.12 }}
                    className="group flex items-center gap-4 rounded-xl border border-frost/10 bg-obsidian-900/80 px-5 py-3.5 transition hover:border-electric/35"
                  >
                    <span className="font-mono text-[10px] text-electric">0{i + 1}</span>
                    <div>
                      <div className="font-display text-[13px] font-semibold text-frost">{layer.name}</div>
                      <div className="font-mono text-[10.5px] text-frost-faint">{layer.detail}</div>
                    </div>
                    <ArrowRight size={14} className="ml-auto text-frost/20 transition group-hover:text-electric" />
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
          <div className="grid gap-px bg-frost/5 sm:grid-cols-3">
            {[
              { icon: Table2, t: 'MQL4 to MQL5 Migration', d: 'Function-to-function mapping table for porting' },
              { icon: Brain, t: 'Four AI patterns', d: 'REST · native ONNX · file handshake · socket DLL' },
              { icon: ShieldCheck, t: 'Known pitfalls', d: '11 documented defects with resolutions' }
            ].map((c) => (
              <Link key={c.t} to="/arsitektur" className="group bg-obsidian-900/90 p-5 transition hover:bg-obsidian-800/90">
                <c.icon size={16} className="text-electric" />
                <div className="mt-2.5 font-display text-[13.5px] font-semibold text-frost group-hover:text-electric-bright">{c.t}</div>
                <div className="mt-1 text-[12px] text-frost-faint">{c.d}</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative mx-auto max-w-6xl px-6 pb-8 pt-4">
        <GlassSurface className="overflow-hidden rounded-3xl">
          <div className="noise-overlay relative bg-obsidian-800/60 px-8 py-14 text-center lg:py-16">
            <div className="pointer-events-none absolute inset-0 hero-glow" />
            <div className="relative">
              <DecryptedText
                text="Begin with the structured roadmap"
                className="font-display text-[clamp(1.4rem,3vw,2rem)] font-bold tracking-tight text-frost"
                speed={40}
              />
              <p className="mx-auto mt-3 max-w-md text-[13.5px] text-frost-dim">
                Seven stages from language fundamentals to architecture and AI
                integration, each stage linking to its reference topics.
              </p>
              <Link
                to="/learning-path"
                className="group mt-7 inline-flex items-center gap-2 rounded-xl bg-electric px-7 py-3 text-sm font-semibold text-white shadow-[0_16px_40px_-12px_rgba(139,92,246,0.6)] transition hover:bg-electric-soft"
              >
                Open the Roadmap
                <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
        </GlassSurface>
      </section>

      <Footer />
      </div>
    </div>
  )
}

function SectionLabel({ index, title }: { index: string; title: string }) {
  return (
    <div className="mb-3 flex items-center gap-3">
      <span className="font-mono text-[11px] text-electric">{index}</span>
      <span className="h-px w-8 bg-electric/40" />
      <DecryptedText
        text={title.toUpperCase()}
        className="font-mono text-[11px] tracking-[0.2em] text-frost-faint"
        speed={30}
      />
    </div>
  )
}

function LangCard({
  badge, title, desc, topics, accent, href, bullets
}: {
  badge: string
  title: string
  desc: string
  topics: number
  accent: 'outline' | 'fill'
  href: string
  bullets: string[]
}) {
  const isFill = accent === 'fill'
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.6 }}
    >
      <SpotlightCard className="h-full p-7">
        <div className="flex items-start justify-between">
          <span
            className={`rounded-lg border px-3 py-1 font-mono text-xs font-bold tracking-wider ${
              isFill
                ? 'border-electric/40 bg-electric/15 text-electric-bright'
                : 'border-frost/20 bg-frost/5 text-frost-dim'
            }`}
          >
            {badge}
          </span>
          <span className="font-mono text-[11px] text-frost-faint">{topics} topics</span>
        </div>
        <h3 className="mt-5 font-display text-lg font-semibold text-frost">{title}</h3>
        <p className="mt-2 text-[13.5px] leading-relaxed text-frost-dim">{desc}</p>
        <ul className="mt-5 flex flex-col gap-2">
          {bullets.map((b) => (
            <li key={b} className="flex items-center gap-2.5 text-[13px] text-frost-dim">
              <span className="h-1 w-1 rounded-full bg-electric" />
              {b}
            </li>
          ))}
        </ul>
        <Link
          to={href}
          className="group mt-6 inline-flex items-center gap-2 text-sm font-semibold text-electric-bright"
        >
          Open the {badge} reference
          <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
        </Link>
      </SpotlightCard>
    </motion.div>
  )
}
