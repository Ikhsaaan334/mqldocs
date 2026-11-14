import { useEffect, useState } from 'react'
import { Outlet } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'
import GhostFibers from '@/components/reactbits/GhostFibers'
import Sidebar from './Sidebar'
import Topbar from './Topbar'
import TableOfContents from './TableOfContents'

interface DocsLayoutProps {
  onOpenSearch: () => void
  children?: React.ReactNode
}

export default function DocsLayout({ onOpenSearch, children }: DocsLayoutProps) {
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [menuOpen])

  return (
    <div className="min-h-screen bg-obsidian-950">
      {/* Fiber background full halaman — blur moderat agar warna tetap terlihat
          namun detailnya halus dan tidak bersaing dengan konten.
          dpr={1}: piksel seperempat, cukup karena hasilnya diblur. */}
      <div className="fixed inset-0 z-0 overflow-hidden" aria-hidden="true">
        <div
          className="absolute -inset-24"
          style={{ filter: 'blur(28px) saturate(1.2)', opacity: 0.8, transform: 'scale(1.04)' }}
        >
          <GhostFibers
            glowColor="#8B5CF6"
            secondaryColor="#6D28D9"
            speed={0.4}
            brightness={1.0}
            vignette={0}
            grain={0}
            dpr={1}
          />
        </div>
        <div className="absolute inset-0 bg-obsidian-950/35" />
      </div>
      <div className="relative z-10">
      {/* Sidebar desktop */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r border-frost/8 bg-obsidian-900/60 lg:block">
        <div className="flex h-full flex-col">
          <BrandHeader />
          <Sidebar />
        </div>
      </aside>

      {/* Sidebar mobile */}
      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.div
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMenuOpen(false)}
            />
            <motion.aside
              className="fixed inset-y-0 left-0 z-50 w-72 border-r border-frost/10 bg-obsidian-900 lg:hidden"
              initial={{ x: -320 }}
              animate={{ x: 0 }}
              exit={{ x: -320 }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            >
              <div className="flex h-full flex-col">
                <div className="flex items-center justify-between pr-3">
                  <BrandHeader />
                  <button
                    onClick={() => setMenuOpen(false)}
                    className="rounded-lg border border-frost/10 bg-frost/5 p-2 text-frost-dim"
                    aria-label="Tutup menu"
                  >
                    <X size={15} />
                  </button>
                </div>
                <Sidebar onNavigate={() => setMenuOpen(false)} />
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Konten */}
      <div className="lg:pl-64">
        <Topbar onOpenMenu={() => setMenuOpen(true)} onOpenSearch={onOpenSearch} />
        <div className="mx-auto flex max-w-[1400px] gap-8 px-4 lg:px-8">
          <main className="min-w-0 flex-1 py-10 lg:py-12">
            <article className="mx-auto max-w-3xl">
              {children ?? <Outlet />}
            </article>
          </main>
          <TableOfContents />
        </div>
      </div>
      </div>
    </div>
  )
}

function BrandHeader() {
  return (
    <div className="px-5 pb-3 pt-6">
      <div className="font-display text-xl font-bold tracking-tight text-frost">MQL Docs</div>
    </div>
  )
}
