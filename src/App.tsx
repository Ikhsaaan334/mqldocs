import { useEffect, useState } from 'react'
import { Routes, Route, useLocation, Navigate } from 'react-router-dom'
import { preloadHighlighter } from '@/lib/highlight'
import { initSmoothScroll, scrollToTopImmediate } from '@/lib/smoothScroll'
import DocsLayout from '@/components/layout/DocsLayout'
import CommandPalette from '@/components/CommandPalette'
import Home from '@/pages/Home'
import Comparison from '@/pages/Comparison'
import SectionOverview from '@/pages/SectionOverview'
import TopicPage from '@/pages/TopicPage'
import Architecture from '@/pages/Architecture'
import Migration from '@/pages/Migration'
import CheatSheet from '@/pages/CheatSheet'
import LearningPath from '@/pages/LearningPath'
import Pitfalls from '@/pages/Pitfalls'
import NotFound from '@/pages/NotFound'

function ScrollManager() {
  const { pathname } = useLocation()
  useEffect(() => {
    scrollToTopImmediate()
  }, [pathname])
  return null
}

export default function App() {
  const [searchOpen, setSearchOpen] = useState(false)
  const { pathname } = useLocation()
  const isHome = pathname === '/'

  // global Ctrl+K
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setSearchOpen((o) => !o)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  // Lenis smooth scrolling
  useEffect(() => {
    initSmoothScroll()
  }, [])

  // prefetch shiki while idle so topics open instantly
  useEffect(() => {
    const idle = window.setTimeout(() => preloadHighlighter(), 1200)
    return () => window.clearTimeout(idle)
  }, [])

  return (
    <>
      <ScrollManager />
      {isHome ? (
        <Routes>
          <Route path="/" element={<Home />} />
        </Routes>
      ) : (
        <DocsLayout onOpenSearch={() => setSearchOpen(true)}>
          <Routes>
            <Route path="/perbandingan" element={<Comparison />} />
            <Route path="/learning-path" element={<LearningPath />} />
            <Route path="/arsitektur" element={<Architecture />} />
            <Route path="/migrasi" element={<Migration />} />
            <Route path="/cheatsheet" element={<CheatSheet />} />
            <Route path="/pitfalls" element={<Pitfalls />} />
            <Route path="/:section" element={<SectionOverview />} />
            <Route path="/:section/:topicId" element={<TopicPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </DocsLayout>
      )}
      <CommandPalette open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  )
}
