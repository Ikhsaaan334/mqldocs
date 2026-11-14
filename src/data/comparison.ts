import type { CompareRow } from './types'

export const COMPARE_ROWS: CompareRow[] = [
  {
    aspect: 'Language paradigm',
    category: 'concepts',
    mql4: 'Procedural; basic OOP available after later updates, rarely used by the ecosystem',
    mql5: 'Full OOP: classes, interfaces, inheritance, object pointers, and an extensive Standard Library',
    note: 'Large systems (multi-strategy, portfolio) are substantially easier to structure in MQL5.'
  },
  {
    aspect: 'Indicator access',
    category: 'syntax',
    mql4: 'Direct values: iMA(NULL,0,20,0,MODE_EMA,PRICE_CLOSE,1)',
    mql5: 'Handle plus CopyBuffer: handle = iMA(...); CopyBuffer(handle,0,1,2,buf)',
    note: 'The MQL5 model is asynchronous and shared by the terminal — more efficient for multi-timeframe and multi-symbol use.'
  },
  {
    aspect: 'Order and position model',
    category: 'concepts',
    mql4: 'A single "order" concept: market and pending orders share one function family, each order has one ticket',
    mql5: 'POSITIONS (active exposure) are separated from ORDERS (market/pending requests)',
    note: 'On netting accounts, opposing orders close the position; on hedging accounts they coexist.'
  },
  {
    aspect: 'Core trading functions',
    category: 'syntax',
    mql4: 'OrderSend / OrderSelect / OrderModify / OrderClose',
    mql5: 'CTrade.Buy/Sell/PositionClose/PositionModify plus MqlTradeRequest for full control',
    note: 'CTrade with ResultRetcodeDescription considerably accelerates execution debugging.'
  },
  {
    aspect: 'Real-time price access',
    category: 'syntax',
    mql4: 'Predefined variables: Bid, Ask, Point, Digits (with RefreshRates)',
    mql5: 'MqlTick via SymbolInfoTick — an atomic bid/ask/last/volume/ms snapshot',
    note: 'The atomic MQL5 snapshot guarantees bid and ask originate from the same tick.'
  },
  {
    aspect: 'Backtest quality',
    category: 'concepts',
    mql4: 'Tick model interpolated from candles — adequate for per-bar strategies',
    mql5: '"Every tick based on real ticks" from broker tick data, with configurable delay and spread',
    note: 'For serious research (scalping, tight stops), real ticks change backtest conclusions.'
  },
  {
    aspect: 'Multi-symbol backtesting',
    category: 'concepts',
    mql4: 'One symbol per run; portfolios tested manually, run by run',
    mql5: 'Multiple symbols in a single run — margin and exposure interactions are tested together',
    note: 'Portfolio advisors can only be validated properly in the MT5 tester.'
  },
  {
    aspect: 'Event model',
    category: 'syntax',
    mql4: 'OnInit, OnTick, OnDeinit, OnTimer, limited OnChartEvent',
    mql5: 'Adds OnTrade, OnTradeTransaction, OnTester and full OnChartEvent (clicks, keyboard, custom events)',
    note: 'OnTradeTransaction enables reaction to executions without polling; OnTester enables custom optimization scores.'
  },
  {
    aspect: 'AI and machine learning',
    category: 'ecosystem',
    mql4: 'External paths only: WebRequest to a Python server, DLLs, or CSV files',
    mql5: 'Native ONNX runtime: OnnxCreate/OnnxRun inside the advisor — no server, backtestable',
    note: 'This is the largest functional gap; MQL5 is effectively required when ML is central to the product.'
  },
  {
    aspect: 'Data persistence',
    category: 'ecosystem',
    mql4: 'Files (CSV/TXT/BIN) and GlobalVariables',
    mql5: 'Built-in SQLite (DatabaseOpen/Prepare/Read) plus files and embedded resources',
    note: 'An SQL journal is directly readable from Python — the smoothest data bridge.'
  },
  {
    aspect: 'Typing strictness',
    category: 'syntax',
    mql4: 'Loose by default (except under #property strict); implicit conversions often pass',
    mql5: 'Strict by default: ambiguous conversions produce warnings or errors; official enums across the API',
    note: 'The MQL5 compiler removes most type defects before runtime.'
  },
  {
    aspect: 'Broker support and direction',
    category: 'ecosystem',
    mql4: 'MT4 remains in use at retail and legacy brokers, but platform development has stopped',
    mql5: 'MT5 is the official MetaQuotes direction; major and institutional brokers onboard on MT5',
    note: 'New accounts at major brokers are generally MT5.'
  },
  {
    aspect: 'Ecosystem and legacy code',
    category: 'ecosystem',
    mql4: 'Fifteen years of advisors and indicators — the largest body of reference code',
    mql5: 'An active MQL5 Market, modern documentation, and the central research and freelance community',
    note: 'Learning from MQL4 code remains easy; maintaining new production advisors is healthier on MQL5.'
  },
  {
    aspect: 'Learning curve',
    category: 'concepts',
    mql4: 'Gentler: direct indicator values, a single order model, abundant tutorials',
    mql5: 'Comparable once two concepts are mastered: handle plus CopyBuffer, and the position model',
    note: 'A practical path: learn fundamentals through MQL4-style code, build new projects on MQL5.'
  }
]

export const VERDICT_MQL4 = {
  title: 'Choose MQL4 when',
  items: [
    'The broker or client is bound to MT4 accounts and migration to MT5 is not an option',
    'Maintaining or extending legacy advisors that have run for years',
    'A shared codebase and tooling within an MQL4-based organization',
    'The strategy is per-bar and single-symbol, where interpolated backtests remain adequate'
  ]
}

export const VERDICT_MQL5 = {
  title: 'Choose MQL5 when',
  items: [
    'Starting a new project — there is no technical reason to choose a platform no longer in development',
    'Serious backtesting is required: real ticks, configurable spread and delay, custom optimization scores (OnTester)',
    'The advisor is multi-symbol or multi-timeframe within one program',
    'AI integration is planned: native ONNX inference and an SQLite journal readable by Python pipelines',
    'OOP is required for large systems: pluggable signal engines, state machines, panel UIs',
    'A commercial product for the MQL5 Market is the target'
  ]
}
