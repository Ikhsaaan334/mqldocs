import { useEffect, useState } from 'react'
import { Check, Copy } from 'lucide-react'
import { highlightMQL, type CodeFlavor } from '@/lib/highlight'

interface CodeBlockProps {
  code: string
  flavor?: CodeFlavor
  title?: string
  className?: string
}

/**
 * Panel kode premium: header (filename + badge MQL4/MQL5), highlight Shiki,
 * dan tombol copy dengan umpan balik visual.
 */
export default function CodeBlock({ code, flavor = 'mql5', title, className = '' }: CodeBlockProps) {
  const [html, setHtml] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    let alive = true
    highlightMQL(code, flavor)
      .then((h) => {
        if (alive) setHtml(h)
      })
      .catch(() => {
        if (alive) setHtml(null)
        /* fallback ke <pre> polos di bawah */
      })
    return () => {
      alive = false
    }
  }, [code, flavor])

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1600)
    } catch {
      /* clipboard tidak tersedia */
    }
  }

  const badgeColor =
    flavor === 'mql4'
      ? 'text-frost-dim border-frost/15 bg-frost/5'
      : flavor === 'mql5'
        ? 'text-electric-bright border-electric/30 bg-electric/10'
        : 'text-frost-dim border-frost/15 bg-frost/5'

  return (
    <div
      className={`code-shell overflow-hidden rounded-xl border border-frost/10 bg-obsidian-900/90 shadow-[0_16px_48px_-24px_rgba(139,92,246,0.25)] ${className}`}
    >
      <div className="flex items-center justify-between gap-3 border-b border-frost/10 bg-obsidian-800/70 px-4 py-2">
        <div className="flex min-w-0 items-center gap-2.5">
          <span className="flex gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-frost/10" />
            <span className="h-2.5 w-2.5 rounded-full bg-frost/10" />
            <span className="h-2.5 w-2.5 rounded-full bg-electric/40" />
          </span>
          {title && (
            <span className="truncate font-mono text-xs text-frost-dim">{title}</span>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {(flavor === 'mql4' || flavor === 'mql5') && (
            <span
              className={`rounded-md border px-1.5 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider ${badgeColor}`}
            >
              {flavor}
          </span>
          )}
          <button
            onClick={copy}
            className="rounded-md border border-frost/10 bg-frost/5 p-1.5 text-frost-dim transition hover:border-electric/40 hover:text-electric-bright"
            title="Copy code"
            aria-label="Copy code"
          >
            {copied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
          </button>
        </div>
      </div>
      {html ? (
        <div dangerouslySetInnerHTML={{ __html: html }} />
      ) : (
        <pre className="code-shell" style={{ padding: '1.15rem 1.35rem' }}>
          <code className="font-mono text-[13.5px] leading-relaxed text-frost-dim">{code}</code>
        </pre>
      )}
    </div>
  )
}
