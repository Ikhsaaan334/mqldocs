import type { RoadmapStage } from './types'

export const ROADMAP: RoadmapStage[] = [
  {
    id: 'stage-0',
    title: 'Foundations',
    desc: 'What MQL is, the program types, and the MQL4 versus MQL5 landscape before writing code.',
    items: [
      { label: 'Read: MQL4 vs MQL5 — platform selection', path: '/perbandingan' },
      { label: 'Read: the full difference table (syntax and concepts)', path: '/perbandingan' },
      { label: 'Choose a learning platform: MQL4 (gentler) or MQL5 directly (the forward direction)' }
    ]
  },
  {
    id: 'stage-1',
    title: 'MQL4 Fundamentals',
    desc: 'Program structure, data types and control flow — the mental model of the language.',
    items: [
      { label: 'Program Structure and Event Handlers', section: 'mql4', topicId: 'struktur-program', path: '/mql4/struktur-program' },
      { label: 'Data Types and Variables', section: 'mql4', topicId: 'tipe-data-variabel', path: '/mql4/tipe-data-variabel' },
      { label: 'Operators and Control Flow', section: 'mql4', topicId: 'operator-kontrol', path: '/mql4/operator-kontrol' },
      { label: 'Functions and the Preprocessor', section: 'mql4', topicId: 'fungsi-preprocessor', path: '/mql4/fungsi-preprocessor' },
      { label: 'Arrays and Strings', section: 'mql4', topicId: 'array-string', path: '/mql4/array-string' }
    ]
  },
  {
    id: 'stage-2',
    title: 'A First MQL4 Advisor',
    desc: 'From signal to order: execution, market information, time control and error handling.',
    items: [
      { label: 'Trading Functions (OrderSend and related)', section: 'mql4', topicId: 'order-trading', path: '/mql4/order-trading' },
      { label: 'Technical Indicators and iCustom', section: 'mql4', topicId: 'indikator-teknikal', path: '/mql4/indikator-teknikal' },
      { label: 'Account and Market Information', section: 'mql4', topicId: 'account-market-info', path: '/mql4/account-market-info' },
      { label: 'Date, Time and Timers', section: 'mql4', topicId: 'datetime-timer', path: '/mql4/datetime-timer' },
      { label: 'Error Handling and Recovery', section: 'mql4', topicId: 'error-handling', path: '/mql4/error-handling' }
    ]
  },
  {
    id: 'stage-3',
    title: 'Quality and Performance',
    desc: 'Making an MQL4 advisor production-grade: performance patterns and the pitfalls to avoid.',
    items: [
      { label: 'Performance Patterns in MQL4', section: 'mql4', topicId: 'tips-efisiensi', path: '/mql4/tips-efisiensi' },
      { label: 'Pitfalls: repaint, loop direction, magic numbers', path: '/pitfalls' },
      { label: 'MQL4 Quick Reference', path: '/cheatsheet' }
    ]
  },
  {
    id: 'stage-4',
    title: 'MQL5 Fundamentals and the Mental Shift',
    desc: 'The two concepts that must be learned first: handles plus CopyBuffer, and the position model.',
    items: [
      { label: 'Program Structure and Event Model', section: 'mql5', topicId: 'struktur-program', path: '/mql5/struktur-program' },
      { label: 'Data Types and Strict Typing', section: 'mql5', topicId: 'tipe-data', path: '/mql5/tipe-data' },
      { label: 'Handle-Based Indicators', section: 'mql5', topicId: 'indikator-handle', path: '/mql5/indikator-handle' },
      { label: 'Trading: Positions, Orders and CTrade', section: 'mql5', topicId: 'trading', path: '/mql5/trading' },
      { label: 'Timeseries and Data Access', section: 'mql5', topicId: 'timeseries', path: '/mql5/timeseries' }
    ]
  },
  {
    id: 'stage-5',
    title: 'Modern MQL5: OOP and the Library',
    desc: 'Writing systems rather than scripts: classes, the Standard Library and advanced events.',
    items: [
      { label: 'Object-Oriented Programming: Classes, Interfaces, State Machines', section: 'mql5', topicId: 'oop', path: '/mql5/oop' },
      { label: 'Standard Library (CTrade and related)', section: 'mql5', topicId: 'standard-library', path: '/mql5/standard-library' },
      { label: 'Advanced Event Model (OnTradeTransaction, panels)', section: 'mql5', topicId: 'event-model', path: '/mql5/event-model' }
    ]
  },
  {
    id: 'stage-6',
    title: 'Research, Architecture and AI',
    desc: 'Production level: sound backtesting, layered architecture and machine learning integration.',
    items: [
      { label: 'Strategy Tester and Anti-Overfitting', section: 'mql5', topicId: 'strategy-tester', path: '/mql5/strategy-tester' },
      { label: 'ONNX and Native Machine Learning', section: 'mql5', topicId: 'onnx-ml', path: '/mql5/onnx-ml' },
      { label: 'Database and File I/O (SQLite journals)', section: 'mql5', topicId: 'database-file', path: '/mql5/database-file' },
      { label: 'Application Architecture and AI Integration Patterns', path: '/arsitektur' },
      { label: 'MQL4 to MQL5 Migration Table', path: '/migrasi' }
    ]
  }
]
