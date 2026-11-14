import { Link } from 'react-router-dom'
import { Terminal } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="relative mt-24 border-t border-frost/8">
      <div className="mx-auto max-w-6xl px-6 py-14">
        <div className="flex flex-col gap-10 md:flex-row md:justify-between">
          <div className="max-w-sm">
            <div className="flex items-center gap-2.5">
              <Terminal size={18} className="text-electric" />
              <span className="font-display text-base font-bold">MQL Docs</span>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-frost-dim">
              A structured reference for the MQL4 and MQL5 languages: syntax, usage,
              performance considerations, and the architecture of AI-integrated trading
              systems.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-10 sm:grid-cols-3">
            <div>
              <div className="pb-3 font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-frost-faint">
                Reference
              </div>
              <div className="flex flex-col gap-2 text-sm">
                <Link className="link-underline w-fit text-frost-dim hover:text-frost" to="/mql4">MQL4 Section</Link>
                <Link className="link-underline w-fit text-frost-dim hover:text-frost" to="/mql5">MQL5 Section</Link>
                <Link className="link-underline w-fit text-frost-dim hover:text-frost" to="/learning-path">Roadmap</Link>
              </div>
            </div>
            <div>
              <div className="pb-3 font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-frost-faint">
                Guides
              </div>
              <div className="flex flex-col gap-2 text-sm">
                <Link className="link-underline w-fit text-frost-dim hover:text-frost" to="/perbandingan">MQL4 vs MQL5</Link>
                <Link className="link-underline w-fit text-frost-dim hover:text-frost" to="/migrasi">Migration</Link>
                <Link className="link-underline w-fit text-frost-dim hover:text-frost" to="/cheatsheet">Quick Reference</Link>
              </div>
            </div>
            <div>
              <div className="pb-3 font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-frost-faint">
                Advanced
              </div>
              <div className="flex flex-col gap-2 text-sm">
                <Link className="link-underline w-fit text-frost-dim hover:text-frost" to="/arsitektur">Architecture and AI</Link>
                <Link className="link-underline w-fit text-frost-dim hover:text-frost" to="/pitfalls">Pitfalls</Link>
              </div>
            </div>
          </div>
        </div>

      </div>
    </footer>
  )
}
