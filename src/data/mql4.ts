import type { Topic } from './types'

export const MQL4_TOPICS: Topic[] = [
  // ────────────────────────────────────────────────
  {
    id: 'struktur-program',
    title: 'Program Structure and Event Handlers',
    subtitle: 'The skeleton of expert advisors, indicators, and scripts: OnInit, OnTick, OnDeinit',
    icon: 'boxes',
    keywords: 'oninit ontick ondeinit onstart event handler expert advisor script indicator property strict structure',
    syntax: {
      intro:
        'An MQL4 program consists of event handler functions that the terminal invokes automatically in response to runtime events. A program does not define its own entry loop; logic is attached to the events relevant to the program type.',
      points: [
        { label: '#property', desc: 'Program metadata: strict, copyright, version, link. The strict directive enables the modern, strictly checked compilation mode and is required for new source files.' },
        { label: 'int OnInit()', desc: 'Invoked once when the program is attached to a chart. Used for input validation and initialization. Returns INIT_SUCCEEDED or INIT_FAILED.' },
        { label: 'void OnTick()', desc: 'The main expert advisor event, invoked on every incoming price tick. Real-time trading logic is placed here.' },
        { label: 'void OnDeinit(const int reason)', desc: 'Invoked when the program is removed or the chart is closed. Chart objects and comments are cleaned up here.' },
        { label: 'void OnStart()', desc: 'Entry point specific to scripts; executes once and the script terminates.' },
        { label: 'int OnCalculate(...)', desc: 'Entry point specific to custom indicators; recalculates indicator buffers on each bar.' }
      ],
      code: `//+------------------------------------------------------------------+
//| Minimal MQL4 expert advisor skeleton                             |
//+------------------------------------------------------------------+
#property strict
#property copyright "MQL Docs"

int OnInit()
{
   if(Period() != PERIOD_H1)
      Print("The advisor targets H1; current period: ", Period());
   return(INIT_SUCCEEDED);
}

void OnDeinit(const int reason)
{
   Comment("");
}

void OnTick()
{
   // trading logic, invoked on every tick
}`,
      codeTitle: 'EA_Skeleton.mq4'
    },
    useCase: {
      intro:
        'MQL4 supports four program types. The event handlers a program implements determine when its code executes:',
      items: [
        { when: 'Expert advisor — automated trading', why: 'Uses OnInit, OnTick and OnDeinit. Applicable when a strategy must react to every price tick continuously without manual supervision.' },
        { when: 'Custom indicator — analytical display', why: 'Uses OnCalculate. Applicable when a custom plot (for example a modified RSI) is required on the chart, either for manual analysis or for consumption by an expert advisor through iCustom.' },
        { when: 'Script — single execution', why: 'Uses OnStart. Applicable to one-off tasks: closing all orders, exporting candle history to CSV, or placing a batch of orders.' },
        { when: 'Include library (.mqh) — shared code', why: 'No mandatory event handlers. Applicable to order and risk functions shared by multiple expert advisors.' }
      ]
    },
    efficiency: {
      intro:
        'OnTick is invoked dozens to hundreds of times per minute during active sessions. Execution efficiency in MQL4 is primarily a matter of avoiding repeated work across ticks.',
      tips: [
        { title: 'Perform expensive validation once in OnInit', desc: 'Lot step checks, trade permission checks and input validation are initialization concerns and should not be repeated on every tick.', code: `int OnInit()\n{\n   if(!IsTradeAllowed())\n   {\n      Alert("AutoTrading is disabled; the advisor will not trade");\n      return(INIT_FAILED);\n   }\n   return(INIT_SUCCEEDED);\n}` },
        { title: 'Process per bar, not per tick', desc: 'For candle-based strategies (moving average crosses, pin bars), execute strategy logic only once per newly opened bar. The technique is described under Date, Time and Timers.' },
        { title: 'Do not redraw objects on every tick', desc: 'Update chart labels and lines only when a displayed value changes. ObjectCreate/ObjectSet calls inside the tick loop degrade chart performance.' }
      ]
    },
    example: {
      title: 'A minimal compilable expert advisor',
      code: `#property strict

input double LotSize     = 0.10;
input int    MagicNumber = 777001;

datetime g_lastBarTime = 0;

int OnInit()
{
   Print("Advisor started. Lot=", DoubleToString(LotSize, 2),
         " Magic=", IntegerToString(MagicNumber));
   return(INIT_SUCCEEDED);
}

void OnDeinit(const int reason)
{
   Print("Advisor removed. Reason: ", reason);
   Comment("");
}

void OnTick()
{
   // new bar detection: process once per candle
   if(Time[0] == g_lastBarTime)
      return;
   g_lastBarTime = Time[0];

   Comment("New bar: ", TimeToString(Time[0], TIME_DATE | TIME_MINUTES));
}`,
      explanation: [
        '#property strict is required at the top of the file; without it the compiler applies the legacy, loosely checked MQL4 rules.',
        'input parameters appear in the advisor dialog and are stored with test and optimization runs.',
        'New bar detection via Time[0] == g_lastBarTime limits strategy execution to one run per candle instead of tens of runs per candle.',
        'Comment() provides on-chart diagnostics and is cleared in OnDeinit so no text remains on the user chart.'
      ]
    }
  },

  // ────────────────────────────────────────────────
  {
    id: 'tipe-data-variabel',
    title: 'Data Types and Variables',
    subtitle: 'int, double, string, datetime; input, extern and static storage classes',
    icon: 'type',
    keywords: 'int double string datetime bool color input extern static variable type scope casting normalize',
    syntax: {
      intro:
        'MQL4 is statically typed. Monetary values and prices are double, timestamps are datetime (Unix epoch seconds), counters are int, text is string.',
      points: [
        { label: 'double', desc: 'All prices, volumes and profits. Double values are not exactly representable; compare using an epsilon rather than ==, and apply NormalizeDouble() before values are sent to the server.' },
        { label: 'int', desc: 'Integers: order tickets, magic numbers, bar shifts, counters.' },
        { label: 'datetime', desc: 'Seconds since 1970. Literal form: D\'2024.01.15 00:00\'. Arithmetic is in seconds: Time[0] + 3600 is one hour ahead.' },
        { label: 'input', desc: 'Parameters exposed in the program dialog; read-only from code. Values are recorded during testing and optimization.' },
        { label: 'extern', desc: 'Equivalent to input in modern MQL4; used mainly for sharing variables across include files. New code should use input.' },
        { label: 'static', desc: 'Local variables whose values persist across function invocations; enables new bar detection without global variables.' }
      ],
      code: `#property strict

input int    MaPeriod  = 20;         // exposed in the advisor dialog
input double RiskPct   = 1.0;        // percent of equity per trade
input string CommentTx = "GridBot";  // order comment

int      g_signalCount = 0;         // global: lives for the program lifetime
datetime g_lastSignal  = 0;

void OnTick()
{
   static int ticksInBar = 0;        // persists across invocations
   ticksInBar++;

   double price = Bid;               // predefined: current bid price
   int    digits = Digits;           // predefined: symbol digits
   double point = Point;             // predefined: minimum price unit

   double norm = NormalizeDouble(price, digits);
}`,
      codeTitle: 'Variables.mq4'
    },
    useCase: {
      intro: 'Selection guidance for types and storage classes:',
      items: [
        { when: 'Prices, stop levels, volumes, profit', why: 'double. Apply NormalizeDouble(value, Digits) before sending values to the server; excessive precision is rejected with errors 129 and 130.' },
        { when: 'Strategy parameters exposed to the user', why: 'input, for example MaPeriod or RiskPct. Values are editable without source changes and are recorded for optimization.' },
        { when: 'State that persists across ticks', why: 'A static local variable or a g_-prefixed global. static is preferred because it does not widen the global scope.' },
        { when: 'Bar open times, sessions, cooldowns', why: 'datetime with second-based arithmetic. Example: skip signals for 15 minutes after the last order: TimeCurrent() < g_lastOrderTime + 900.' }
      ]
    },
    efficiency: {
      intro: 'Type-related defects that produce subtle behavior differences:',
      tips: [
        { title: 'Do not compare doubles with ==', desc: 'Floating point arithmetic is inexact: 0.1 + 0.2 does not equal 0.3. Compare against a tolerance.', code: `// incorrect\nif(profit == 0.0) CloseAll();\n\n// correct\nif(MathAbs(profit) < 0.001) CloseAll();\n// or compare in points:\nif(MathAbs(profit) < 3 * Point) CloseAll();` },
        { title: 'Normalize before sending orders', desc: 'Stop levels and volumes must conform to symbol rules (Digits, LotStep); otherwise the server rejects the request with errors 130 and 131.', code: `double sl = NormalizeDouble(Ask - 200 * Point, Digits);\ndouble lot = NormalizeDouble(lot, 2);` },
        { title: 'Cast explicitly for integer division', desc: '5/2 evaluates to 2 (integer division). Write 5.0/2.0 or (double)a/b when a fractional result is required.' }
      ]
    },
    example: {
      title: 'Risk-based position sizing',
      code: `#property strict

input double RiskPercent  = 1.0;    // percent of balance at risk per trade
input int    StopLossPips = 30;

//+------------------------------------------------------------------+
//| Compute lot size from risk percent and stop distance             |
//+------------------------------------------------------------------+
double CalcLotByRisk(double entryPrice, double slPrice)
{
   double riskMoney  = AccountBalance() * RiskPercent / 100.0;
   double tickValue  = MarketInfo(Symbol(), MODE_TICKVALUE);
   double tickSize   = MarketInfo(Symbol(), MODE_TICKSIZE);
   double stopDist   = MathAbs(entryPrice - slPrice);

   // monetary loss per 1 lot if the stop is hit
   double lossPerLot = (stopDist / tickSize) * tickValue;
   if(lossPerLot <= 0) return(0);

   double lot = riskMoney / lossPerLot;

   // conform to broker rules
   double minLot  = MarketInfo(Symbol(), MODE_MINLOT);
   double maxLot  = MarketInfo(Symbol(), MODE_MAXLOT);
   double lotStep = MarketInfo(Symbol(), MODE_LOTSTEP);

   lot = MathFloor(lot / lotStep) * lotStep;
   lot = MathMax(minLot, MathMin(maxLot, lot));
   return(NormalizeDouble(lot, 2));
}

void OnTick()
{
   double sl = Ask - StopLossPips * Point;
   double lot = CalcLotByRisk(Ask, sl);
   Print("Lot for risk ", DoubleToString(RiskPercent, 1),
         "% = ", DoubleToString(lot, 2));
}`,
      explanation: [
        'Risk-based sizing produces a constant percentage of equity at risk per trade, independent of account size and stop distance.',
        'MODE_TICKVALUE and MODE_TICKSIZE make the calculation valid across symbols (forex, gold, indices) without hard-coded pip values.',
        'MathFloor(lot/lotStep)*lotStep rounds the volume down; rounding down is preferred over exceeding the intended risk.',
        'Values are clamped to MINLOT/MAXLOT. When the computed size falls below MINLOT, the trade does not satisfy the risk constraint and should be skipped.'
      ]
    }
  },

  // ────────────────────────────────────────────────
  {
    id: 'operator-kontrol',
    title: 'Operators and Control Flow',
    subtitle: 'if/else, switch and loops, applied within frequently invoked event handlers',
    icon: 'branch',
    keywords: 'if else switch for while loop operator control flow ternary continue break guard clause',
    syntax: {
      intro:
        'Control flow syntax in MQL4 is identical to C/C++. The difference relevant to MQL4 is the discipline required inside handlers that are invoked hundreds of times per hour.',
      points: [
        { label: 'if / else if / else', desc: 'Primary decision construct. Braces should be used even for single statements to prevent merge errors during later edits.' },
        { label: 'switch', desc: 'Selection over discrete values, for example an advisor mode enum (MODE_SCALP/MODE_SWING). Cleaner than chained conditionals.' },
        { label: 'for', desc: 'Bounded iteration: order scans (for(int i=OrdersTotal()-1; i>=0; i--)) and signal array traversal.' },
        { label: 'while / do-while', desc: 'Condition-driven loops. Inside OnTick, a loop without a guaranteed exit condition freezes the terminal.' },
        { label: 'break / continue', desc: 'break exits the loop; continue skips to the next iteration. Both are required for order processing loops.' },
        { label: 'ternary (?:)', desc: 'Single-line selection: double sl = isBuy ? Ask - dist : Bid + dist;' }
      ],
      code: `#property strict

enum TradeMode { MODE_SCALP, MODE_SWING, MODE_GRID };
input TradeMode Mode = MODE_SWING;

void OnTick()
{
   // early exit
   if(OrdersTotal() > 0) return;      // a position already exists

   switch(Mode)
   {
      case MODE_SCALP:
         // narrow stop loss and take profit
         break;
      case MODE_SWING:
         // wider trailing parameters
         break;
      case MODE_GRID:
         // place grid orders
         break;
   }

   // order scan: always iterate backwards
   for(int i = OrdersTotal() - 1; i >= 0; i--)
   {
      if(!OrderSelect(i, SELECT_BY_POS, MODE_TRADES)) continue;
      if(OrderMagicNumber() != 777001) continue;      // other advisor
      if(OrderSymbol() != Symbol()) continue;         // other symbol
      // ... process the order
   }
}`,
      codeTitle: 'ControlFlow.mq4'
    },
    useCase: {
      intro: 'Appropriate application of each construct within an expert advisor:',
      items: [
        { when: 'Market condition filters (spread, session, news)', why: 'if with early return at the top of OnTick. Cheapest conditions are evaluated first; expensive indicator calls run only when all filters pass.' },
        { when: 'Behavior selection by mode or setting', why: 'switch over an enum input. Enums render as a dropdown in the dialog and reject invalid values.' },
        { when: 'Order scanning and processing', why: 'Backwards for loop with OrderSelect and guard clauses. Backwards iteration is mandatory when the loop can close orders, because closing shifts indices.' },
        { when: 'Retry of fallible operations', why: 'while with an attempt limit (maximum 3) and Sleep(300). Without a limit, a permanent error such as market-closed loops indefinitely.' }
      ]
    },
    efficiency: {
      intro: 'Control flow performance in MQL4 is dominated by filtering:',
      tips: [
        { title: 'Order conditions by cost', desc: 'Evaluate OrdersTotal(), session and spread checks before iRSI/iMA calls. Every indicator call recomputes; do not spend that cost on ticks already rejected by cheap filters.' },
        { title: 'Guard clauses over nested conditionals', desc: 'Early returns keep the OnTick flow flat and easier to debug, in contrast to deeply nested if pyramids.' },
        { title: 'Iterate orders backwards', desc: 'for(i = OrdersTotal()-1; i>=0; i--) keeps indices valid when orders are closed mid-loop; forward iteration skips entries during close-all operations.' }
      ]
    },
    example: {
      title: 'Layered entry filters ordered from cheapest to most expensive',
      code: `#property strict

input int    MagicNumber   = 777001;
input int    MaxSpreadPips = 20;      // reject entries on wide spreads
input int    StartHour     = 7;       // session start (server time)
input int    EndHour       = 21;      // session end
input double MaxRiskDD    = 20.0;    // stop the advisor above 20% drawdown

bool PassesFilters()
{
   // 1. cheapest filter: server hour
   int hour = TimeHour(TimeCurrent());
   if(hour < StartHour || hour >= EndHour) return(false);

   // 2. spread filter
   double spreadPips = (Ask - Bid) / Point;
   if(spreadPips > MaxSpreadPips) return(false);

   // 3. equity guard
   if(AccountEquity() < AccountBalance() * (1.0 - MaxRiskDD / 100.0))
      return(false);

   return(true);
}

void OnTick()
{
   if(OrdersTotal() > 0) return;    // single position limit
   if(!PassesFilters()) return;     // cheap filters first

   // signal computation runs only after the filters pass
   double rsi = iRSI(NULL, 0, 14, PRICE_CLOSE, 1);
   if(rsi < 30)
   {
      int ticket = OrderSend(Symbol(), OP_BUY, 0.10, Ask, 3, 0, 0,
                             "RSI oversold", MagicNumber);
      if(ticket < 0)
         Print("OrderSend failed, error: ", GetLastError());
   }
}`,
      explanation: [
        'Filter order follows evaluation cost: TimeHour, spread and equity checks run before the RSI call. Rejected ticks never compute indicators.',
        'The spread filter prevents entries during news and rollover periods, when spreads can widen by an order of magnitude.',
        'The equity guard is an independent protection layer: signal logic may fail, but the account limit still applies.',
        'The OrderSend call above omits SL/TP for brevity; production advisors always send protective stops. See Error Handling and the Pitfalls section.'
      ]
    }
  },

  // ────────────────────────────────────────────────
  {
    id: 'fungsi-preprocessor',
    title: 'Functions and the Preprocessor',
    subtitle: 'Custom functions, #define, #include and #property directives',
    icon: 'function',
    keywords: 'function define include property preprocessor parameter reference void return library mqh',
    syntax: {
      intro:
        'Functions decompose a large OnTick into named behaviors. Preprocessor directives (#property, #define, #include) control file identity and composition before compilation.',
      points: [
        { label: 'Function declaration', desc: 'ReturnType Name(type param, ...). Modern MQL4 supports default parameter values and limited overloading.' },
        { label: 'Pass by reference (&)', desc: 'Parameters declared with & can be modified by the function (double &result) or avoid copying large arrays.' },
        { label: '#define', desc: 'Symbolic constants: #define MAX_RETRY 3. Replaced at compile time; no runtime storage.' },
        { label: '#include <file.mqh>', desc: '<...> searches MQL4\\Include; "file.mqh" searches the directory of the including file. The basis of modular architecture.' },
        { label: '#property strict', desc: 'Besides strict checking, this mode surfaces missing return values and flags dangerous implicit conversions as warnings.' }
      ],
      code: `#property strict

#define MAX_RETRY    3
#define SLIPPAGE     3

input int MagicNumber = 777001;

//+------------------------------------------------------------------+
//| Compute lot size and stop level; false = not tradeable           |
//+------------------------------------------------------------------+
bool PrepareOrder(double riskPct, double slPips, double &lot, double &sl)
{
   sl = Ask - slPips * Point;

   double riskMoney = AccountBalance() * riskPct / 100.0;
   double tickValue = MarketInfo(Symbol(), MODE_TICKVALUE);
   double tickSize  = MarketInfo(Symbol(), MODE_TICKSIZE);
   double lossPerLot = slPips * Point / tickSize * tickValue;
   if(lossPerLot <= 0) return(false);

   lot = riskMoney / lossPerLot;
   double step = MarketInfo(Symbol(), MODE_LOTSTEP);
   lot = NormalizeDouble(MathFloor(lot / step) * step, 2);
   return(lot >= MarketInfo(Symbol(), MODE_MINLOT));
}

//+------------------------------------------------------------------+
//| Buy order with a simple retry loop                               |
//+------------------------------------------------------------------+
int OpenBuy(double lot, double sl)
{
   int slPips = 30;
   for(int attempt = 1; attempt <= MAX_RETRY; attempt++)
   {
      RefreshRates();
      double tp = NormalizeDouble(Ask + slPips * Point, Digits);
      int ticket = OrderSend(Symbol(), OP_BUY, lot, Ask, SLIPPAGE,
                             NormalizeDouble(sl, Digits), tp,
                             "codex-buy", MagicNumber);
      if(ticket > 0) return(ticket);

      int err = GetLastError();
      Print("Attempt ", attempt, " failed, error ", err);
      if(err == 129 || err == 135) Sleep(500);   // price changed: retry
      else break;                                // other error: stop
   }
   return(-1);
}`,
      codeTitle: 'Functions.mq4'
    },
    useCase: {
      intro: 'Criteria for decomposing code into functions and modules:',
      items: [
        { when: 'Logic used in more than one location', why: 'Extract immediately. CalcLotByRisk may be called at entry and at partial close; a single implementation prevents divergent formulas.' },
        { when: 'OnTick exceeds roughly 60 lines', why: 'Refactor into HandleEntries(), HandleExits() and UpdateTrailing() so OnTick remains a short orchestrator.' },
        { when: 'Utilities shared across advisors', why: 'Move to Include\\MyLib\\Risk.mqh and reference via #include. Fixes apply once for all consuming programs.' },
        { when: 'Magic numbers appear in code', why: 'Promote to #define or input. A literal appearing eight times requires eight coordinated edits.' }
      ]
    },
    efficiency: {
      intro: 'Structural practices with disproportionate effect on maintainability:',
      tips: [
        { title: 'One function, one decision', desc: 'ShouldEnter() answers a yes/no question and does not send orders. Pure functions remain valid when backtest logic changes.' },
        { title: 'References for multiple outputs', desc: 'PrepareOrder(risk, pips, lot, sl) fills lot and sl through references instead of relying on hidden global state.' },
        { title: 'Retry only transient errors', desc: 'Errors 129/135/138 (price changed, requote) warrant retries. Error 131 (invalid volume) cannot succeed with identical parameters; stop and log.' }
      ]
    },
    example: {
      title: 'Include folder structure for shared modules',
      code: `// File: MQL4/Include/Codex/Risk.mqh
#property strict

double CodexLotByRisk(double balance, double riskPct,
                      double slPips, string symbol)
{
   double tickValue = MarketInfo(symbol, MODE_TICKVALUE);
   double tickSize  = MarketInfo(symbol, MODE_TICKSIZE);
   double lossPerLot = slPips * Point / tickSize * tickValue;
   if(lossPerLot <= 0) return(0);
   return(balance * riskPct / 100.0 / lossPerLot);
}

// File: MyEA.mq4  (consumer of the library above)
#property strict
#include <Codex\\Risk.mqh>

input double RiskPercent  = 1.0;
input int    StopLossPips = 30;

void OnTick()
{
   if(OrdersTotal() > 0) return;
   double lot = CodexLotByRisk(AccountBalance(), RiskPercent,
                               StopLossPips, Symbol());
   Print("Computed lot: ", DoubleToString(lot, 2));
}`,
      explanation: [
        '#include <Codex\\Risk.mqh> resolves against the Include folder, so the module is available to every advisor in the terminal without duplication.',
        'Library functions receive all inputs as parameters and do not touch global state, which keeps them verifiable in isolation.',
        'Include\\Codex\\Risk.mqh alongside Execution.mqh and Signals.mqh is the small-scale form of the layered architecture described on the Architecture page.',
        'Include files contain no mandatory event handlers; their content is inserted at compile time.'
      ]
    }
  },

  // ────────────────────────────────────────────────
  {
    id: 'array-string',
    title: 'Arrays and Strings',
    subtitle: 'Dynamic arrays, series arrays, and string operations for logging and parsing',
    icon: 'braces',
    keywords: 'array arrayresize arraysetasseries string stringsplit stringformat concat parse logging csv',
    syntax: {
      intro:
        'MQL4 arrays are static or dynamic. Price arrays (Time[], Close[], indicator results) are series arrays where index 0 denotes the current bar. String operations include split, format and find.',
      points: [
        { label: 'Declaration and resize', desc: 'double arr[]; ArrayResize(arr, 100); dynamic arrays grow on demand. ArrayInitialize(arr, 0) clears the contents.' },
        { label: 'Series arrays', desc: 'Time[], Open[], High[], Low[], Close[] and Volume[] are predefined series: index 0 is the forming bar, index 1 the last completed bar, which is the safe basis for signals.' },
        { label: 'ArraySetAsSeries', desc: 'Aligns the indexing direction of a user array with the series convention (0 = newest), relevant when receiving CopyBuffer/CopyRates data.' },
        { label: 'StringSplit', desc: 'StringSplit("a,b,c", \',\', parts) yields parts[0]="a". The basis of CSV parsing for import and export.' },
        { label: 'StringFormat / DoubleToString', desc: 'StringFormat("%.2f | %s", lot, symbol) produces uniform log lines; DoubleToString(price, Digits) renders prices at symbol precision.' }
      ],
      code: `#property strict

void OnStart()
{
   // 1. simple dynamic array
   double spreads[];
   ArrayResize(spreads, 10);
   ArrayInitialize(spreads, 0.0);

   // 2. predefined series arrays
   Print("Last completed close: ", DoubleToString(Close[1], Digits));
   Print("10-bar high: ", DoubleToString(High[iHighest(NULL, 0, MODE_HIGH, 10, 1)], Digits));

   // 3. CSV parsing
   string row = "EURUSD,1.08450,0.10,buy";
   string parts[];
   int n = StringSplit(row, \',\', parts);
   if(n == 4)
   {
      string sym   = parts[0];
      double price = StringToDouble(parts[1]);
      double lot   = StringToDouble(parts[2]);
      string side  = parts[3];
      PrintFormat("%s %s %.2f @ %s", side, sym, lot,
                  DoubleToString(price, 5));
   }

   // 4. formatted logging
   Print(StringFormat("[%s] equity=%.2f dd=%.1f%%",
         Symbol(), AccountEquity(), 12.3));
}`,
      codeTitle: 'ArraysAndStrings.mq4'
    },
    useCase: {
      intro: 'Recurring array and string workloads:',
      items: [
        { when: 'Signal history or per-symbol state', why: 'Dynamic arrays with resize on insertion. For multi-symbol advisors, parallel arrays (symbol[], state[]) are sufficient and simple.' },
        { when: 'Swing highs/lows, highest/lowest over N bars', why: 'iHighest/iLowest with High[]/Low[] instead of manual loops. The returned index applies directly to breakout stop placement.' },
        { when: 'CSV journals and configuration exchange', why: 'StringFormat for writing, StringSplit for reading. CSV remains the most portable format between MQL4, Excel and Python.' },
        { when: 'Readable labels and comments', why: 'StringFormat standardizes alignment and precision, which matters when reviewing live and visual-mode output.' }
      ]
    },
    efficiency: {
      intro: 'String and array operations are the largest hidden cost inside OnTick:',
      tips: [
        { title: 'Pre-allocate instead of repeated resize', desc: 'ArrayResize inside a loop triggers repeated reallocation. Resize once to a maximum capacity and track a separate counter.' },
        { title: 'Build strings with StringFormat', desc: 'Concatenation with + creates intermediate string objects per operation. Format once per log line.' },
        { title: 'Log per event, not per tick', desc: 'Print/StringFormat on every tick produces hundreds of lines per minute plus string allocation cost. Log on signals, orders, errors and new bars only.' }
      ]
    },
    example: {
      title: 'Per-bar CSV journal suitable for external analysis',
      code: `#property strict

input bool   WriteJournal = true;
input string JournalFile  = "codex_journal.csv";

datetime g_lastBar = 0;

int OnInit()
{
   if(WriteJournal)
   {
      int h = FileOpen(JournalFile, FILE_WRITE | FILE_CSV | FILE_ANSI);
      if(h != INVALID_HANDLE)
      {
         FileWrite(h, "time", "symbol", "close", "spread_pips");
         FileClose(h);   // header once; subsequent writes append
      }
   }
   return(INIT_SUCCEEDED);
}

void OnTick()
{
   if(Time[0] == g_lastBar) return;
   g_lastBar = Time[0];

   if(!WriteJournal) return;

   int h = FileOpen(JournalFile, FILE_READ | FILE_WRITE | FILE_CSV | FILE_ANSI);
   if(h == INVALID_HANDLE)
   {
      Print("FileOpen failed, error ", GetLastError());
      return;
   }
   FileSeek(h, 0, SEEK_END);          // append at end of file
   FileWrite(h,
             TimeToString(Time[1], TIME_DATE | TIME_MINUTES),
             Symbol(),
             DoubleToString(Close[1], Digits),
             DoubleToString((Ask - Bid) / Point, 1));
   FileClose(h);
}`,
      explanation: [
        'A per-bar journal (not per-tick) produces tidy analytical data without excessive disk I/O and serves as raw material for offline experiments.',
        'FILE_CSV makes each FileWrite call a single comma-separated line, directly readable by Excel and pandas.read_csv.',
        'FileSeek(SEEK_END) combined with READ|WRITE implements append; without it, the file is overwritten on every bar.',
        'INVALID_HANDLE must be checked: in live operation files can be locked by antivirus or synchronization software, and the advisor must survive that condition.'
      ]
    }
  },

  // ────────────────────────────────────────────────
  {
    id: 'order-trading',
    title: 'Trading Functions',
    subtitle: 'OrderSend, OrderSelect, OrderModify, OrderClose — the MQL4 execution core',
    icon: 'chart',
    keywords: 'ordersend orderselect ordermodify orderclose pending order market magic number slippage ticket requote',
    syntax: {
      intro:
        'MQL4 uses a single order model: market and pending orders share one function family and each order carries a unique ticket. All execution goes through four core functions.',
      points: [
        { label: 'OrderSend(...)', desc: 'Opens a market order (OP_BUY/OP_SELL) or pending order (OP_BUYLIMIT, OP_SELLSTOP, etc.). Returns a ticket (>0) or -1 on failure. Parameters: symbol, cmd, volume, price, slippage, sl, tp, comment, magic, expiration.' },
        { label: 'OrderSelect(i, SELECT_BY_POS, MODE_TRADES)', desc: 'Loads an order into context before other Order* functions read its properties (OrderTicket, OrderLots, OrderOpenPrice). Accepts a position index or a ticket; MODE_TRADES for open orders, MODE_HISTORY for closed ones.' },
        { label: 'OrderModify(ticket, price, sl, tp, expiration)', desc: 'Modifies stop loss, take profit or pending price. Servers reject modifications without a change (error 1); verify a difference of at least one point first.' },
        { label: 'OrderClose(ticket, lots, price, slippage)', desc: 'Closes a market order fully or partially. Closing price is Bid for buys and Ask for sells, i.e. the opposite side of the entry.' },
        { label: 'Magic number', desc: 'The advisor identity attached to each order. Without it, an advisor processes user-placed manual orders. Always set it and always filter on it.' },
        { label: 'Slippage', desc: 'Maximum permitted price deviation in points. Typical values 3–30 depending on the pair; 0 rejects nearly every fill on market-execution brokers.' }
      ],
      code: `#property strict

input int    MagicNumber = 777001;
input double Lots        = 0.10;
input int    Slippage    = 10;
input int    StopLossPips   = 30;
input int    TakeProfitPips = 60;

int OpenMarketBuy()
{
   RefreshRates();                                  // sync current prices
   double sl = NormalizeDouble(Ask - StopLossPips * Point, Digits);
   double tp = NormalizeDouble(Ask + TakeProfitPips * Point, Digits);

   int ticket = OrderSend(
      Symbol(),                 // symbol
      OP_BUY,                   // market buy command
      Lots,                     // volume
      Ask,                      // entry price
      Slippage,                 // permitted deviation (points)
      sl, tp,                   // stop loss and take profit
      "codex-demo",             // comment (about 31 characters max)
      MagicNumber,              // advisor identity
      0,                        // expiration (pending orders only)
      clrDodgerBlue);           // arrow color on the chart

   if(ticket < 0)
   {
      PrintFormat("OrderSend failed: error %d | Ask=%s lot=%s",
                  GetLastError(), DoubleToString(Ask, Digits),
                  DoubleToString(Lots, 2));
   }
   return(ticket);
}

int CountOwnOrders()
{
   int count = 0;
   for(int i = OrdersTotal() - 1; i >= 0; i--)
   {
      if(!OrderSelect(i, SELECT_BY_POS, MODE_TRADES)) continue;
      if(OrderMagicNumber() == MagicNumber && OrderSymbol() == Symbol())
         count++;
   }
   return(count);
}

bool MoveStopToBreakeven(int ticket)
{
   if(!OrderSelect(ticket, SELECT_BY_TICKET)) return(false);
   double newSL = NormalizeDouble(OrderOpenPrice(), Digits);
   if(MathAbs(OrderStopLoss() - newSL) < Point) return(true);  // already at BE
   return(OrderModify(ticket, OrderOpenPrice(), newSL,
                      OrderTakeProfit(), 0));
}`,
      codeTitle: 'Trading.mq4'
    },
    useCase: {
      intro: 'Function selection by trading requirement:',
      items: [
        { when: 'Breakout and momentum entries', why: 'Market OrderSend (OP_BUY/OP_SELL). The signal is valid immediately, not at a specific price.' },
        { when: 'Mean-reversion and grid entries at target prices', why: 'Pending OrderSend: OP_BUYLIMIT (buy below market), OP_SELLLIMIT (sell above), STOP variants for breakout levels. Set expiration so stale pendings are removed automatically.' },
        { when: 'Trailing stops, break-even, partial closes', why: 'OrderModify for stop levels; OrderClose with a reduced volume for partial exits. Both require OrderSelect on the ticket first.' },
        { when: 'Close-all on signal reversal or session end', why: 'Backwards loop with OrderSelect per order and OrderClose per ticket, filtered by magic number and symbol so only this advisor\'s orders are closed.' }
      ]
    },
    efficiency: {
      intro: 'Execution is the most expensive and most risky code path; the constraints are strict:',
      tips: [
        { title: 'RefreshRates() before every attempt', desc: 'Predefined prices update on incoming ticks but become stale after Sleep or long loops. Send orders using current-second prices.', code: `RefreshRates();\nint t = OrderSend(Symbol(), OP_BUY, lot, Ask, 10, sl, tp, "x", magic);` },
        { title: 'Classify errors before retrying', desc: 'Requote/price-changed errors (129, 135, 136, 138) retry after refresh. Parameter errors (130, 131) never succeed with identical values; log and correct. Trade context busy (146) retries after Sleep.' },
        { title: 'Decide once, execute once', desc: 'Resolve entry, stop and target before OrderSend. Opening and then modifying in the same second doubles the round-trips and failure surface. Where a broker requires separate steps, verify the ticket before modifying.' }
      ]
    },
    example: {
      title: 'ATR-based trailing stop for position management',
      code: `#property strict

input int MagicNumber  = 777001;
input int ATRPeriod    = 14;
input double ATRMult   = 2.0;
input int    TrailStartPips = 25;   // start trailing after N pips of profit

void ManageTrailing()
{
   double atr = iATR(NULL, 0, ATRPeriod, 1);
   if(atr <= 0) return;

   for(int i = OrdersTotal() - 1; i >= 0; i--)
   {
      if(!OrderSelect(i, SELECT_BY_POS, MODE_TRADES)) continue;
      if(OrderMagicNumber() != MagicNumber) continue;
      if(OrderSymbol() != Symbol()) continue;
      if(OrderType() != OP_BUY) continue;            // demo: buys only

      double profitPips = (Bid - OrderOpenPrice()) / Point;
      if(profitPips < TrailStartPips) continue;      // not yet eligible

      double newSL = NormalizeDouble(Bid - atr * ATRMult, Digits);

      // only raise the stop, never lower it
      if(newSL > OrderStopLoss() + Point)
      {
         if(!OrderModify(OrderTicket(), OrderOpenPrice(), newSL,
                         OrderTakeProfit(), 0))
            Print("Modify failed, error ", GetLastError());
      }
   }
}

void OnTick()
{
   ManageTrailing();
}`,
      explanation: [
        'ATR makes the trailing distance adaptive: volatile markets receive wider stops that survive noise, calm markets receive tighter stops that lock profit sooner. A fixed distance cannot provide both.',
        'The guard newSL > OrderStopLoss() + Point prevents the stop from moving backwards and prevents error 1 (no changes) from OrderModify.',
        'TrailStartPips defers trailing until the position is established; trailing too early expels positions on the first noise.',
        'The backwards loop with magic, symbol and type filters is the standard position-management skeleton of production MQL4 advisors.'
      ]
    }
  },

  // ────────────────────────────────────────────────
  {
    id: 'indikator-teknikal',
    title: 'Technical Indicators',
    subtitle: 'iMA, iRSI, iATR, iCustom — direct value access by bar shift',
    icon: 'trend',
    keywords: 'ima irsi iatr imacd icustom indicator shift ma rsi stochastic bands signal',
    syntax: {
      intro:
        'In MQL4, indicator calls return the value directly: pass a bar shift and receive the number. This contrasts with MQL5, where calls return a handle; the distinction matters when porting between platforms.',
      points: [
        { label: 'Common parameters', desc: 'symbol (NULL = current chart), timeframe (0 = current chart, or PERIOD_H1 etc.), indicator-specific parameters, and finally the shift.' },
        { label: 'Shift', desc: '0 = forming bar (value still changes), 1 = last completed bar. Serious signals are computed from shift 1.' },
        { label: 'iMA', desc: 'iMA(NULL, 0, period, ma_shift, MODE_EMA, PRICE_CLOSE, shift). Modes: SMA/EMA/SMMA/LWMA. Fast/slow pairs form the classic crossover basis.' },
        { label: 'iRSI, iATR, iMACD, iStochastic', desc: 'The main oscillator and band family. iATR is also used non-signal: as a volatility measure for adaptive stops and trailing.' },
        { label: 'iCustom', desc: 'Reads a custom indicator\'s buffer: iCustom(NULL,0,"MyInd",params..., bufferIndex, shift). Connects custom visual analysis to expert advisors.' }
      ],
      code: `#property strict

input int FastMA = 12;
input int SlowMA = 26;

void OnTick()
{
   // completed-bar values (shift 1) — stable, no repaint
   double emaFast1 = iMA(NULL, 0, FastMA, 0, MODE_EMA, PRICE_CLOSE, 1);
   double emaSlow1 = iMA(NULL, 0, SlowMA, 0, MODE_EMA, PRICE_CLOSE, 1);

   // two bars back for cross direction
   double emaFast2 = iMA(NULL, 0, FastMA, 0, MODE_EMA, PRICE_CLOSE, 2);
   double emaSlow2 = iMA(NULL, 0, SlowMA, 0, MODE_EMA, PRICE_CLOSE, 2);

   bool crossedUp   = (emaFast2 <= emaSlow2) && (emaFast1 > emaSlow1);
   bool crossedDown = (emaFast2 >= emaSlow2) && (emaFast1 < emaSlow1);

   double atr   = iATR(NULL, 0, 14, 1);
   double rsi   = iRSI(NULL, 0, 14, PRICE_CLOSE, 1);
   double stoch = iStochastic(NULL, 0, 5, 3, 3, MODE_SMA, 0, MODE_MAIN, 1);

   if(crossedUp)   Print("BUY signal | ATR=", DoubleToString(atr, Digits), " RSI=", DoubleToString(rsi, 1));
   if(crossedDown) Print("SELL signal | Stoch=", DoubleToString(stoch, 1));
}`,
      codeTitle: 'Indicators.mq4'
    },
    useCase: {
      intro: 'Indicator selection by analytical purpose:',
      items: [
        { when: 'Trend direction filter', why: 'A fast/slow iMA pair, or a long-period iMA (200) as a long-only regime boundary. Simple, robust, minimally prone to overfitting.' },
        { when: 'Entry timing trigger', why: 'iRSI/iStochastic extremes and crosses, or small-timeframe MA crosses. Triggers are applied above a trend filter, not alone.' },
        { when: 'Stop and target sizing', why: 'iATR: measured volatility produces stops at entry ± k*ATR. It is the one indicator recommended in every strategy, as a measurement rather than a signal.' },
        { when: 'Connecting custom visuals to an advisor', why: 'iCustom over your own indicator. The working split: logic in the indicator, execution in the advisor.' }
      ]
    },
    efficiency: {
      intro: 'MQL4 indicator calls recompute values; reducing call count keeps the advisor fast:',
      tips: [
        { title: 'Compute signals once per bar', desc: 'Combine with new bar detection. Hundreds of iMA calls per tick for the same bar value are pure waste.' },
        { title: 'Cache per-bar results', desc: 'Store computed values in static or global variables after calculation; position management (trailing) can then read the cache.' },
        { title: 'Shift 1, not 0, for decisions', desc: 'Shift 0 changes throughout the forming bar (intra-bar repaint), producing false signals and backtests that live trading cannot replicate. Shift 1 is final.' }
      ]
    },
    example: {
      title: 'iCustom — consuming a custom indicator buffer inside an advisor',
      code: `//+------------------------------------------------------------------+
//| Indicator file: MyArrow.mq4                                      |
//| Buffer 0 = buy arrows, buffer 1 = sell arrows                    |
//+------------------------------------------------------------------+
#property strict
#property indicator_chart_window
#property indicator_buffers 2

double BufBuy[], BufSell[];

int OnInit()
{
   SetIndexBuffer(0, BufBuy);   SetIndexStyle(0, DRAW_ARROW); SetIndexArrow(0, 233);
   SetIndexBuffer(1, BufSell);  SetIndexStyle(1, DRAW_ARROW); SetIndexArrow(1, 234);
   return(INIT_SUCCEEDED);
}

int OnCalculate(const int rates_total, const int prev_calculated,
                const datetime &time[], const double &open[],
                const double &high[], const double &low[],
                const double &close[], const long &tick_volume[],
                const long &volume[], const int &spread[])
{
   // ...fill buffers according to the signal logic...
   return(rates_total);
}

//+------------------------------------------------------------------+
//| Advisor file: consuming the indicator via iCustom                |
//+------------------------------------------------------------------+
void OnTick()
{
   double buySignal  = iCustom(NULL, 0, "MyArrow", 0, 1);  // buffer 0, shift 1
   double sellSignal = iCustom(NULL, 0, "MyArrow", 1, 1);  // buffer 1, shift 1

   if(buySignal  != EMPTY_VALUE && buySignal  != 0)
      Print("Buy arrow on the previous bar");
   if(sellSignal != EMPTY_VALUE && sellSignal != 0)
      Print("Sell arrow on the previous bar");
}`,
      explanation: [
        'The iCustom contract: (symbol, timeframe, indicator filename, ...input parameters in declaration order..., buffer index, shift). Wrong parameter order yields silently wrong values.',
        'EMPTY_VALUE is the buffer\'s empty marker; always check for it before treating a value as a signal. Unwritten buffers contain EMPTY_VALUE or 0 depending on SetIndexEmptyValue.',
        'The logic-in-indicator, execution-in-advisor split enables fast research: parameters are tuned visually on charts, and the advisor consumes the final result.',
        'Compatibility note: MQL5 replaces this model entirely — iCustom also returns a handle and data is read via CopyBuffer. See the Handle-Based Indicators topic in the MQL5 section.'
      ]
    }
  },

  // ────────────────────────────────────────────────
  {
    id: 'account-market-info',
    title: 'Account and Market Information',
    subtitle: 'Bid/Ask, Point/Digits, MarketInfo, Account* — the broker interface',
    icon: 'wallet',
    keywords: 'bid ask point digits marketinfo accountbalance accountequity margin lotstep minlot stoplevel',
    syntax: {
      intro:
        'Predefined variables (Bid, Ask, Point, Digits, Symbol) provide current chart data; MarketInfo() and Account*() expose symbol rules and account state. These form the interface to the broker.',
      points: [
        { label: 'Bid / Ask', desc: 'Current sell/buy prices of the chart symbol. Buys enter at Ask and close at Bid; sells are the reverse. Mixing the sides produces stop levels that are further away than intended.' },
        { label: 'Point / Digits', desc: 'Point is the smallest price unit (0.00001 on 5-digit symbols); Digits is the decimal count. Pip conversion: pips = points * 10 on 5-digit brokers.' },
        { label: 'MarketInfo(symbol, ...)', desc: 'MODE_MINLOT/MAXLOT/LOTSTEP, MODE_TICKVALUE/TICKSIZE, MODE_SPREAD, MODE_STOPLEVEL (minimum SL/TP distance), MODE_MARGINREQUIRED.' },
        { label: 'AccountBalance / AccountEquity', desc: 'Balance is settled funds; equity is balance plus floating profit/loss. Sizing uses balance; monitoring uses equity.' },
        { label: 'AccountFreeMarginCheck', desc: 'Estimates free margin after opening an order; checking before OrderSend prevents error 134 (not enough money).' }
      ],
      code: `#property strict

void OnTick()
{
   double spreadPips = (Ask - Bid) / (Point * 10);   // 5-digit broker
   double stoplevel  = MarketInfo(Symbol(), MODE_STOPLEVEL) * Point;

   Print(StringFormat(
      "Sym=%s Bid=%s Ask=%s Spread=%.1f pips StopLevel=%s",
      Symbol(),
      DoubleToString(Bid, Digits),
      DoubleToString(Ask, Digits),
      spreadPips,
      DoubleToString(stoplevel, Digits)));

   double lot = 0.10;
   double freeAfter = AccountFreeMarginCheck(Symbol(), OP_BUY, lot);
   if(freeAfter < 0 || GetLastError() == 134)
      Print("Insufficient margin for lot ", DoubleToString(lot, 2));
}`,
      codeTitle: 'MarketInfo.mq4'
    },
    useCase: {
      intro: 'Where account and symbol data determine decisions:',
      items: [
        { when: 'Volume validation before OrderSend', why: 'Clamp to MINLOT/MAXLOT and round to LOTSTEP. A 0.173 lot on a 0.01-step broker is rejected (error 131), wasting a round-trip.' },
        { when: 'Minimum stop distance', why: 'Check MODE_STOPLEVEL: stops must be at least stoplevel*Point from price. The level rises during news; a stop valid yesterday can be rejected today.' },
        { when: 'Risk-based sizing', why: 'MODE_TICKVALUE/TICKSIZE convert a stop distance into money, which is the core of a precise lot-by-risk formula on every symbol.' },
        { when: 'Account kill switch', why: 'AccountEquity versus AccountBalance drives a drawdown guard; AccountMargin drives an exposure guard. Protection independent of signal logic.' }
      ]
    },
    efficiency: {
      intro: 'Common mistakes that turn market data into silent defects:',
      tips: [
        { title: 'Detect broker digits, never hard-code', desc: 'Pip conversion must adapt: multiplier = (Digits == 3 || Digits == 5) ? 10 : 1. Hard-coded conversions differ by a factor of ten between 4- and 5-digit brokers.' },
        { title: 'Prices go stale after slow operations', desc: 'After Sleep or long loops, call RefreshRates() before reading Ask/Bid, or use SymbolInfoTick, which always returns a fresh snapshot (the MQL5 pattern).' },
        { title: 'Cache symbol rules, read account live', desc: 'LotStep and TickValue rarely change and may be cached in OnInit. Equity and margin change every tick and must be read directly.' }
      ]
    },
    example: {
      title: 'A small symbol-rules wrapper as a single source of truth',
      code: `#property strict

double PipSize()
{
   return((Digits == 3 || Digits == 5) ? Point * 10 : Point);
}

double ToPips(double priceDist) { return(priceDist / PipSize()); }

bool SpreadOK(double maxPips) { return(ToPips(Ask - Bid) <= maxPips); }

double NormalizeLot(double lot)
{
   double step = MarketInfo(Symbol(), MODE_LOTSTEP);
   double minL = MarketInfo(Symbol(), MODE_MINLOT);
   double maxL = MarketInfo(Symbol(), MODE_MAXLOT);
   lot = MathFloor(lot / step) * step;
   return(MathMax(minL, MathMin(maxL, lot)));
}

void OnTick()
{
   if(!SpreadOK(15))
      return;   // spread above 15 pips

   double slPips = 30;
   double slDist = slPips * PipSize();          // 30 true pips
   double sl     = NormalizeDouble(Ask - slDist, Digits);
   Print("Stop distance ", DoubleToString(ToPips(Ask - sl), 1), " pips");
}`,
      explanation: [
        'PipSize() adapts to broker digits, so the same code is correct on 4- and 5-digit forex brokers and on gold and index symbols.',
        'Every rule is read from the broker at runtime rather than hard-coded; the advisor remains correct across brokers without edits.',
        'A wrapper of this size is the minimal form of the Market Data layer in the layered architecture described on the Architecture page.'
      ]
    }
  },

  // ────────────────────────────────────────────────
  {
    id: 'datetime-timer',
    title: 'Date, Time and Timers',
    subtitle: 'TimeCurrent, new bar detection, EventSetTimer — controlling when code executes',
    icon: 'clock',
    keywords: 'timecurrent datetime eventsettimer ontimer new bar timehour session weekday cooldown',
    syntax: {
      intro:
        'MQL4 provides two time mechanisms: market time (TimeCurrent, Time[], iTime) and a local timer (EventSetTimer with OnTimer). They answer different questions: when a bar opens, and when an advisor must act without ticks.',
      points: [
        { label: 'TimeCurrent()', desc: 'Server time of the last known tick. The basis for session logic and trading-hour filters.' },
        { label: 'Time[], iTime(NULL, 0, shift)', desc: 'Bar open times. A change in Time[0] marks a new bar — the most fundamental execution trigger.' },
        { label: 'TimeHour / TimeDayOfWeek', desc: 'Component extraction for session filters: hours between 7 and 21, Friday afternoon exclusion, and similar rules.' },
        { label: 'EventSetTimer(secs) with OnTimer()', desc: 'A local timer that runs regardless of ticks — required for low-liquidity symbols and housekeeping outside market hours.' },
        { label: 'D\'datetime\' literals', desc: 'Constants of the form if(TimeCurrent() >= D\'2024.03.15 14:30\'). datetime values compare directly as Unix seconds.' }
      ],
      code: `#property strict

input int StartHour = 7;
input int EndHour   = 21;

datetime g_lastBarTime = 0;

int OnInit()
{
   EventSetTimer(60);            // OnTimer every 60 seconds
   return(INIT_SUCCEEDED);
}

void OnDeinit(const int reason)
{
   EventKillTimer();             // mandatory cleanup
}

bool IsNewBar()
{
   if(Time[0] != g_lastBarTime)
   {
      g_lastBarTime = Time[0];
      return(true);
   }
   return(false);
}

bool InSession()
{
   int h = TimeHour(TimeCurrent());
   int dow = TimeDayOfWeek(TimeCurrent());
   if(dow == 0 || dow == 6) return(false);          // weekend (server time)
   if(dow == 5 && h >= 18) return(false);           // Friday evening: skip
   return(h >= StartHour && h < EndHour);
}

void OnTick()
{
   if(!IsNewBar()) return;      // strategy logic once per bar
   if(!InSession()) return;
   // ... signals and execution
}

void OnTimer()
{
   // runs without ticks: orphan checks, heartbeat logs, housekeeping
   Comment("Heartbeat: ", TimeToString(TimeCurrent(), TIME_SECONDS));
}`,
      codeTitle: 'DateTime.mq4'
    },
    useCase: {
      intro: 'Classical time problems and the matching mechanism:',
      items: [
        { when: 'Strategies based on completed candles', why: 'New bar detection via Time[0]. All MA/RSI/candlestick signals are evaluated on completed bars, consistent between backtest and live.' },
        { when: 'Trading restricted to sessions', why: 'TimeHour/TimeDayOfWeek filters. Sessions differ in character, and many strategies are profitable only within specific ones.' },
        { when: 'Housekeeping without ticks', why: 'OnTimer: state synchronization, heartbeat logs, stuck-order checks. Liquid symbols tick every second; illiquid ones can stay silent for minutes.' },
        { when: 'Pending order expiry', why: 'The expiration parameter of OrderSend, supported by a sweep in OnTimer that removes pendings past their lifetime.' }
      ]
    },
    efficiency: {
      intro: 'Correct use of time keeps an advisor efficient and consistent:',
      tips: [
        { title: 'IsNewBar is the master switch', desc: 'A guard at the top of OnTick removes the large majority of computation: signals, logging and execution run at most once per bar.', code: `void OnTick()\n{\n   if(!IsNewBar()) return;   // the rest runs at most once per bar\n   ...\n}` },
        { title: 'Kill the timer in OnDeinit', desc: 'Timers without EventKillTimer accumulate across attach/detach cycles. EventKillTimer() in OnDeinit is mandatory cleanup.' },
        { title: 'Server time, not local time', desc: 'Sessions and candles follow broker server time (TimeCurrent). Local time (TimeLocal) is display-only; mixing the two shifts session filters by hours.' }
      ]
    },
    example: {
      title: 'A time-based cooldown between trades',
      code: `#property strict

input int    MagicNumber     = 777001;
input int    CooldownMin     = 30;    // quiet minutes after a close
input double CooldownAfterLoss = 1;   // multiplier applied after a loss

datetime g_nextEntryAllowed = 0;

void CheckLastClosedForCooldown()
{
   datetime lastClose = 0;
   double   lastProfit = 0;
   if(HistorySelect(0, TimeCurrent()))
   {
      for(int i = OrdersHistoryTotal() - 1; i >= 0; i--)
      {
         if(!OrderSelect(i, SELECT_BY_POS, MODE_HISTORY)) continue;
         if(OrderMagicNumber() != MagicNumber) continue;
         if(OrderSymbol() != Symbol()) continue;
         if(OrderCloseTime() > lastClose)
         {
            lastClose  = OrderCloseTime();
            lastProfit = OrderProfit() + OrderSwap() + OrderCommission();
         }
         break;   // most recent found
      }
   }
   if(lastClose == 0) return;

   int minutes = CooldownMin;
   if(lastProfit < 0)
      minutes = (int)(CooldownMin * CooldownAfterLoss);

   g_nextEntryAllowed = lastClose + minutes * 60;
}

void OnTick()
{
   if(TimeCurrent() < g_nextEntryAllowed)
   {
      Comment("Cooldown until: ",
              TimeToString(g_nextEntryAllowed, TIME_DATE | TIME_MINUTES));
      return;
   }
   Comment("Ready for entry");
   // ... signals
}`,
      explanation: [
        'A cooldown suppresses re-entry immediately after closures, particularly losses, and is expressed purely through time comparison.',
        'The cooldown can be loss-dependent (CooldownAfterLoss); this small calibration frequently improves the equity curve without touching signal logic.',
        'HistorySelect with OrdersHistoryTotal and OrderSelect(MODE_HISTORY) is how MQL4 reads closed orders; store lastClose as advisor state.',
        'New bar detection (execution), session filters (gating) and cooldowns (spacing) form the three standard time-control layers of an advisor.'
      ]
    }
  },

  // ────────────────────────────────────────────────
  {
    id: 'error-handling',
    title: 'Error Handling',
    subtitle: 'GetLastError, server error codes, and correct retry classification',
    icon: 'shield',
    keywords: 'getlasterror resetlasterror error 129 130 131 134 136 138 146 retry requote invalid stops recovery',
    syntax: {
      intro:
        'Failing trade functions do not throw; they return a sentinel value (-1 or false) and set the last error code. Reading and classifying that code is a core MQL4 skill.',
      points: [
        { label: 'GetLastError()', desc: 'Returns the error code set since the last query; ResetLastError() clears it. Read the code immediately after the failing call, before other functions overwrite it.' },
        { label: 'Price errors (transient)', desc: '129 ERR_INVALID_PRICE, 135 ERR_PRICE_CHANGED, 136 ERR_OFF_QUOTES, 138 ERR_REQUOTE, 6 ERR_NO_CONNECTION: refresh and retry with a delay.' },
        { label: 'Parameter errors (permanent)', desc: '130 ERR_INVALID_STOPS (stops too close), 131 ERR_INVALID_TRADE_VOLUME, 133 ERR_TRADE_DISABLED, 134 ERR_NOT_ENOUGH_MONEY: do not retry identical parameters; correct and log.' },
        { label: 'Environment errors', desc: '146 ERR_TRADE_CONTEXT_BUSY (context held by another process), 4108/4109 ticket and order state: Sleep, then a bounded retry.' },
        { label: 'Classification pattern', desc: 'if (code in {129,135,136,138,146}) retry; else log and alert. This classification separates advisors that survive requotes from advisors that stop at the first one.' }
      ],
      code: `#property strict

input int    MagicNumber = 777001;
input int    MaxRetry    = 3;

//+------------------------------------------------------------------+
//| OrderSend with classified retries                                |
//+------------------------------------------------------------------+
int RobustOrderSend(int cmd, double lots, double sl, double tp)
{
   for(int attempt = 1; attempt <= MaxRetry; attempt++)
   {
      ResetLastError();
      RefreshRates();

      double price = (cmd == OP_BUY) ? Ask : Bid;
      int ticket = OrderSend(Symbol(), cmd, lots, price, 10,
                             NormalizeDouble(sl, Digits),
                             NormalizeDouble(tp, Digits),
                             "codex", MagicNumber, 0, clrGold);

      if(ticket > 0) return(ticket);          // success

      int err = GetLastError();
      PrintFormat("Attempt %d/%d failed: err=%d price=%s",
                  attempt, MaxRetry, err,
                  DoubleToString(price, Digits));

      bool transient = (err == 129 || err == 135 || err == 136 ||
                        err == 138 || err == 146 || err == 6);
      if(!transient) break;                   // permanent: stop
      Sleep(400 * attempt);                   // simple backoff
   }
   Alert("Order failed permanently — inspect the Experts log");
   return(-1);
}`,
      codeTitle: 'ErrorHandling.mq4'
    },
    useCase: {
      intro: 'Locations where error handling is mandatory:',
      items: [
        { when: 'Every OrderSend / OrderClose / OrderModify', why: 'Check the return value and log the error with context (price, volume, attempt). Silently failed orders are the hardest losses to review.' },
        { when: 'FileOpen, missing iCustom indicators, GlobalVariable access', why: 'Check INVALID_HANDLE and return values. Long-lived advisors eventually meet locked files and version-mismatched indicators and must survive them.' },
        { when: 'VPS restarts and connection loss', why: 'OnInit must rebuild state from open orders (magic number and comment). An advisor must not assume it remembers anything from a previous session.' },
        { when: 'ECN accounts', why: 'Some ECN servers reject stop levels sent with OrderSend (error 130 despite valid values). The workaround: send the order without stops, then apply OrderModify immediately, verifying the modify result.' }
      ]
    },
    efficiency: {
      intro: 'Correct error handling is also efficient error handling:',
      tips: [
        { title: 'Scale backoff with attempt count', desc: 'Sleep(300), then 600, then 900, instead of repeated 100 ms retries that aggravate trade-context contention.' },
        { title: 'Structured logs, not noise', desc: 'One line per failure: attempt, error, price, volume. Alert only on final failure after retries are exhausted.' },
        { title: 'Treat errors as data', desc: 'Record errors with tick context in a CSV journal. During review, error patterns (for example frequent 138 at rollover) translate directly into entry-filter improvements.' }
      ]
    },
    example: {
      title: 'State reconstruction after a restart',
      code: `#property strict

input int MagicNumber = 777001;

// state that must survive restarts
datetime g_lastBarProcessed = 0;
int      g_signalCount      = 0;

int OnInit()
{
   // 1. recover positions from the market, not from memory
   int own = 0;
   for(int i = OrdersTotal() - 1; i >= 0; i--)
   {
      if(!OrderSelect(i, SELECT_BY_POS, MODE_TRADES)) continue;
      if(OrderMagicNumber() != MagicNumber) continue;
      if(OrderSymbol() != Symbol()) continue;
      own++;
      PrintFormat("Found position: #%d lots=%s type=%d",
                  OrderTicket(), DoubleToString(OrderLots(), 2),
                  OrderType());
   }

   // 2. restore the last processed bar from persistent storage
   if(GlobalVariableCheck("codex_lastbar_" + Symbol()))
      g_lastBarProcessed = (datetime)GlobalVariableGet(
                           "codex_lastbar_" + Symbol());

   PrintFormat("Recovery: %d advisor positions, lastBar=%s",
               own, TimeToString(g_lastBarProcessed));
   return(INIT_SUCCEEDED);
}

void OnDeinit(const int reason)
{
   GlobalVariableSet("codex_lastbar_" + Symbol(), (double)g_lastBarProcessed);
}

void OnTick()
{
   if(Time[0] == g_lastBarProcessed) return;
   g_lastBarProcessed = Time[0];
   g_signalCount++;
}`,
      explanation: [
        'VPS restarts are a certainty in live operation. OnInit scanning the market and restoring state keeps the advisor identity consistent across restarts.',
        'GlobalVariables are terminal-level storage surviving restarts, sufficient for light state. Complex state belongs in files or (in MQL5) SQLite.',
        'Order comment plus magic number is the identity pair: the advisor recognizes its orders even after the terminal has been closed entirely.',
        'This is the reason the Execution layer in the Architecture page is described as "stateless toward memory, stateful toward the market".'
      ]
    }
  },

  // ────────────────────────────────────────────────
  {
    id: 'tips-efisiensi',
    title: 'Performance Patterns',
    subtitle: 'Guards, caches, batching — the recurring performance patterns of MQL4',
    icon: 'zap',
    keywords: 'optimization performance efficiency cache guard antipattern profiling bottleneck',
    syntax: {
      intro:
        'MQL4 provides no advanced profiler; performance decisions come from patterns. The five patterns below cover the majority of expert advisor optimization needs.',
      points: [
        { label: 'Layered guard clauses', desc: 'OnTick as a chain of early returns ordered from cheapest to most expensive condition. Rejected ticks stop at the first line.' },
        { label: 'Per-bar caching', desc: 'Values that do not change within a bar (completed-bar signals, ATR) are computed once at the bar event and read for the rest of the bar.' },
        { label: 'Batched I/O', desc: 'Write journals per bar or per event, not per tick. File and print operations are the most expensive calls in MQL4.' },
        { label: 'Economical chart objects', desc: 'ObjectCreate/Move only on significant changes; labels updated on every tick slow the chart down.' },
        { label: 'Measure with tick counters', desc: 'Wrap suspect blocks with GetTickCount() and average over 1000 ticks. Primitive profiling, but sufficient to locate bottlenecks.' }
      ],
      code: `#property strict

// primitive profiling: average OnTick duration
uint   g_totalMicros = 0;
int    g_tickCount   = 0;

void OnTick()
{
   uint t0 = GetTickCount();

   // ===== guards: cheapest first =====
   if(OrdersTotal() > 0) return;
   static datetime lastBar = 0;
   if(Time[0] == lastBar) return;
   lastBar = Time[0];

   // ===== expensive work: once per bar =====
   double fast = iMA(NULL, 0, 12, 0, MODE_EMA, PRICE_CLOSE, 1);
   double slow = iMA(NULL, 0, 26, 0, MODE_EMA, PRICE_CLOSE, 1);

   g_totalMicros += GetTickCount() - t0;
   g_tickCount++;
   if(g_tickCount % 500 == 0)
      PrintFormat("Avg OnTick: %.3f ms (n=%d)",
                  (double)g_totalMicros / g_tickCount, g_tickCount);
}`,
      codeTitle: 'Performance.mq4'
    },
    useCase: {
      intro: 'When optimization is warranted, and when it is not:',
      items: [
        { when: 'Single-symbol advisor with light logic', why: 'Micro-optimization is almost never required. Modern terminals are fast; correctness of logic and risk management takes priority.' },
        { when: 'Multi-symbol or multi-timeframe advisors', why: 'Guards per symbol, caches per bar and batched execution become necessary; cost multiplies with symbol and timeframe count.' },
        { when: 'Strategy Tester runs of 10,000 passes', why: 'Backtest speed equals experiment throughput. Guards and caches multiply the number of optimization runs feasible per day.' },
        { when: 'Expensive logic needed rarely', why: 'Compute lazily: build grids or levels only when they are about to be used, not on every tick.' }
      ]
    },
    efficiency: {
      intro: 'Anti-patterns that make advisors slow:',
      tips: [
        { title: 'Indicators inside order loops', desc: 'One iMA call per iteration over 50 orders recomputes the same value 50 times. Compute once before the loop.' },
        { title: 'String concatenation per tick', desc: 'Comment("Equity: " + DoubleToString(...)) on every tick creates thousands of string objects. Update labels on bar or signal events only.' },
        { title: 'Polling full history per tick', desc: 'Scanning OrdersHistoryTotal() on every tick grows linearly with account age. Persist the last processed offset.' },
        { title: 'Sleep on the main tick path', desc: 'Sleep freezes the advisor for its duration and drops ticks. Restrict Sleep to execution retry paths.' }
      ]
    },
    example: {
      title: 'Guards and caching combined in a reusable skeleton',
      code: `#property strict

input int MagicNumber = 777001;

// per-bar cache
double   g_fast1 = 0, g_slow1 = 0;
bool     g_signalBuy = false, g_signalSell = false;
datetime g_cachedBar = 0;

void UpdateSignalsPerBar()
{
   if(Time[1] == g_cachedBar) return;         // this completed bar is cached
   g_cachedBar = Time[1];

   g_fast1 = iMA(NULL, 0, 12, 0, MODE_EMA, PRICE_CLOSE, 1);
   g_slow1 = iMA(NULL, 0, 26, 0, MODE_EMA, PRICE_CLOSE, 1);

   double fast2 = iMA(NULL, 0, 12, 0, MODE_EMA, PRICE_CLOSE, 2);
   double slow2 = iMA(NULL, 0, 26, 0, MODE_EMA, PRICE_CLOSE, 2);

   g_signalBuy  = (fast2 <= slow2) && (g_fast1 > g_slow1);
   g_signalSell = (fast2 >= slow2) && (g_fast1 < g_slow1);
}

void OnTick()
{
   // layer 1: cheap, every tick — active position management (uses cache)

   // layer 2: heavy work only on a new bar
   static datetime lastBar = 0;
   if(Time[0] == lastBar) return;
   lastBar = Time[0];

   if(CountOwnOrders(MagicNumber) > 0) return;
   UpdateSignalsPerBar();

   if(g_signalBuy)  { /* execute buy  */ }
   if(g_signalSell) { /* execute sell */ }
}

int CountOwnOrders(int magic)
{
   int c = 0;
   for(int i = OrdersTotal() - 1; i >= 0; i--)
   {
      if(!OrderSelect(i, SELECT_BY_POS, MODE_TRADES)) continue;
      if(OrderMagicNumber() == magic && OrderSymbol() == Symbol()) c++;
   }
   return(c);
}`,
      explanation: [
        'Two execution rates: per-tick (light position management reading the cache) and per-bar (signals and entries, computed once). This is the core MQL4 performance architecture.',
        'The cache is keyed on Time[1], so signals stay consistent for the whole forming bar and intra-bar repaint is excluded.',
        'CountOwnOrders runs on bar events only; order scans are loops, and the most expensive loop is the unnecessary one.',
        'The next architectural step is moving these patterns into layered, object-oriented structures, covered on the Architecture page and in the MQL5 section.'
      ]
    }
  }
]
