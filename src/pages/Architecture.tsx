import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  ArrowRight, Database, Workflow, ShieldCheck, Rocket, Brain, FileCode2,
  Cloud, HardDrive, Network, Check, X, Layers
} from 'lucide-react'
import SplitText from '@/components/reactbits/SplitText'
import Particles from '@/components/reactbits/Particles'
import CodeBlock from '@/components/docs/CodeBlock'
import { SectionHeading, Paragraph, Callout } from '@/components/docs/DocUI'
import { cn } from '@/lib/utils'

const LAYERS = [
  {
    id: 'data',
    name: 'Market Data Layer',
    icon: Database,
    detail: 'The single entry point for market data. In MQL5: MqlTick via SymbolInfoTick and CopyRates/CopyBuffer from handles created once in OnInit. No other component may call Copy* directly.',
    mql: ['MqlTick + SymbolInfoTick', 'iMA/iRSI handles in OnInit', 'CopyRates on bar events'],
    warn: 'Anti-pattern: three modules copying the same data repeatedly on every tick.'
  },
  {
    id: 'signal',
    name: 'Signal Engine',
    icon: Workflow,
    detail: 'Pure functions: data in, signal out (-1/0/+1 plus stop context). No order interaction, no global state, no knowledge of money. Consequence: independently backtestable, with pluggable implementations behind one interface.',
    mql: ['interface ISignalEngine', 'MA cross / pin bar / ML implementations', 'output struct Signal {dir, slLevel, note}'],
    warn: 'Anti-pattern: a signal that also sends orders cannot be tested or replaced.'
  },
  {
    id: 'risk',
    name: 'Risk Manager (veto rights)',
    icon: ShieldCheck,
    detail: 'A protection layer independent of the strategy: risk-based sizing, maximum drawdown guard, spread and session filters, margin checks and exposure limits. Signal decisions NEVER bypass this layer. Strategies may fail; the account must not.',
    mql: ['CalcLotByRisk(balance, riskPct, sl)', 'equity drawdown guard (kill switch)', 'FreeMarginCheck before orders'],
    warn: 'Anti-pattern: risk checks inside the signal, silently skipped when the signal is refactored.'
  },
  {
    id: 'exec',
    name: 'Execution Engine',
    icon: Rocket,
    detail: 'The only component that calls CTrade/OrderSend. Wraps classified retries (transient versus permanent), volume and price normalization, idempotency via magic plus comment, and journals every attempt. The state machine guarantees no duplicate executions.',
    mql: ['CTrade + SetTypeFillingBySymbol', 'retry transient errors only', 'CTradeStateMachine (IDLE→ENTRY→MANAGE→COOLDOWN)'],
    warn: 'Anti-pattern: OrderSend calls scattered across files without error classification.'
  },
  {
    id: 'journal',
    name: 'Persistence and Journal',
    icon: FileCode2,
    detail: 'Records everything: signals, risk decisions, orders, errors, deals. In MQL5: SQLite (DatabaseOpen), directly readable by Python. Dual purpose: live incident auditing and the training dataset for ML models.',
    mql: ['SQLite trades/state tables', 'INSERT from OnTradeTransaction', 'CSV export for Python pipelines'],
    warn: 'Anti-pattern: polling order history on every tick for logging purposes.'
  }
]

const STATES = ['IDLE', 'SIGNAL_FOUND', 'RISK_CHECK', 'ORDER_PENDING', 'MANAGING', 'EXIT_PENDING', 'COOLDOWN'] as const

