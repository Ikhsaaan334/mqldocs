import { Link, useLocation } from 'react-router-dom'
import { Menu, Search, Terminal } from 'lucide-react'

interface TopbarProps {
  onOpenMenu: () => void
  onOpenSearch: () => void
}

export default function Topbar({ onOpenMenu, onOpenSearch }: TopbarProps) {
  const { pathname } = useLocation()

  return (
    <header className="sticky top-0 z-30 border-b border-frost/8 bg-obsidian-950/80 backdrop-blur-xl">
      <div className="flex h-14 items-center gap-3 px-4 lg:px-8">
        <button
          onClick={onOpenMenu}
          className="rounded-lg border border-frost/10 bg-frost/5 p-2 text-frost-dim transition hover:text-frost lg:hidden"
          aria-label="Open menu"
        >
          <Menu size={16} />
        </button>

        <Link to="/" className="flex items-center gap-2.5 lg:hidden">
          <Terminal size={16} className="text-electric" />
          <span className="font-display text-sm font-bold">MQL Docs</span>
        </Link>

        <div className="hidden items-center gap-2 font-mono text-xs text-frost-faint lg:flex">
          <span>mql-docs</span>
          <span className="text-frost/20">/</span>
          <span className="text-frost-dim">{pathname === '/' ? 'home' : pathname.slice(1)}</span>
        </div>

        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={onOpenSearch}
            className="flex items-center gap-2 rounded-lg border border-frost/10 bg-frost/5 px-3 py-1.5 text-xs text-frost-dim transition hover:border-electric/40 hover:text-frost"
          >
            <Search size={13} />
            <span className="hidden sm:inline">Search the reference…</span>
            <kbd className="hidden rounded border border-frost/15 bg-obsidian-700 px-1.5 py-0.5 font-mono text-[10px] sm:inline">
              Ctrl K
            </kbd>
          </button>
        </div>
      </div>
    </header>
  )
}
