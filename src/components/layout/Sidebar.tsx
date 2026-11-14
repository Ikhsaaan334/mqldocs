import { NavLink } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ChevronRight } from 'lucide-react'
import { NAV_GROUPS } from '@/data/nav'
import { cn } from '@/lib/utils'

export default function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <nav data-lenis-prevent className="flex h-full flex-col gap-1 overflow-y-auto px-4 pb-8 pt-5">
      {NAV_GROUPS.map((group) => (
        <div key={group.label} className="mb-3">
          <div className="px-3 pb-1.5 font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-frost-faint">
            {group.label}
          </div>
          <div className="flex flex-col gap-px">
            {group.items.map((item) => {
              const isTopic = Boolean(item.topicId)
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={onNavigate}
                  className={({ isActive }) =>
                    cn(
                      'group relative flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[13px] transition-colors',
                      isTopic && 'pl-5',
                      isActive
                        ? 'bg-electric-faint text-electric-bright'
                        : 'text-frost-dim hover:bg-frost/5 hover:text-frost'
                    )
                  }
                >
                  {({ isActive }) => (
                    <>
                      {isActive && (
                        <motion.span
                          layoutId="sidebar-indicator"
                          className="absolute left-0 top-1/2 h-4 w-[3px] -translate-y-1/2 rounded-full bg-electric"
                        />
                      )}
                      {isTopic && (
                        <ChevronRight
                          size={12}
                          className={cn('shrink-0 transition-transform group-hover:translate-x-0.5', isActive ? 'text-electric' : 'text-frost-faint')}
                        />
                      )}
                      <span className="truncate">{item.label}</span>
                    </>
                  )}
                </NavLink>
              )
            })}
          </div>
        </div>
      ))}
    </nav>
  )
}