const AI_PATTERNS = [
  {
    id: 'rest',
    name: '1 · WebRequest REST to Python',
    icon: Cloud,
    tagline: 'The advisor as client, Python as the inference service',
    desc: 'The advisor sends features via HTTP POST to a FastAPI/Flask service running the model (PyTorch/scikit-learn) and receives a probability. The URL must be allowlisted in terminal options.',
    pros: ['No restriction on model size or framework', 'Retraining without touching the advisor', 'Full Python ecosystem: pandas, GPU'],
    cons: ['Blocking inside OnTick (degrades latency)', 'Network latency per request', 'Does not run in the Strategy Tester', 'Requires a live server'],
    when: 'Research and prototyping; per-bar strategies tolerant of latency; large model ensembles.',
    flavor: 'mql5' as const,
    code: `char post[], result[];
string headers = "Content-Type: application/json\\r\\n";
string payload = StringFormat(
   "{\\"features\\":[%.5f,%.5f,%.5f],\\"symbol\\":\\"%s\\"}",
   f1, f2, f3, _Symbol);
StringToCharArray(payload, post, 0, StringLen(payload));

int res = WebRequest("POST", "https://ai-server.local/predict",
                     headers, 3000, post, result, headers);
if(res == 200)
{
   // parse the JSON response -> probability -> risk and execution layers
   Print("Model:", CharArrayToString(result));
}
else if(res == -1)
   Print("WebRequest failed. Allowlist the URL under Tools > Options > Expert Advisors");`
  },
  {
    id: 'onnx',
    name: '2 · Native ONNX (recommended)',
    icon: Brain,
    tagline: 'The .onnx model lives inside the advisor',
    desc: 'A trained model is exported to ONNX and executed directly via OnnxRun. Synchronous yet microsecond-scale, with no server and no network, and it runs inside the Strategy Tester — making ML backtesting possible.',
    pros: ['Microsecond latency — safe per bar and even per tick', 'Zero infrastructure (a plain VPS suffices)', 'Fully backtestable in the tester', 'Single-file deployment of advisor plus model'],
    cons: ['The model must convert to ONNX', 'Feature engineering is reimplemented in MQL5', 'Unsuitable for large models and heavy ensembles'],
    when: 'Production: small per-bar models as probabilistic filters or signals. This is the modern default path.',
    flavor: 'mql5' as const,
    code: `long h = OnnxCreate("direction_model.onnx", ONNX_DEFAULT);
long inShape[]  = {1, N_FEATURES};
long outShape[] = {1, 1};
OnnxSetInputShape(h, 0, inShape);
OnnxSetOutputShape(h, 0, outShape);

float features[N_FEATURES];   // built from CopyRates — the feature contract
float prob[1];
if(OnnxRun(h, ONNX_DEBUG_LOGS, features, prob))
   if(prob[0] > 0.62) /* signal -> risk manager */ ;
OnnxRelease(h);`
  },
  {
    id: 'file',
    name: '3 · File Handshake (CSV/SQLite)',
    icon: HardDrive,
    tagline: 'Fully decoupled, higher latency',
    desc: 'Python writes signals or predictions to a file (CSV or SQLite in the FILE_COMMON folder); the advisor reads them on bar or timer events. No direct connection — the most resilient option.',
    pros: ['Highly resilient (a dead process does not break its counterpart)', 'Excel and Python can read and write directly', 'Suitable for batch and retraining loops'],
    cons: ['High latency (minutes, not milliseconds)', 'Requires a simple locking protocol', 'Synchronization state must be designed'],
    when: 'Per-day or long-period signals; Python research pipelines writing into the advisor SQLite journal.',
    flavor: 'mql5' as const,
    code: `// Python writes: signals.csv  (symbol,signal,sl,valid_until)
// The advisor reads on bar events / OnTimer:
int h = FileOpen("signals.csv", FILE_READ | FILE_CSV | FILE_ANSI | FILE_COMMON);
if(h != INVALID_HANDLE)
{
   while(!FileIsEnding(h))
   {
      string sym = FileReadString(h);
      string sig = FileReadString(h);
      // ...match against _Symbol, check valid_until, consume
   }
   FileClose(h);
}`
  },
  {
    id: 'socket',
    name: '4 · Socket / DLL Bridge',
    icon: Network,
    tagline: 'Real-time bidirectional, highest complexity',
    desc: 'TCP socket communication (via a DLL or websocket library) between the advisor and an AI service — for low-latency bidirectional requirements not covered by ONNX.',
    pros: ['Bidirectional real-time (streaming ticks and decisions)', 'Consistent low latency'],
    cons: ['High complexity plus C++/DLL requirements', 'Security and crash risk enter the terminal', 'Difficult to backtest'],
    when: 'Only where infrastructure is mature and ONNX/REST do not cover the requirement (for example multi-process HFT).'
  }
]

