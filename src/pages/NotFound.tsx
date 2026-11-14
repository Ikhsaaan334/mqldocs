import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
      <div className="font-mono text-7xl font-bold text-gradient">404</div>
      <p className="mt-4 max-w-sm text-[14px] leading-relaxed text-frost-dim">
        The requested page does not exist. The topic may not be documented, or the URL is incorrect.
      </p>
      <Link
        to="/"
        className="mt-7 flex items-center gap-2 rounded-xl bg-electric px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-electric-soft"
      >
        <ArrowLeft size={15} /> Return to the index
      </Link>
    </div>
  )
}
