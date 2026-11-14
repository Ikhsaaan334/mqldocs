import { createHighlighterCore, type HighlighterCore, type LanguageInput, type ThemeInput } from 'shiki/core'
import { createOnigurumaEngine } from 'shiki/engine/oniguruma'

import langCpp from 'shiki/langs/cpp.mjs'
import langBash from 'shiki/langs/bash.mjs'
import langJson from 'shiki/langs/json.mjs'
import langPython from 'shiki/langs/python.mjs'
import themeMocha from 'shiki/themes/catppuccin-mocha.mjs'

let highlighterPromise: Promise<HighlighterCore> | null = null

const MQL_FUNCTIONS = [
  'OrderSend', 'OrderSelect', 'OrderModify', 'OrderClose', 'OrderCloseBy', 'OrderDelete',
  'OnInit', 'OnTick', 'OnDeinit', 'OnCalculate', 'OnStart', 'OnTrade', 'OnTimer',
  'OnChartEvent', 'OnTester', 'OnTradeTransaction',
  'CopyBuffer', 'CopyRates', 'CopyClose', 'CopyTime', 'CopyHigh', 'CopyLow', 'CopyOpen',
  'IndicatorRelease', 'IndicatorInfoInteger',
  'iMA', 'iRSI', 'iMACD', 'iBands', 'iStochastic', 'iATR', 'iCCI', 'iSAR', 'iEnvelopes', 'iForce',
  'iTime', 'iHigh', 'iLow', 'iOpen', 'iClose', 'iVolume', 'iBars', 'iBarShift', 'iHighest', 'iLowest',
  'SymbolInfoDouble', 'SymbolInfoInteger', 'SymbolInfoString', 'SymbolInfoTick', 'SymbolSelect',
  'AccountInfoDouble', 'AccountInfoInteger', 'AccountInfoString', 'AccountBalance', 'AccountEquity',
  'PositionsTotal', 'PositionGetTicket', 'PositionSelect', 'PositionGetDouble', 'PositionGetInteger',
  'PositionGetString', 'PositionClose', 'OrdersTotal', 'OrderGetTicket', 'HistorySelect',
  'TimeCurrent', 'TimeLocal', 'TimeGMT', 'EventSetTimer', 'EventSetMillisecondTimer', 'EventKillTimer',
  'GetLastError', 'ResetLastError', 'Print', 'PrintFormat', 'Comment', 'Alert',
  'StringFormat', 'StringSplit', 'StringSubstr', 'StringReplace', 'StringFind', 'StringLen',
  'ArrayResize', 'ArraySetAsSeries', 'ArrayInitialize', 'ArraySize', 'ArraySort', 'ArrayCopy',
  'FileOpen', 'FileWrite', 'FileRead', 'FileClose', 'FileIsEnding', 'FileDelete',
  'DatabaseOpen', 'DatabasePrepare', 'DatabaseRead', 'DatabaseFinalize', 'DatabaseClose',
  'OnnxCreate', 'OnnxCreateFromBuffer', 'OnnxRun', 'OnnxRelease', 'OnnxSetInputShape', 'OnnxSetOutputShape',
  'MathMax', 'MathMin', 'MathAbs', 'MathPow', 'MathSqrt', 'MathRound', 'MathFloor', 'MathCeil',
  'NormalizeDouble', 'RefreshRates', 'Sleep', 'IsTradeAllowed', 'IsTesting', 'ChartRedraw',
  'WebRequest', 'EventChartCustom', 'HistoryDealSelect', 'HistoryDealGetInteger',
  'HistoryDealGetDouble', 'HistoryDealGetString', 'DatabaseExecute', 'DatabaseBind',
  'DatabaseColumnText', 'DatabaseColumnInteger', 'DatabaseColumnDouble'
]

const MQL_KEYWORDS = ['input', 'sinput', 'extern', 'property', 'strict', 'include']

const fnRe = new RegExp(`\\b(${MQL_FUNCTIONS.join('|')})\\b`, 'g')
const kwRe = new RegExp(`\\b(${MQL_KEYWORDS.join('|')})\\b`, 'g')

function enhanceMQL(html: string): string {
  return html.replace(fnRe, '<span class="tk-mql">$1</span>').replace(kwRe, '<span class="tk-mql-kw">$1</span>')
}

export type CodeFlavor = 'mql4' | 'mql5' | 'cpp' | 'bash' | 'json' | 'text' | 'tree' | 'python' | 'mixed'

async function getHighlighter(): Promise<HighlighterCore> {
  if (!highlighterPromise) {
    highlighterPromise = createHighlighterCore({
      themes: [themeMocha as ThemeInput],
      langs: [langCpp, langBash, langJson, langPython, 'text'] as LanguageInput[],
      engine: createOnigurumaEngine(import('shiki/wasm'))
    })
  }
  return highlighterPromise
}

/** Highlight kode dengan tema obsidian-violet + enhancement token MQL. */
export async function highlightMQL(code: string, flavor: CodeFlavor): Promise<string> {
  const hl = await getHighlighter()
  let lang: string
  let enhance = false
  switch (flavor) {
    case 'mql4':
    case 'mql5':
    case 'mixed':
    case 'cpp':
      lang = 'cpp'
      enhance = true
      break
    case 'tree':
      lang = 'text'
      break
    default:
      lang = flavor
  }
  let html = hl.codeToHtml(code, { lang, theme: 'catppuccin-mocha' })
  if (enhance) {
    html = enhanceMQL(html)
  }
  return html
}

export function preloadHighlighter(): void {
  void getHighlighter()
}
