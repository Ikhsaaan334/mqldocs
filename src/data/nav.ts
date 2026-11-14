import { MQL4_TOPICS } from './mql4'
import { MQL5_TOPICS } from './mql5'

export interface NavItem {
  label: string
  path: string
  topicId?: string
  section?: 'mql4' | 'mql5'
}

export interface NavGroup {
  label: string
  items: NavItem[]
}

export const NAV_GROUPS: NavGroup[] = [
  {
    label: 'Getting Started',
    items: [
      { label: 'Home', path: '/' },
      { label: 'MQL4 vs MQL5', path: '/perbandingan' },
      { label: 'Roadmap', path: '/learning-path' }
    ]
  },
  {
    label: 'MQL4 Reference',
    items: [
      { label: 'MQL4 Overview', path: '/mql4' },
      ...MQL4_TOPICS.map((t) => ({ label: t.title, path: `/mql4/${t.id}`, topicId: t.id, section: 'mql4' as const }))
    ]
  },
  {
    label: 'MQL5 Reference',
    items: [
      { label: 'MQL5 Overview', path: '/mql5' },
      ...MQL5_TOPICS.map((t) => ({ label: t.title, path: `/mql5/${t.id}`, topicId: t.id, section: 'mql5' as const }))
    ]
  },
  {
    label: 'Advanced Topics',
    items: [
      { label: 'Architecture and AI', path: '/arsitektur' },
      { label: 'MQL4 to MQL5 Migration', path: '/migrasi' },
      { label: 'Pitfalls and Best Practices', path: '/pitfalls' },
      { label: 'Quick Reference', path: '/cheatsheet' }
    ]
  }
]
