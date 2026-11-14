import type { Pitfall } from './types'

export const PITFALLS: Pitfall[] = [
  {
    id: 'repaint-shift0',
    severity: 'Critical',
    title: 'Signals taken from the forming bar (shift 0) — intra-bar repaint',
    symptom: 'Backtests look profitable while live results diverge. Signals appear and disappear within the same bar; live behavior cannot be reproduced in the tester.',
    cause: 'Indicator values at shift 0 change continuously while the bar forms. Decisions are made on data that is not final, and evaluation per bar effectively peeks at the future.',
    resolution: 'All signal decisions must use completed bars (shift 1 in MQL4; CopyBuffer starting at index 1 in MQL5 with series indexing). Execute on new bar detection.',
    code: {
      flavor: 'mql5',
      bad: `// incorrect: the forming bar changes continuously
if(CopyBuffer(h, 0, 0, 1, buf) == 1 && buf[0] > 70)
   trade.Sell(...);   // may enter repeatedly within one bar`,
      good: `// correct: a completed bar is final
double buf[];
ArraySetAsSeries(buf, true);
if(CopyBuffer(h, 0, 1, 2, buf) == 2 && buf[0] > 70)
   trade.Sell(...);   // once per bar via an iTime guard`
    }
  },
  {
    id: 'handle-leak',
    severity: 'Critical',
    title: 'Indicator handles created in OnTick without release',
    symptom: 'The advisor slows down over time; RAM consumption rises continuously; after hours the terminal starts to stutter.',
    cause: 'Calling iMA/iRSI inside OnTick creates or retains indicator services repeatedly without IndicatorRelease — a resource leak invisible in short backtests.',
    resolution: 'Create handles once in OnInit, store them globally or as class fields, and release them in OnDeinit. Audit that every create has a matching release.',
    code: {
      flavor: 'mql5',
      bad: `void OnTick()
{
   double v = iMA(_Symbol, 0, 20, 0, MODE_EMA, PRICE_CLOSE); // a handle per tick
   double buf[]; CopyBuffer((int)v, 0, 1, 1, buf);
}`,
      good: `int g_ma = INVALID_HANDLE;      // once, global
int OnInit() { g_ma = iMA(_Symbol, 0, 20, 0, MODE_EMA, PRICE_CLOSE);
               return(g_ma != INVALID_HANDLE ? INIT_SUCCEEDED : INIT_FAILED); }
void OnDeinit(const int r) { IndicatorRelease(g_ma); }
void OnTick() { double b[]; CopyBuffer(g_ma, 0, 1, 1, b); }`
    }
  },
  {
    id: 'loop-order-forward',
    severity: 'Critical',
    title: 'Close-all loop iterating forwards (shifting indices)',
    symptom: '"Close all" closes only half the orders; the remainder is left open without an error message.',
    cause: 'Closing an order or position shifts the list. A loop from index 0 upwards skips elements after each closure.',
    resolution: 'Iterate backwards: MQL4 for(i=OrdersTotal()-1;i>=0;i--); MQL5 for(i=PositionsTotal()-1;i>=0;i--) with PositionGetTicket(i).',
    code: {
      flavor: 'mql4',
      bad: `for(int i = 0; i < OrdersTotal(); i++)   // incorrect
{
   OrderSelect(i, SELECT_BY_POS);
   OrderClose(OrderTicket(), OrderLots(), OrderClosePrice(), 10);
}`,
      good: `for(int i = OrdersTotal() - 1; i >= 0; i--)   // correct: backwards
{
   if(!OrderSelect(i, SELECT_BY_POS)) continue;
   OrderClose(OrderTicket(), OrderLots(), OrderClosePrice(), 10);
}`
    }
  },
  {
    id: 'magic-missing',
    severity: 'Critical',
    title: 'Missing magic number or magic filter',
    symptom: 'The advisor modifies or closes user-placed manual orders; two advisors on one account close each other\'s positions.',
    cause: 'OrdersTotal()/PositionsTotal() cover the entire account. Without magic and symbol filters, the advisor treats every position as its own.',
    resolution: 'Always set a magic number on orders and always filter OrderMagicNumber()/POSITION_MAGIC plus symbol in loops. Two advisors on one account require distinct magic numbers.',
    code: {
      flavor: 'mql5',
      bad: `for(int i = PositionsTotal()-1; i >= 0; i--)
{
   ulong tk = PositionGetTicket(i);
   trade.PositionClose(tk);   // closes every position in the account
}`,
      good: `for(int i = PositionsTotal()-1; i >= 0; i--)
{
   ulong tk = PositionGetTicket(i);
   if(PositionGetString(POSITION_SYMBOL) != _Symbol) continue;
   if(PositionGetInteger(POSITION_MAGIC) != (long)InpMagic) continue;
   trade.PositionClose(tk);
}`
    }
  },
  {
    id: 'double-equality',
    severity: 'Subtle',
    title: 'Comparing doubles with ==',
    symptom: 'Conditions such as profit == 0 or price == level are never, or unpredictably, satisfied; logic halts at unexpected points.',
    cause: 'Floating point values are inexact: 0.1 + 0.2 equals 0.30000000000000004. Exact comparison fails for mathematically equal values.',
    resolution: 'Compare differences against a tolerance: MathAbs(a-b) < epsilon, or in points: MathAbs(a-b) < Point.',
    code: {
      flavor: 'mql4',
      bad: `if(Bid == breakEvenPrice) MoveStopToBE();   // almost never true`,
      good: `if(MathAbs(Bid - breakEvenPrice) < 2 * Point) MoveStopToBE();`
    }
  },
  {
    id: 'normalize-stops',
    severity: 'Moderate',
    title: 'Stop levels not normalized or below the stop level',
    symptom: 'Error 130 (MQL4) or TRADE_RETCODE_INVALID_STOPS (MQL5), especially during news when brokers raise the stop level.',
    cause: 'Stop prices carry excess digits, or the SL/TP distance is below the dynamic SYMBOL_TRADE_STOPS_LEVEL.',
    resolution: 'Always NormalizeDouble(price, _Digits); guarantee the SL distance is at least stopsLevel*Point + one tick before sending.',
    code: {
      flavor: 'mql5',
      good: `double minDist = SymbolInfoInteger(_Symbol, SYMBOL_TRADE_STOPS_LEVEL)
                 * _Point + _Point;
double slDist  = MathMax(slPips * pipSize, minDist);
double sl      = NormalizeDouble(ask - slDist, _Digits);`
    }
  },
  {
    id: 'lot-not-validated',
    severity: 'Moderate',
    title: 'Volume not rounded to the lot step or outside limits',
    symptom: 'Error 131 / TRADE_RETCODE_INVALID_VOLUME; or risk sizing far off target on brokers with a 0.1 lot step.',
    cause: 'A risk-formula result of 0.173 lots is sent directly; the broker requires multiples of 0.01 (or 0.1) and rejects it.',
    resolution: 'Apply MathFloor(lot/step)*step and clamp to [MINLOT, MAXLOT]. When the result is below MINLOT, the trade violates the risk budget and must be skipped rather than forced.',
    code: {
      flavor: 'mql5',
      good: `double step = SymbolInfoDouble(_Symbol, SYMBOL_VOLUME_STEP);
double minL = SymbolInfoDouble(_Symbol, SYMBOL_VOLUME_MIN);
double maxL = SymbolInfoDouble(_Symbol, SYMBOL_VOLUME_MAX);
lot = MathFloor(lot / step) * step;
if(lot < minL) return(false);          // skip, do not force
lot = MathMin(lot, maxL);`
    }
  },
  {
    id: 'trade-context',
    severity: 'Moderate',
    title: 'Retries without delay or misclassified errors (MQL4)',
    symptom: 'Persistent "Trade context is busy" (146); or an advisor retrying a permanent error (invalid volume) thousands of times.',
    cause: 'Retry loops without Sleep flood the trade context; retries run on errors that cannot succeed with identical parameters.',
    resolution: 'Classify: transient (129, 135, 136, 138, 146) retries with backoff; permanent (130, 131, 133, 134) logs and stops. Limit to two or three attempts.',
    code: {
      flavor: 'mql4',
      good: `if(ticket < 0)
{
   int err = GetLastError();
   bool transient = (err==129||err==135||err==136||err==138||err==146);
   if(!transient) return(-1);        // permanent: stop
   Sleep(300 * attempt);             // backoff before retry
}`
    }
  },
  {
    id: 'block-webrequest',
    severity: 'Moderate',
    title: 'Synchronous WebRequest inside OnTick',
    symptom: 'The advisor pauses briefly every few ticks; ticks are missed; a slow inference server freezes the entire trading logic.',
    cause: 'WebRequest blocks until the response completes (a 5-second timeout freezes OnTick for 5 seconds), and it does not run in the Strategy Tester at all.',
    resolution: 'Use an asynchronous pattern: send from OnTimer or a dedicated event and receive via OnChartEvent custom events; or replace external inference with native ONNX. The full design is covered on the Architecture page.',
    code: {
      flavor: 'mql5',
      good: `// safe path: the timer performs the work, results arrive via events
void OnTimer()
{
   // lightweight request and result flags; never inside OnTick
}
// ALTERNATIVE: replace the external path with native ONNX (OnnxRun)
// -> synchronous but microsecond-scale, and it runs in the tester.`
    }
  },
  {
    id: 'overfit',
    severity: 'Critical',
    title: 'Optimization without out-of-sample validation (overfitting)',
    symptom: 'The optimizer finds parameters with a near-vertical equity curve; two weeks of live trading produce a severe drawdown.',
    cause: 'All data is used for optimization; parameters lucky on this sample are mistaken for a good strategy. Profit factors above 5 over 1000 trades are almost always this artifact.',
    resolution: 'Walk-forward: optimize on period A, validate the fixed parameters on period B, which the optimizer never saw. Use a custom OnTester score with drawdown penalties and a minimum trade count. The full protocol is in the MQL5 Strategy Tester topic.'
  },
  {
    id: 'session-time',
    severity: 'Subtle',
    title: 'Session filters using local time or the wrong timezone',
    symptom: 'A "7 to 21" hour filter appears shifted by several hours; results differ across brokers.',
    cause: 'TimeLocal/TimeGMT used for session logic, while candles and liquidity follow broker SERVER time (TimeCurrent), which differs in zone between brokers.',
    resolution: 'Session logic must use TimeCurrent() (server). When real-world time is required (for example news), convert explicitly via TimeGMT(). Validate on the demo account of the target broker.'
  },
  {
    id: 'state-restart',
    severity: 'Moderate',
    title: 'State held only in memory — lost on VPS restart',
    symptom: 'After a terminal or VPS restart, the advisor forgets cooldowns, virtual positions or grid levels, and behavior changes silently.',
    cause: 'Advisor globals vanish when the process dies. Real systems restart: Windows updates, crashes, VPS migration.',
    resolution: 'Reconstruct state in OnInit: from open positions (magic plus comment), GlobalVariables, or an MQL5 SQLite state table. Design to be "stateless toward memory, stateful toward the market".'
  }
]
