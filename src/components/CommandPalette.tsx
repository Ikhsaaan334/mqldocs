import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Search, CornerDownLeft, ArrowUp, ArrowDown } from 'lucide-react'
import { searchItems, type SearchItem } from '@/data/searchIndex'
import { cn } from '@/lib/utils'

interface CommandPaletteProps {
  open: boolean
  onClose: () => void
}

export default function CommandPalette({ open, onClose }: CommandPaletteProps) {
  const [query, setQuery] = useState('')
  const [active, setActive] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const navigate = useNavigate()

  const results = useMemo(() => searchItems(query), [query])

  useEffect(() => {
    if (open) {
      setQuery('')
      setActive(0)
      requestAnimationFrame(() => inputRef.current?.focus())
    }
  }, [open])

  useEffect(() => setActive(0), [query])

  const go = (item: SearchItem) => {
    navigate(item.path)
    onClose()
  }

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') onClose()
    else if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActive((a) => Math.min(a + 1, results.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActive((a) => Math.max(a - 1, 0))
    } else if (e.key === 'Enter' && results[active]) {
      go(results[active])
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[80] flex items-start justify-center bg-black/60 px-4 pt-[12vh] backdrop-blur-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="w-full max-w-xl overflow-hidden rounded-2xl border border-electric/25 bg-obsidian-900 shadow-[0_40px_120px_-20px_rgba(139,92,246,0.4)]"
            initial={{ scale: 0.96, y: -12, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.96, y: -12, opacity: 0 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 border-b border-frost/10 px-4 py-3.5">
              <Search size={16} className="shrink-0 text-electric" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={onKeyDown}
                placeholder="Search topics, functions, concepts… (e.g. OrderSend, handle, AI architecture)"
                className="w-full bg-transparent font-mono text-sm text-frost placeholder:text-frost-faint focus:outline-none"
              />
              <kbd className="shrink-0 rounded border border-frost/15 bg-obsidian-700 px-1.5 py-0.5 font-mono text-[10px] text-frost-faint">esc</kbd>
            </div>

            <div data-lenis-prevent className="max-h-[46vh] overflow-y-auto p-2">
              {results.length === 0 && (
                <div className="px-3 py-10 text-center text-sm text-frost-faint">
                  No results for “{query}”
                </div>
              )}
              {results.map((item, i) => (
                <button
                  key={item.path}
                  onClick={() => go(item)}
                  onMouseEnter={() => setActive(i)}
                  className={cn(
                    'flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors',
                    i === active ? 'bg-electric-faint ring-1 ring-electric/25' : 'hover:bg-frost/5'
                  )}
                >
                  <span
                    className={cn(
                      'rounded-md border px-1.5 py-0.5 font-mono text-[9px] font-semibold uppercase tracking-wider',
                      item.section === 'mql5'
                        ? 'border-electric/30 bg-electric/10 text-electric-bright'
                        : item.section === 'mql4'
                          ? 'border-frost/15 bg-frost/5 text-frost-dim'
                          : 'border-frost/15 bg-frost/5 text-frost-faint'
                    )}
                  >
                    {item.group}
                  </span>
                  <span className={cn('truncate text-[13.5px]', i === active ? 'text-frost' : 'text-frost-dim')}>
                    {item.title}
                  </span>
                  {i === active && <CornerDownLeft size={13} className="ml-auto shrink-0 text-electric" />}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-4 border-t border-frost/10 px-4 py-2.5 font-mono text-[10px] text-frost-faint">
              <span className="flex items-center gap-1"><ArrowUp size={10} /><ArrowDown size={10} /> navigate</span>
              <span className="flex items-center gap-1"><CornerDownLeft size={10} /> open</span>
              <span className="ml-auto">MQL Docs search</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
