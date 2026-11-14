import { Link, useParams, Navigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, ArrowRight, CheckCircle2, Lightbulb, Target } from 'lucide-react'
import { MQL4_TOPICS } from '@/data/mql4'
import { MQL5_TOPICS } from '@/data/mql5'
import CodeBlock from '@/components/docs/CodeBlock'
import Icon from '@/components/docs/Icon'
import { SectionHeading, Paragraph } from '@/components/docs/DocUI'
import { cn } from '@/lib/utils'

export default function TopicPage() {
  const { section, topicId } = useParams<{ section: 'mql4' | 'mql5'; topicId: string }>()

  if (section !== 'mql4' && section !== 'mql5') return <Navigate to="/mql4" replace />
  const topics = section === 'mql5' ? MQL5_TOPICS : MQL4_TOPICS
  const index = topics.findIndex((t) => t.id === topicId)
  if (index === -1) return <Navigate to={`/${section}`} replace />

  const topic = topics[index]
  const prev = topics[index - 1]
  const next = topics[index + 1]
  const langBadge = section === 'mql5' ? 'MQL5' : 'MQL4'

  return (
    <div>
      {/* header */}
      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55 }}>
        <Link
          to={`/${section}`}
          className="inline-flex items-center gap-1.5 text-[12.5px] text-frost-faint transition hover:text-electric-bright"
        >
          <ArrowLeft size={13} />
          MQL{section === 'mql5' ? '5' : '4'} Reference
        </Link>

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <span
            className={cn(
              'rounded-lg border px-2.5 py-1 font-mono text-[10.5px] font-bold tracking-wider',
              section === 'mql5'
                ? 'border-electric/40 bg-electric/15 text-electric-bright'
                : 'border-frost/20 bg-frost/5 text-frost-dim'
            )}
          >
            {langBadge}
          </span>
          <span className="font-mono text-[11px] text-frost-faint">
            TOPIC {String(index + 1).padStart(2, '0')} / {String(topics.length).padStart(2, '0')}
          </span>
        </div>

        <div className="mt-4 flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-electric/30 bg-electric-faint text-electric">
            <Icon name={topic.icon} size={21} />
          </div>
          <div>
            <h1 className="font-display text-[clamp(1.6rem,3.5vw,2.2rem)] font-bold leading-tight tracking-tightest text-frost">
              {topic.title}
            </h1>
            <p className="mt-1.5 text-[14px] text-frost-dim">{topic.subtitle}</p>
          </div>
        </div>
      </motion.div>

      {/* 1. SYNTAX */}
      <SectionHeading id="syntax">Syntax</SectionHeading>
      <Paragraph>{topic.syntax.intro}</Paragraph>
      <div className="mb-6 flex flex-col gap-3">
        {topic.syntax.points.map((p, i) => (
          <motion.div
            key={p.label}
            initial={{ opacity: 0, x: -14 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-30px' }}
            transition={{ duration: 0.45, delay: i * 0.05 }}
            className="rounded-xl border border-frost/10 bg-obsidian-800/50 px-4 py-3"
          >
            <div className="flex items-baseline gap-3">
              <code className="shrink-0 rounded-md border border-electric/25 bg-electric-faint px-2 py-0.5 font-mono text-[12px] font-semibold text-electric-bright">
                {p.label}
              </code>
              <p className="text-[13.5px] leading-relaxed text-frost-dim">{p.desc}</p>
            </div>
          </motion.div>
        ))}
      </div>
      {topic.syntax.code && (
        <CodeBlock code={topic.syntax.code} flavor={section} title={topic.syntax.codeTitle ?? `${topic.id}.${section === 'mql5' ? 'mq5' : 'mq4'}`} />
      )}

      {/* 2. USE CASES */}
      <SectionHeading id="use-cases">Use Cases</SectionHeading>
      <Paragraph>{topic.useCase.intro}</Paragraph>
      <div className="mb-6 flex flex-col gap-3">
        {topic.useCase.items.map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-30px' }}
            transition={{ duration: 0.45, delay: i * 0.05 }}
            className="relative overflow-hidden rounded-xl border border-frost/10 bg-obsidian-800/50 p-4"
          >
            <div className="absolute inset-y-0 left-0 w-0.5 bg-gradient-to-b from-electric to-transparent" />
            <div className="flex items-start gap-3">
              <Target size={15} className="mt-0.5 shrink-0 text-electric" />
              <div>
                <div className="font-display text-[13.5px] font-semibold text-frost">{item.when}</div>
                <p className="mt-1 text-[13px] leading-relaxed text-frost-dim">{item.why}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* 3. PERFORMANCE */}
      <SectionHeading id="performance">Performance Considerations</SectionHeading>
      <Paragraph>{topic.efficiency.intro}</Paragraph>
      <div className="mb-6 flex flex-col gap-3">
        {topic.efficiency.tips.map((tip, i) => (
          <motion.div
            key={tip.title}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-30px' }}
            transition={{ duration: 0.45, delay: i * 0.05 }}
            className="rounded-xl border border-frost/10 bg-obsidian-800/50 p-4"
          >
            <div className="flex items-start gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md border border-electric/30 bg-electric-faint font-mono text-[10px] font-bold text-electric">
                {i + 1}
              </span>
              <div className="min-w-0 flex-1">
                <div className="font-display text-[13.5px] font-semibold text-frost">{tip.title}</div>
                <p className="mt-1 text-[13px] leading-relaxed text-frost-dim">{tip.desc}</p>
                {tip.code && (
                  <CodeBlock code={tip.code} flavor={section} className="mt-3" />
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* 4. EXAMPLE */}
      <SectionHeading id="example">Implementation Example</SectionHeading>
      <div className="mb-4 flex items-center gap-2.5">
        <Lightbulb size={15} className="text-electric" />
        <span className="font-display text-[14px] font-semibold text-frost">{topic.example.title}</span>
      </div>
      <CodeBlock
        code={topic.example.code}
        flavor={topic.example.flavor ?? (section as 'mql4' | 'mql5')}
        title={`${topic.id}.${section === 'mql5' ? 'mq5' : 'mq4'}`}
      />
      <ul className="mt-5 flex flex-col gap-2.5">
        {topic.example.explanation.map((ex, i) => (
          <li key={i} className="flex items-start gap-2.5 text-[13.5px] leading-relaxed text-frost-dim">
            <CheckCircle2 size={14} className="mt-1 shrink-0 text-electric/70" />
            {ex}
          </li>
        ))}
      </ul>

      {/* footer navigation */}
      <div className="mt-12 border-t border-frost/10 pt-6">
        <div className="grid gap-3 sm:grid-cols-2">
          {prev ? (
            <Link
              to={`/${section}/${prev.id}`}
              className="group rounded-xl border border-frost/10 bg-obsidian-800/50 px-4 py-3.5 transition hover:border-electric/30"
            >
              <div className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-frost-faint">
                <ArrowLeft size={11} /> Previous
              </div>
              <div className="mt-1.5 font-display text-[13.5px] font-semibold text-frost-dim group-hover:text-frost">
                {prev.title}
              </div>
            </Link>
          ) : (
            <div />
          )}
          {next && (
            <Link
              to={`/${section}/${next.id}`}
              className="group rounded-xl border border-frost/10 bg-obsidian-800/50 px-4 py-3.5 text-right transition hover:border-electric/30"
            >
              <div className="flex items-center justify-end gap-1.5 font-mono text-[10px] uppercase tracking-wider text-frost-faint">
                Next <ArrowRight size={11} />
              </div>
              <div className="mt-1.5 font-display text-[13.5px] font-semibold text-frost-dim group-hover:text-frost">
                {next.title}
              </div>
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}
