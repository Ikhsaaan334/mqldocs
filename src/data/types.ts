export type Lang = 'mql4' | 'mql5'

export interface TopicPoint {
  label: string
  desc: string
}

export interface TopicTip {
  title: string
  desc: string
  code?: string
}

export interface Topic {
  id: string
  title: string
  subtitle: string
  icon: string
  keywords: string
  syntax: {
    intro: string
    points: TopicPoint[]
    code?: string
    codeTitle?: string
  }
  useCase: {
    intro: string
    items: { when: string; why: string }[]
  }
  efficiency: {
    intro: string
    tips: TopicTip[]
  }
  example: {
    title: string
    code: string
    explanation: string[]
    flavor?: 'mql4' | 'mql5' | 'python' | 'mixed'
  }
}

export interface CompareRow {
  aspect: string
  category: 'syntax' | 'concepts' | 'ecosystem'
  mql4: string
  mql5: string
  note?: string
}

export interface MigrationRow {
  category: 'Trading' | 'Indicators' | 'Data & Time' | 'Information' | 'Other'
  previous: string
  current: string
  note: string
}

export interface Pitfall {
  id: string
  severity: 'Critical' | 'Moderate' | 'Subtle'
  title: string
  symptom: string
  cause: string
  resolution: string
  code?: { bad?: string; good?: string; flavor: Lang }
}

export interface RoadmapStage {
  id: string
  title: string
  desc: string
  items: { label: string; path?: string; topicId?: string; section?: 'mql4' | 'mql5' }[]
}

export interface CheatCategory {
  category: string
  icon: string
  rows: { signature: string; desc: string }[]
}