export default function Architecture() {
  const [activeLayer, setActiveLayer] = useState(LAYERS[0])
  const [activePattern, setActivePattern] = useState(AI_PATTERNS[1])

  return (
    <div>
      <span className="inline-block rounded-lg border border-electric/40 bg-electric/15 px-3 py-1 font-mono text-[11px] font-bold tracking-wider text-electric-bright">
        ARCHITECTURE
      </span>
      <SplitText
        as="h1"
        text="From Scripts to Trading Systems"
        className="mt-5 font-display text-[clamp(1.9rem,4vw,2.8rem)] font-bold tracking-tightest text-frost"
      />
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.6 }}
        className="mt-4 max-w-2xl text-[15px] leading-[1.8] text-frost-dim"
      >
        The architectural patterns used in professional advisor development, and the
        reference architecture: <strong className="text-frost">layered and event-driven</strong>,
        governed by a state machine, with four AI integration patterns compared in full.
      </motion.p>

      {/* 1. common vs good */}
      <SectionHeading id="patterns">The common pattern versus a sound architecture</SectionHeading>
      <Paragraph>
        Most advisors in circulation follow the <em>OnTick monolith</em> pattern: one file, all logic —
        signals, risk, execution and journaling mixed inside a single function. The pattern functions
        for simple advisors but degrades as features accumulate: defects enter through hidden state,
        backtesting cannot be separated from execution, and AI has no clean integration point.
      </Paragraph>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-frost/10 bg-obsidian-800/50 p-5">
          <div className="mb-3 flex items-center gap-2 font-mono text-[11px] font-semibold uppercase tracking-wider text-frost-faint">
            <X size={14} className="text-red-400" /> Common pattern: the OnTick monolith
          </div>
          <ul className="flex flex-col gap-2 text-[13px] leading-relaxed text-frost-dim">
            <li>All logic lives inside a single OnTick function</li>
            <li>Global variables without clear ownership</li>
            <li>Signals that also send orders (untestable)</li>
            <li>Risk checks scattered or absent</li>
            <li>Total memory loss on restart</li>
          </ul>
        </div>
        <div className="rounded-2xl border border-electric/25 bg-electric-faint/70 p-5">
          <div className="mb-3 flex items-center gap-2 font-mono text-[11px] font-semibold uppercase tracking-wider text-electric-bright">
            <Check size={14} className="text-emerald-400" /> Sound architecture: layered and event-driven
          </div>
          <ul className="flex flex-col gap-2 text-[13px] leading-relaxed text-frost-dim">
            <li>Layered components with single responsibilities</li>
            <li>Signals as pure functions; execution separated</li>
            <li>A risk manager with <strong className="text-frost">absolute veto rights</strong></li>
            <li>A state machine preventing duplicate execution</li>
            <li>State reconstructed from the market (restart-proof)</li>
          </ul>
        </div>
      </div>

      {/* 2. layer diagram */}
      <SectionHeading id="layered">The layered architecture — select a layer</SectionHeading>
      <div className="relative overflow-hidden rounded-2xl border border-frost/10 bg-obsidian-800/40">
        <div className="pointer-events-none absolute inset-0 opacity-30">
          <Particles quantity={40} opacity={0.3} />
        </div>
        <div className="relative grid gap-4 p-5 lg:grid-cols-[1.1fr_1fr]">
          <div className="flex flex-col gap-2.5">
            {LAYERS.map((layer, i) => (
              <button
                key={layer.id}
                onClick={() => setActiveLayer(layer)}
                className={cn(
                  'group flex items-center gap-3.5 rounded-xl border px-4 py-3 text-left transition',
                  activeLayer.id === layer.id
                    ? 'border-electric/50 bg-electric-faint shadow-[0_12px_40px_-16px_rgba(139,92,246,0.5)]'
                    : 'border-frost/10 bg-obsidian-900/70 hover:border-electric/25'
                )}
              >
                <span className="font-mono text-[10px] text-electric">0{i + 1}</span>
                <layer.icon size={17} className={activeLayer.id === layer.id ? 'text-electric' : 'text-frost-faint'} />
                <div className="min-w-0">
                  <div className={cn('font-display text-[13.5px] font-semibold', activeLayer.id === layer.id ? 'text-frost' : 'text-frost-dim')}>
                    {layer.name}
                  </div>
                </div>
                <ArrowRight size={14} className={cn('ml-auto transition', activeLayer.id === layer.id ? 'text-electric' : 'text-frost/15')} />
              </button>
            ))}
            <div className="mt-1 flex items-center gap-2 rounded-lg border border-dashed border-frost/15 px-4 py-2.5 font-mono text-[10.5px] text-frost-faint">
              <Layers size={12} className="text-electric/60" />
              cross-cutting: configuration (input groups) · logging · state store — shared by all layers
            </div>
          </div>

          <motion.div
            key={activeLayer.id}
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.35 }}
            className="flex flex-col rounded-xl border border-electric/20 bg-obsidian-900/80 p-5"
          >
            <div className="flex items-center gap-2.5">
              <activeLayer.icon size={18} className="text-electric" />
              <h3 className="font-display text-[15px] font-bold text-frost">{activeLayer.name}</h3>
            </div>
            <p className="mt-3 text-[13px] leading-relaxed text-frost-dim">{activeLayer.detail}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {activeLayer.mql.map((m) => (
                <span key={m} className="rounded-md border border-electric/25 bg-electric-faint px-2 py-1 font-mono text-[10.5px] text-electric-bright">
                  {m}
                </span>
              ))}
            </div>
            <p className="mt-auto pt-4 text-[12px] italic leading-relaxed text-amber-300/80">{activeLayer.warn}</p>
          </motion.div>
        </div>
      </div>

      {/* 3. state machine */}
      <SectionHeading id="state-machine">The execution state machine</SectionHeading>
      <Paragraph>
        The core of the execution layer. Every state has explicit exits — the advisor cannot
        "forget" a half-processed entry or send duplicate orders on consecutive ticks. The full
        implementation is in the Object-Oriented Programming topic of the MQL5 section.
      </Paragraph>
      <div className="overflow-x-auto pb-2">
        <div className="flex min-w-max items-center gap-2 rounded-2xl border border-frost/10 bg-obsidian-800/40 p-5">
          {STATES.map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                className={cn(
                  'rounded-lg border px-3 py-2 font-mono text-[11px] font-semibold',
                  s === 'RISK_CHECK' || s === 'ORDER_PENDING'
                    ? 'border-amber-400/30 bg-amber-400/10 text-amber-300'
                    : s === 'MANAGING'
                      ? 'border-emerald-400/30 bg-emerald-400/10 text-emerald-300'
                      : 'border-electric/30 bg-electric-faint text-electric-bright'
                )}
              >
                {s}
              </motion.div>
              {i < STATES.length - 1 && <ArrowRight size={13} className="text-frost/25" />}
            </div>
          ))}
          <ArrowRight size={13} className="text-frost/25" />
          <div className="rounded-lg border border-electric/30 bg-electric-faint px-3 py-2 font-mono text-[11px] font-semibold text-electric-bright">
            IDLE
          </div>
        </div>
      </div>

      {/* 4. folder structure */}
      <SectionHeading id="folder-structure">Modular folder structure</SectionHeading>
      <Paragraph>
        The concrete structure for a serious project: strategy, risk and execution logic as
        separate <code className="inline-code">.mqh</code> modules; the advisor file composes the components.
      </Paragraph>
      <CodeBlock
        flavor="tree"
        title="project-structure.txt"
        code={`MQL5/
├── Experts/
│   └── CodexEA.mq5            # thin orchestrator (~80 lines)
├── Include/
│   └── Codex/
│       ├── Config.mqh          # input groups + validation
│       ├── MarketData.mqh      # handles and tick snapshots (init-once)
│       ├── Signals/
│       │   ├── ISignal.mqh     # interface contract
│       │   ├── MaCross.mqh     # pluggable strategy
│       │   └── PinBar.mqh
│       ├── Risk.mqh            # sizing, drawdown guard, veto
│       ├── Execution/
│       │   ├── Executor.mqh    # CTrade wrapper + retry classification
│       │   └── StateMachine.mqh
│       ├── Journal.mqh         # SQLite + CSV export
│       └── AI/
│           ├── OnnxModel.mqh   # OnnxCreate/Run wrapper
│           └── FeatureBuilder.mqh
└── Files/
    ├── codex_journal.db        # SQLite (read by Python)
    └── direction_model.onnx    # trained model`}
      />

      {/* 5. AI patterns */}
      <SectionHeading id="ai-integration">AI integration — four patterns and their trade-offs</SectionHeading>
      <Paragraph>
        Four ways to connect a model to an advisor, from simplest to most complex. The choice
        is determined by three factors: the tolerable latency, whether the path must be
        backtestable, and the infrastructure burden accepted.
      </Paragraph>

      <div className="grid gap-3 sm:grid-cols-2">
        {AI_PATTERNS.map((p) => (
          <button
            key={p.id}
            onClick={() => setActivePattern(p)}
            className={cn(
              'rounded-xl border p-4 text-left transition',
              activePattern.id === p.id
                ? 'border-electric/50 bg-electric-faint'
                : 'border-frost/10 bg-obsidian-800/50 hover:border-electric/25'
            )}
          >
            <div className="flex items-center gap-2.5">
              <p.icon size={17} className={activePattern.id === p.id ? 'text-electric' : 'text-frost-faint'} />
              <span className="font-display text-[13.5px] font-semibold text-frost">{p.name}</span>
            </div>
            <div className="mt-1.5 font-mono text-[11px] text-frost-faint">{p.tagline}</div>
          </button>
        ))}
      </div>

      <motion.div
        key={activePattern.id}
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="mt-5 overflow-hidden rounded-2xl border border-electric/20 bg-obsidian-800/50"
      >
        <div className="border-b border-frost/10 p-5">
          <div className="flex items-center gap-2.5">
            <activePattern.icon size={18} className="text-electric" />
            <h3 className="font-display text-[15px] font-bold text-frost">{activePattern.name}</h3>
            <span className="ml-auto rounded-md border border-electric/25 bg-electric-faint px-2 py-0.5 font-mono text-[10px] text-electric-bright">
              {activePattern.tagline}
            </span>
          </div>
          <p className="mt-3 text-[13px] leading-relaxed text-frost-dim">{activePattern.desc}</p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <div className="mb-2 font-mono text-[10px] font-semibold uppercase tracking-wider text-emerald-300">Advantages</div>
              <ul className="flex flex-col gap-1.5">
                {activePattern.pros.map((x) => (
                  <li key={x} className="flex items-start gap-2 text-[12.5px] text-frost-dim">
                    <Check size={12} className="mt-1 shrink-0 text-emerald-400" /> {x}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <div className="mb-2 font-mono text-[10px] font-semibold uppercase tracking-wider text-red-300">Disadvantages</div>
              <ul className="flex flex-col gap-1.5">
                {activePattern.cons.map((x) => (
                  <li key={x} className="flex items-start gap-2 text-[12.5px] text-frost-dim">
                    <X size={12} className="mt-1 shrink-0 text-red-400" /> {x}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <p className="mt-4 rounded-lg border border-electric/20 bg-electric-faint px-3 py-2 text-[12.5px] text-frost-dim">
            <strong className="text-electric-bright">Applicability:</strong> {activePattern.when}
          </p>
        </div>
        {activePattern.code && (
          <div className="p-4">
            <CodeBlock code={activePattern.code} flavor={activePattern.flavor} title={`pattern-${activePattern.id}.mq5`} />
          </div>
        )}
      </motion.div>

      {/* 6. recommendation */}
      <SectionHeading id="recommendation">Recommended architecture</SectionHeading>
      <Paragraph>
        For most modern AI-based trading systems, the combination with the highest return is a{' '}
        <strong className="text-frost">hybrid of native ONNX and an offline Python pipeline</strong>:
      </Paragraph>
      <div className="mb-6 overflow-hidden rounded-2xl border border-frost/10">
        <div className="grid gap-px bg-frost/5 md:grid-cols-3">
          {[
            {
              icon: Brain,
              t: 'Inference: native ONNX',
              d: 'A small model embedded in the advisor (pattern 2). Per-bar prediction identical in the Strategy Tester and live. No server to maintain.'
            },
            {
              icon: Database,
              t: 'Data and training: offline Python',
              d: 'The advisor writes an SQLite journal; the Python pipeline reads it, engineers features, trains, runs walk-forward validation and exports a new .onnx. The cycle never touches the trading terminal.'
            },
            {
              icon: Rocket,
              t: 'Escalation: REST where necessary',
              d: 'Large models and ensembles are reserved for research via WebRequest (pattern 1) and never run on the live execution path. Production always uses validated ONNX.'
            }
          ].map((c) => (
            <div key={c.t} className="bg-obsidian-900/80 p-5">
              <c.icon size={17} className="text-electric" />
              <div className="mt-2.5 font-display text-[13.5px] font-semibold text-frost">{c.t}</div>
              <p className="mt-1.5 text-[12.5px] leading-relaxed text-frost-dim">{c.d}</p>
            </div>
          ))}
        </div>
      </div>

      <Callout type="tip" title="Architecture quality checklist">
        A system qualifies as well-architected when: (1) signals can be tested without orders,
        (2) the risk manager can veto any signal, (3) a restart does not change behavior,
        (4) every execution decision is recorded, and (5) replacing a strategy does not touch
        execution code. Failing any one of these indicates a required refactor before adding features.
      </Callout>
    </div>
  )
}
