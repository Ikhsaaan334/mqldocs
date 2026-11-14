import { MQL4_TOPICS } from './mql4'
import { MQL5_TOPICS } from './mql5'

export interface SearchItem {
  title: string
  path: string
  group: string
  keywords: string
  section?: 'mql4' | 'mql5'
}

const STATIC_ITEMS: SearchItem[] = [
  { title: 'Home', path: '/', group: 'Getting Started', keywords: 'home index introduction start' },
  { title: 'MQL4 vs MQL5 — Comparison', path: '/perbandingan', group: 'Getting Started', keywords: 'comparison compare difference selection which platform versus' },
  { title: 'Roadmap', path: '/learning-path', group: 'Getting Started', keywords: 'roadmap learning path stages structure order' },
  { title: 'Application Architecture and AI Integration', path: '/arsitektur', group: 'Advanced Topics', keywords: 'architecture layered state machine ai machine learning onnx webrequest python socket pattern integration' },
  { title: 'MQL4 to MQL5 Migration', path: '/migrasi', group: 'Advanced Topics', keywords: 'migration mapping conversion convert porting table' },
  { title: 'Pitfalls and Best Practices', path: '/pitfalls', group: 'Advanced Topics', keywords: 'pitfall bug best practice overfit repaint memory leak magic number error' },
  { title: 'Quick Reference', path: '/cheatsheet', group: 'Advanced Topics', keywords: 'cheatsheet quick reference function signature api' }
]

const TOPIC_ITEMS: SearchItem[] = [
  ...MQL4_TOPICS.map((t) => ({
    title: `MQL4 · ${t.title}`,
    path: `/mql4/${t.id}`,
    group: 'MQL4 Reference',
    keywords: `${t.title} ${t.subtitle} ${t.keywords}`.toLowerCase(),
    section: 'mql4' as const
  })),
  ...MQL5_TOPICS.map((t) => ({
    title: `MQL5 · ${t.title}`,
    path: `/mql5/${t.id}`,
    group: 'MQL5 Reference',
    keywords: `${t.title} ${t.subtitle} ${t.keywords}`.toLowerCase(),
    section: 'mql5' as const
  }))
]

export const SEARCH_INDEX: SearchItem[] = [...STATIC_ITEMS, ...TOPIC_ITEMS]

export function searchItems(query: string): SearchItem[] {
  const q = query.trim().toLowerCase()
  if (!q) return SEARCH_INDEX.slice(0, 9)
  const tokens = q.split(/\s+/)
  const scored = SEARCH_INDEX.map((item) => {
    const haystack = `${item.title} ${item.keywords}`.toLowerCase()
    let score = 0
    for (const token of tokens) {
      if (item.title.toLowerCase().includes(token)) score += 3
      if (haystack.includes(token)) score += 1
    }
    return { item, score }
  })
  return scored
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 12)
    .map((s) => s.item)
}
