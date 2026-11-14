import type { Topic } from './types'

export const MQL5_TOPICS: Topic[] = [
  // ────────────────────────────────────────────────
  {
    id: 'struktur-program',
    title: 'Program Structure and Event Model',
    subtitle: 'OnInit/OnTick/OnCalculate plus the modern events: OnTrade, OnTester, OnChartEvent',
    icon: 'boxes',
    keywords: 'oninit ontick oncalculate ondeinit ontrade ontester onchartevent event model expert advisor indicator mql5',
    syntax: {
      intro:
        'MQL5 extends the MQL4 event model: beyond chart events (ticks, timer), programs receive trade events (OnTrade), transaction events (OnTradeTransaction) and testing events (OnTester). Advisors can therefore react to account changes, not only to price changes.',
      points: [
        { label: '#property and #include', desc: 'As in MQL4, but modern code primarily imports the Standard Library: #include <Trade\\Trade.mqh> and related headers.' },
        { label: 'int OnInit()', desc: 'Initialization: create indicator handles, configure CTrade, validate symbol properties. Returns INIT_SUCCEEDED, INIT_FAILED or INIT_PARAMETERS_INCORRECT.' },
        { label: 'void OnTick()', desc: 'The primary price event for expert advisors. In the Strategy Tester it also operates per tick, including real-tick modes.' },
        { label: 'int OnCalculate(const ...)', desc: 'Custom indicator entry point: receives the full constant price arrays and open/high/low/close buffers. prev_calculated reports how many bars were already computed.' },
        { label: 'void OnTrade() / OnTradeTransaction()', desc: 'Invoked on account events: orders filled, positions changed, deals recorded. No manual polling required.' },
        { label: 'double OnTester()', desc: 'Post-backtest hook: return a custom score (for example profit factor weighted by drawdown) used as the optimization criterion.' },
        { label: 'void OnChartEvent()', desc: 'Handles chart clicks, keystrokes, object dragging and custom inter-program events — the basis of chart-based user interfaces.' }
      ],
      code: `//+------------------------------------------------------------------+
//| Modern MQL5 expert advisor skeleton                              |
//+------------------------------------------------------------------+
#include <Trade\\Trade.mqh>

CTrade  trade;
int     g_maHandle = INVALID_HANDLE;

int OnInit()
{
   trade.SetExpertMagicNumber(20241114);
   trade.SetDeviationInPoints(10);

   g_maHandle = iMA(_Symbol, PERIOD_CURRENT, 20, 0, MODE_EMA, PRICE_CLOSE);
   if(g_maHandle == INVALID_HANDLE)
   {
      Print("Failed to create iMA handle");
      return(INIT_FAILED);
   }
   return(INIT_SUCCEEDED);
}

void OnDeinit(const int reason)
{
   if(g_maHandle != INVALID_HANDLE)
      IndicatorRelease(g_maHandle);
}

void OnTick()
{
   // trading logic per tick or per bar
}

void OnTrade()
{
   // executed whenever the account trading state changes
   Print("Trade event at ", TimeToString(TimeCurrent(), TIME_SECONDS));
}`,
      codeTitle: 'EA_Skeleton.mq5'
    },
    useCase: {
      intro: 'Mapping requirements to the appropriate event:',
      items: [
        { when: 'A standard price-reactive advisor', why: 'OnTick with a new-bar guard, complemented by OnTrade for execution reactions.' },
        { when: 'Automatic reaction to fills and closes', why: 'OnTradeTransaction: check trans.type == TRADE_TRANSACTION_DEAL_ADD and read the deal — no history polling per tick. Applicable to notifications, multi-leg management and automatic journaling.' },
        { when: 'High-performance custom indicators', why: 'OnCalculate with prev_calculated: compute only bars added since the last call, the officially supported efficient pattern.' },
        { when: 'Custom optimization criteria', why: 'OnTester: scores such as profit scaled by drawdown or trade count, replacing the built-in tester criteria with strategy-specific objectives.' }
      ]
    },
    efficiency: {
      intro: 'MQL5 efficiency begins with selecting the narrowest event that satisfies the requirement:',
      tips: [
        { title: 'OnTrade instead of history polling', desc: 'Classic MQL4 advisors scan OrdersHistoryTotal on every tick. In MQL5, OnTradeTransaction pushes the information: zero polling, immediate reaction.', code: `void OnTradeTransaction(const MqlTradeTransaction &trans,\n                        const MqlTradeRequest &request,\n                        const MqlTradeResult &result)\n{\n   if(trans.type == TRADE_TRANSACTION_DEAL_ADD)\n      Print("Deal added: ", trans.deal);\n}` },
        { title: 'Discipline around prev_calculated', desc: 'Start computing at index prev_calculated-1 and return rates_total. Ignoring it recomputes the full history on every tick.' },
        { title: 'Expensive initialization belongs in OnInit', desc: 'Indicator handles, symbol snapshots and input validation run once; OnTick is reserved for decisions.' }
      ]
    },
    example: {
      title: 'A minimal MQL5 advisor with correct handle lifecycle',
      code: `#include <Trade\\Trade.mqh>

input int    InpMaPeriod = 20;
input double InpLots     = 0.10;
input ulong  InpMagic    = 20241114;

CTrade trade;
int    g_fastHandle = INVALID_HANDLE;
int    g_slowHandle = INVALID_HANDLE;

int OnInit()
{
   trade.SetExpertMagicNumber(InpMagic);
   trade.SetDeviationInPoints(15);
   trade.SetTypeFillingBySymbol(_Symbol);

   g_fastHandle = iMA(_Symbol, PERIOD_CURRENT, InpMaPeriod, 0, MODE_EMA, PRICE_CLOSE);
   g_slowHandle = iMA(_Symbol, PERIOD_CURRENT, InpMaPeriod * 3, 0, MODE_EMA, PRICE_CLOSE);

   if(g_fastHandle == INVALID_HANDLE || g_slowHandle == INVALID_HANDLE)
      return(INIT_FAILED);
   return(INIT_SUCCEEDED);
}

void OnDeinit(const int reason)
{
   IndicatorRelease(g_fastHandle);
   IndicatorRelease(g_slowHandle);
}

void OnTick()
{
   // MQL5 new bar detection
   static datetime lastBar = 0;
   datetime cur = iTime(_Symbol, PERIOD_CURRENT, 0);
   if(cur == lastBar) return;
   lastBar = cur;

   double fast[], slow[];
   ArraySetAsSeries(fast, true);
   ArraySetAsSeries(slow, true);
   if(CopyBuffer(g_fastHandle, 0, 1, 2, fast) < 2) return;
   if(CopyBuffer(g_slowHandle, 0, 1, 2, slow) < 2) return;

   bool crossUp = (fast[1] <= slow[1]) && (fast[0] > slow[0]);
   if(crossUp && PositionsTotal() == 0)
      trade.Buy(InpLots, _Symbol, 0.0, 0.0, 0.0, "MA cross up");
}`,
      explanation: [
        'iMA in MQL5 does not return a value; it returns a handle. Actual data is read via CopyBuffer. This is the largest conceptual difference when migrating from MQL4.',
        'Handles are created once in OnInit and released in OnDeinit; unreleased handles accumulate and degrade multi-symbol advisors.',
        'ArraySetAsSeries(true) makes index 0 the newest value, preserving the shift-oriented reasoning familiar from MQL4.',
        'CTrade encapsulates the order mechanics; configuration happens once via SetExpertMagicNumber/SetDeviationInPoints instead of long OrderSend parameter lists.'
      ]
    }
  },

  // ────────────────────────────────────────────────
  {
    id: 'tipe-data',
    title: 'Data Types and Strict Typing',
    subtitle: 'long/ulong, official enums, input/sinput — the compiler as a safeguard',
    icon: 'type',
    keywords: 'long ulong uint input sinput enum typedef mql5 strict typing cast conversion',
    syntax: {
      intro:
        'MQL5 is considerably stricter than MQL4: dangerous implicit conversions are rejected at compile time, integer types extend to 64 bits, and the core API uses official enums rather than numeric constants.',
      points: [
        { label: 'long / ulong', desc: '64-bit integers for large monetary values, tick volumes and transaction identifiers. Deal and order IDs are long; do not narrow them to int.' },
        { label: 'Official enums throughout', desc: 'ENUM_TIMEFRAMES (PERIOD_H1), ENUM_ORDER_TYPE (ORDER_TYPE_BUY), ENUM_SYMBOL_INFO_DOUBLE (SYMBOL_BID): constant names, parameter types and return types form one system.' },
        { label: 'input vs sinput', desc: 'input parameters participate in optimization; sinput (static input) appears in the dialog but is excluded from optimization — appropriate for magic numbers and paths.' },
        { label: 'Native data structures', desc: 'MqlTick, MqlRates, MqlTradeRequest, MqlTradeResult: built-in structs that define the data contract between the program, terminal and server.' },
        { label: 'Explicit casting', desc: 'double-to-int conversions must be explicit; ambiguous long+double arithmetic produces warnings. Treat compiler warnings as review findings.' },
        { label: 'Templates', desc: 'MQL5 supports function and class templates, used for generic collections; relevant primarily when reading library code.' }
      ],
      code: `// strict mode is the only mode in MQL5

input group    "=== Risk ==="
input double   InpRiskPct   = 1.0;        // participates in optimization
sinput ulong   InpMagic     = 20241114;   // excluded from optimization

void OnTick()
{
   MqlTick tick;
   if(!SymbolInfoTick(_Symbol, tick))
   {
      Print("Failed to read tick");
      return;
   }

   // the tick struct carries the full price snapshot:
   double bid        = tick.bid;
   double ask        = tick.ask;
   long   timeMs     = tick.time_msc;       // milliseconds
   ulong  volumeTick = tick.volume;

   ENUM_TIMEFRAMES tf = PERIOD_CURRENT;
   PrintFormat("%s tf=%s bid=%.5f ask=%.5f ms=%lld",
               _Symbol, EnumToString(tf),
               bid, ask, timeMs);
}`,
      codeTitle: 'DataTypes.mq5'
    },
    useCase: {
      intro: 'Type selection guidance in MQL5:',
      items: [
        { when: 'Price snapshots for precise execution', why: 'MqlTick via SymbolInfoTick: one call yields bid, ask, last, volume and millisecond time. Preferable to separate SymbolInfoDouble calls for critical decisions.' },
        { when: 'Parameters excluded from optimization', why: 'sinput: magic numbers, live/demo flags, paths. Without sinput the optimizer sweeps these values, producing useless combinations.' },
        { when: 'Large monetary and volume values', why: 'double for money, long for accumulated tick volumes, ulong for identifiers. Wrong types overflow silently.' },
        { when: 'Complex strategy configuration', why: 'input group "..." organizes the dialog into named sections — a significant usability improvement for advisors with many parameters.' }
      ]
    },
    efficiency: {
      intro: 'Strictness improves speed by eliminating runtime defects at compile time:',
      tips: [
        { title: 'One MqlTick call over three Info calls', desc: 'SymbolInfoTick returns one atomic snapshot: bid and ask are guaranteed consistent with each other.', code: `MqlTick t;\nif(!SymbolInfoTick(_Symbol, t)) return;\ndouble spread = t.ask - t.bid;   // atomic and consistent` },
        { title: 'EnumToString for accurate logs', desc: 'Print EnumToString(ORDER_TYPE_BUY) instead of the numeric 0; journals become self-describing during audits.' },
        { title: 'sinput to shrink the optimization space', desc: 'Every input that participates multiplies the combination count. Marking non-strategy parameters sinput accelerates optimization substantially.' }
      ]
    },
    example: {
      title: 'Structured risk configuration with an atomic tick snapshot',
      code: `#include <Trade\\Trade.mqh>

input group "=== Strategy ==="
input int    InpMaPeriod  = 20;
input int    InpRsiPeriod = 14;
input group "=== Risk ==="
input double InpRiskPct   = 1.0;      // percent of balance per trade
input int    InpMaxSpread = 25;       // points
input group "=== System ==="
sinput ulong InpMagic     = 20241114;
sinput bool  InpAllowLive = false;    // manual safety flag

CTrade trade;

bool GetSpreadSnapshot(double &bid, double &ask, double &spreadPts)
{
   MqlTick tick;
   if(!SymbolInfoTick(_Symbol, tick)) return(false);
   bid       = tick.bid;
   ask       = tick.ask;
   spreadPts = (tick.ask - tick.bid) / _Point;
   return(true);
}

void OnTick()
{
   double bid, ask, spreadPts;
   if(!GetSpreadSnapshot(bid, ask, spreadPts)) return;
   if(spreadPts > InpMaxSpread) return;

   PrintFormat("[%s] spread=%.0f pt | equity=%.2f | magic=%llu",
               _Symbol, spreadPts,
               AccountInfoDouble(ACCOUNT_EQUITY),
               InpMagic);
}`,
      explanation: [
        'input group divides the advisor dialog into Strategy, Risk and System sections, keeping large parameter sets navigable.',
        'sinput on InpMagic and InpAllowLive keeps the magic number out of the optimizer and prevents safety flags from changing during optimization.',
        'GetSpreadSnapshot returns three values from one MqlTick, guaranteeing price consistency — impossible with three separate calls.',
        'The %llu format specifier for ulong and EnumToString() produce professional, unambiguous logs.'
      ]
    }
  },

  // ────────────────────────────────────────────────
  {
    id: 'oop',
    title: 'Object-Oriented Programming',
    subtitle: 'Classes, inheritance, interfaces and object pointers — the basis of large systems',
    icon: 'layers',
    keywords: 'class struct interface inheritance virtual override pointer getpointer new delete oop mql5 polymorphism state machine',
    syntax: {
      intro:
        'MQL5 is a fully object-oriented language: classes, inheritance, virtual functions, interfaces and object pointers. This is the primary reason large systems (multi-strategy, multi-symbol) are built on MQL5.',
      points: [
        { label: 'Classes and access modifiers', desc: 'public/protected/private with automatic constructors and destructors. C++-like members, without multiple inheritance (interfaces serve that role).' },
        { label: 'virtual and override', desc: 'A base class defines the contract: virtual int Evaluate(...); subclasses override it. Invocation through a base pointer is polymorphism — the core of pluggable strategies.' },
        { label: 'interface', desc: 'interface ISignal { int Evaluate(); } — a pure contract without implementation. Classes may implement multiple interfaces.' },
        { label: 'Object pointers (GetPointer / new)', desc: 'MQL5 has object pointers, not free-memory pointers: CObject *p = GetPointer(obj); or new. Objects are collected automatically unless allocated with new and deleted explicitly.' },
        { label: 'CObject and collections', desc: 'Standard Library collections (CArrayObj, CList) store CObject*. Custom classes inherit CObject to participate in managed collections.' },
        { label: 'struct vs class', desc: 'struct has value semantics (copied on assignment); class instances are referenced through pointers. Price data uses structs; system components use classes.' }
      ],
      code: `#include <Trade\\Trade.mqh>

//+------------------------------------------------------------------+
//| Signal contract — every strategy implements this interface       |
//+------------------------------------------------------------------+
interface ISignalEngine
{
   int  Evaluate();                        // +1 buy, -1 sell, 0 neutral
   string Name();
};

//+------------------------------------------------------------------+
//| Strategy 1: MA cross                                             |
//+------------------------------------------------------------------+
class CMaCrossSignal : public ISignalEngine
{
private:
   int    m_period;
   int    m_handle;
public:
         CMaCrossSignal(int period) : m_period(period)
   {
      m_handle = iMA(_Symbol, PERIOD_CURRENT, m_period, 0,
                     MODE_EMA, PRICE_CLOSE);
   }
        ~CMaCrossSignal() { if(m_handle != INVALID_HANDLE) IndicatorRelease(m_handle); }

   virtual int     Evaluate() override
   {
      double buf[];
      ArraySetAsSeries(buf, true);
      if(CopyBuffer(m_handle, 0, 1, 2, buf) < 2) return(0);
      return(buf[0] > buf[1] ? 1 : (buf[0] < buf[1] ? -1 : 0));
   }
   virtual string  Name() override { return("MA(" + IntegerToString(m_period) + ")"); }
};

//+------------------------------------------------------------------+
//| Orchestrator: holds strategies through the interface             |
//+------------------------------------------------------------------+
class CStrategyRunner
{
private:
   ISignalEngine *m_engines[];
public:
   void Add(ISignalEngine *engine)
   {
      int n = ArraySize(m_engines);
      ArrayResize(m_engines, n + 1);
      m_engines[n] = engine;
   }
   void Run()
   {
      for(int i = 0; i < ArraySize(m_engines); i++)
         PrintFormat("%s => %d", m_engines[i].Name(), m_engines[i].Evaluate());
   }
};`,
      codeTitle: 'OOP.mq5'
    },
    useCase: {
      intro: 'Where object orientation provides measurable returns in trading systems:',
      items: [
        { when: 'Multiple strategies in one advisor', why: 'The ISignalEngine interface plus a strategy array. Adding a strategy means adding one class and registering it; the orchestrator is unchanged. This is the pluggable architecture described on the Architecture page.' },
        { when: 'Multi-symbol advisors with per-symbol state', why: 'A CSymbolContext class stores handles, a state machine and statistics per symbol, eliminating error-prone parallel arrays.' },
        { when: 'Risk and execution as separate components', why: 'CRiskManager (sizing, drawdown guard) and CExecutionRouter (CTrade wrapper with retry) as classes with single responsibilities, replaceable without touching signals.' },
        { when: 'Chart-based user interfaces', why: 'OnChartEvent plus a CPanel class: buy/sell/pause buttons that call advisor methods, built on chart objects and custom events.' }
      ]
    },
    efficiency: {
      intro: 'Disciplined object orientation improves development speed; the following rules preserve runtime speed:',
      tips: [
        { title: 'Measure before virtualizing hot paths', desc: 'Virtual calls are individually cheap but measurable at 10,000 invocations per tick. Rule: virtual at component boundaries (per bar), not inside tick-level inner loops.' },
        { title: 'Define pointer ownership explicitly', desc: 'CArrayObj with FreeMode(true) deletes elements on Clear; mirror that in the owning class destructor. Single-ownership prevents double-free and leaks.' },
        { title: 'Construct in OnInit, use in OnTick', desc: 'Allocations on the tick path (new per tick) degrade performance and grow memory. All objects are built at initialization; OnTick only calls methods.' }
      ]
    },
    example: {
      title: 'A state machine as a class — the core of production advisors',
      code: `enum TRADE_STATE
{
   STATE_IDLE,           // waiting for a signal
   STATE_ENTRY_PENDING,  // order sent, awaiting confirmation
   STATE_MANAGING,       // position active: trailing or scaling
   STATE_EXIT_PENDING,   // exit sent, awaiting the deal
   STATE_COOLDOWN        // pause after an exit
};

class CTradeStateMachine
{
private:
   TRADE_STATE m_state;
   datetime    m_stateSince;
   int         m_attempts;

   void Change(TRADE_STATE next)
   {
      PrintFormat("STATE: %s -> %s", EnumToString(m_state), EnumToString(next));
      m_state      = next;
      m_stateSince = TimeCurrent();
      m_attempts   = 0;
   }

public:
         CTradeStateMachine() : m_state(STATE_IDLE), m_attempts(0) {}

   void OnTick(bool signalBuy, bool positionOpen, bool entryConfirmed,
               bool exitSent, bool cooldownOver)
   {
      switch(m_state)
      {
         case STATE_IDLE:
            if(signalBuy) Change(STATE_ENTRY_PENDING);
            break;

         case STATE_ENTRY_PENDING:
            if(entryConfirmed)       Change(STATE_MANAGING);
            else if(++m_attempts > 3) Change(STATE_IDLE);   // entry failed
            break;

         case STATE_MANAGING:
            if(exitSent)         Change(STATE_EXIT_PENDING);
            else if(!positionOpen) Change(STATE_COOLDOWN);  // SL/TP hit
            break;

         case STATE_EXIT_PENDING:
            if(!positionOpen) Change(STATE_COOLDOWN);
            break;

         case STATE_COOLDOWN:
            if(cooldownOver) Change(STATE_IDLE);
            break;
      }
   }

   TRADE_STATE State() { return(m_state); }
};`,
      explanation: [
        'A state machine eliminates the majority of double-execution and lost-continuation defects: every state has explicit exits and every transition is logged, which makes live incidents auditable.',
        'EnumToString on transitions produces human-readable journals: STATE: STATE_IDLE -> STATE_ENTRY_PENDING.',
        'm_attempts bounds retries in transitional states; permanent failures cannot loop indefinitely.',
        'On the Architecture page, this class is the core component of the Execution layer, paired with a risk manager holding veto rights.'
      ]
    }
  },

  // ────────────────────────────────────────────────
  {
    id: 'standard-library',
    title: 'Standard Library',
    subtitle: 'CTrade, CSymbolInfo, CArrayObj — the ready-made MetaQuotes classes',
    icon: 'book',
    keywords: 'ctrade csymbolinfo carrayobj cpositioninfo caccountinfo standard library include trade.mqh',
    syntax: {
      intro:
        'MQL5 ships an official Standard Library under MQL5\\Include: ready-made classes for trading, symbol information, collections, chart objects and panel UIs. Writing a modern advisor without it means reimplementing existing components.',
      points: [
        { label: 'CTrade', desc: 'Order wrapper: Buy(), Sell(), PositionOpen(), PositionClose(ticket), PositionModify(ticket, sl, tp). Configured once (magic, deviation, filling); every method follows the configuration.' },
        { label: 'CSymbolInfo', desc: 'RefreshRates() followed by Ask()/Bid()/LotStep()/StopsLevel() — symbol rules as an object, replacing scattered MarketInfo/SymbolInfoDouble calls.' },
        { label: 'CPositionInfo / COrderInfo / CHistoryOrderInfo', desc: 'Position, pending order and history iteration with narrative APIs: SelectByIndex(i), PositionType(), Profit().' },
        { label: 'CAccountInfo', desc: 'Balance(), Equity(), FreeMargin(), FreeMarginCheck(symbol, cmd, lot, price) — margin solvency check before sending orders.' },
        { label: 'CArrayObj / CList', desc: 'Collections of CObject pointers with automatic ownership (FreeMode) — the backbone of strategy lists, symbol lists and signal queues.' },
        { label: 'ChartObject and Controls families', desc: 'CChartObjectLabel/CButton for on-chart HUD elements; Controls for dialog panels — the basis of advisors with operational UIs.' }
      ],
      code: `#include <Trade\\Trade.mqh>
#include <Trade\\SymbolInfo.mqh>
#include <Trade\\PositionInfo.mqh>
#include <Trade\\AccountInfo.mqh>

CTrade         trade;
CSymbolInfo    symInfo;
CPositionInfo  pos;
CAccountInfo   acct;

int OnInit()
{
   trade.SetExpertMagicNumber(20241114);
   trade.SetDeviationInPoints(15);
   trade.SetTypeFillingBySymbol(_Symbol);

   symInfo.Name(_Symbol);
   return(INIT_SUCCEEDED);
}

void OnTick()
{
   if(!symInfo.RefreshRates()) return;

   // account and exposure audit
   double equity    = acct.Equity();
   double freeAfter = acct.FreeMarginCheck(_Symbol, ORDER_TYPE_BUY,
                                           0.10, symInfo.Ask());

   // audit positions owned by this advisor
   for(int i = PositionsTotal() - 1; i >= 0; i--)
   {
      if(!pos.SelectByIndex(i)) continue;
      if(pos.Magic() != 20241114 || pos.Symbol() != _Symbol) continue;

      PrintFormat("Position #%I64u %s lots=%.2f profit=%.2f",
                  pos.Ticket(), EnumToString(pos.PositionType()),
                  pos.Volume(), pos.Profit());

      // simple break-even via CTrade
      if(pos.Profit() > 50 && pos.StopLoss() < pos.PriceOpen())
         trade.PositionModify(pos.Ticket(), pos.PriceOpen(), pos.TakeProfit());
   }
}`,
      codeTitle: 'StdLib.mq5'
    },
    useCase: {
      intro: 'When to use each library class:',
      items: [
        { when: 'Any order execution', why: 'CTrade. Writing MqlTradeRequest manually is required only for exotic needs (custom OCO logic, specific filling configurations).' },
        { when: 'Risk calculations and volume validation', why: 'CSymbolInfo (LotStep/MinLot/MaxLot/StopsLevel) plus CAccountInfo.FreeMarginCheck — the two checks that prevent errors 131 and 134 before they occur.' },
        { when: 'Recurring position management', why: 'CPositionInfo loops for break-even, partial exits and trailing. Narrative APIs (pos.Profit(), pos.StopLoss()) make management logic read like intent.' },
        { when: 'Dynamic object registries', why: 'CArrayObj for tracked symbols, strategies and signal queues. FreeMode handles deallocation automatically.' }
      ]
    },
    efficiency: {
      intro: 'The Standard Library removes code; use it with the following discipline:',
      tips: [
        { title: 'Configure once in OnInit', desc: 'SetExpertMagicNumber, SetDeviationInPoints and SetTypeFillingBySymbol are one-time settings. SetTypeFillingBySymbol in particular prevents "Unsupported filling mode" errors on non-forex brokers.', code: `int OnInit()\n{\n   trade.SetExpertMagicNumber(magic);\n   trade.SetDeviationInPoints(15);\n   trade.SetTypeFillingBySymbol(_Symbol);  // required on several broker types\n   return(INIT_SUCCEEDED);\n}` },
        { title: 'RefreshRates() once per cycle', desc: 'CSymbolInfo.RefreshRates() at the start of OnTick makes all subsequent reads consistent with one snapshot, and is inexpensive.' },
        { title: 'Do not over-wrap', desc: 'A custom "SuperTrade" class around CTrade around raw requests is three abstraction layers for one order. The library is sufficient; add layers only for new behavior (retry, journaling).' }
      ]
    },
    example: {
      title: 'A fully validated entry using the library',
      code: `#include <Trade\\Trade.mqh>
#include <Trade\\SymbolInfo.mqh>
#include <Trade\\AccountInfo.mqh>

CTrade       trade;
CSymbolInfo  symInfo;
CAccountInfo acct;

input double InpRiskPct  = 1.0;
input int    InpSlPips   = 30;
input int    InpTpPips   = 60;
sinput ulong InpMagic    = 20241114;

bool OpenValidatedBuy()
{
   if(!symInfo.RefreshRates())
      return(false);

   // 1. normalize volume to broker rules
   double lot = 0.10;
   double step = symInfo.LotStep();
   lot = MathFloor(lot / step) * step;
   lot = MathMax(symInfo.LotsMin(), MathMin(symInfo.LotsMax(), lot));

   // 2. sufficient margin?
   if(acct.FreeMarginCheck(_Symbol, ORDER_TYPE_BUY, lot, symInfo.Ask()) < 0)
   {
      Print("Insufficient margin for lot ", DoubleToString(lot, 2));
      return(false);
   }

   // 3. respect the minimum broker stop distance
   double pipSize  = symInfo.Point() * ((symInfo.Digits() == 3 ||
                      symInfo.Digits() == 5) ? 10 : 1);
   double minDist  = symInfo.StopsLevel() * symInfo.Point();
   double slDist   = MathMax(InpSlPips * pipSize, minDist + symInfo.Point());
   double tpDist   = MathMax(InpTpPips * pipSize, minDist + symInfo.Point());

   double sl = symInfo.Ask() - slDist;
   double tp = symInfo.Ask() + tpDist;

   // 4. execution
   if(!trade.Buy(lot, _Symbol, 0.0,
                 NormalizeDouble(sl, symInfo.Digits()),
                 NormalizeDouble(tp, symInfo.Digits()), "codex-entry"))
   {
      PrintFormat("Buy failed: retcode=%d (%s)",
                  trade.ResultRetcode(),
                  trade.ResultRetcodeDescription());
      return(false);
   }
   PrintFormat("Buy executed: deal=%I64u price=%s",
               trade.ResultDeal(),
               DoubleToString(trade.ResultPrice(), symInfo.Digits()));
   return(true);
}`,
      explanation: [
        'Four validation layers (volume, margin, stops level, execution) are the minimal production pipeline; each layer rejects a distinct error class before the server is contacted.',
        'trade.ResultRetcodeDescription() translates the retcode into human-readable text, reducing execution debugging to seconds.',
        'ResultDeal and ResultPrice provide the execution trail for journals — audit material that MQL4 required manual history mining to obtain.',
        'MathMax(distance, stopsLevel) protects against brokers raising StopsLevel during news, so stop levels are valid on the first attempt.'
      ]
    }
  },

  // ────────────────────────────────────────────────
  {
    id: 'indikator-handle',
    title: 'Handle-Based Indicators',
    subtitle: 'iMA returns a handle, CopyBuffer returns data — the largest shift from MQL4',
    icon: 'trend',
    keywords: 'handle copybuffer indicatorrelease imaq5 indicator buffer async invalid_handle series',
    syntax: {
      intro:
        'In MQL5, iMA/iRSI and related functions do not return values. They return a handle: an identifier of a data service. Values are read asynchronously via CopyBuffer. One indicator service can serve many readers and many symbols — the foundation of multi-timeframe and multi-symbol advisors.',
      points: [
        { label: 'Creating a handle', desc: 'int h = iMA(_Symbol, PERIOD_H1, 20, 0, MODE_EMA, PRICE_CLOSE); — once, in OnInit. INVALID_HANDLE indicates failure and must be checked.' },
        { label: 'CopyBuffer(handle, buffer, start, count, array)', desc: 'Copies buffer values into an array. start=0 is the current bar; count=2 yields [0]=current and [1]=previous when ArraySetAsSeries(true) is set.' },
        { label: 'ArraySetAsSeries(arr, true)', desc: 'Reverses indexing direction so 0 = newest, consistent with MQL4 shift reasoning. Recommended for all price arrays.' },
        { label: 'Data availability', desc: 'CopyBuffer may fail on the first tick while the indicator computes. A return below count means retry on the next tick — a normal condition, not a fatal error.' },
        { label: 'IndicatorRelease(handle)', desc: 'Releases the indicator service. Handles never released accumulate over the advisor lifetime, particularly in multi-symbol advisors.' },
        { label: 'One handle per (symbol, timeframe, parameters)', desc: 'The terminal shares a single service for identical requests; different parameters create different services.' }
      ],
      code: `int g_rsiH1  = INVALID_HANDLE;
int g_emaM15 = INVALID_HANDLE;

int OnInit()
{
   // multi-timeframe: two services at once
   g_rsiH1  = iRSI(_Symbol, PERIOD_H1, 14, PRICE_CLOSE);
   g_emaM15 = iMA(_Symbol, PERIOD_CURRENT, 50, 0, MODE_EMA, PRICE_CLOSE);

   if(g_rsiH1 == INVALID_HANDLE || g_emaM15 == INVALID_HANDLE)
      return(INIT_FAILED);
   return(INIT_SUCCEEDED);
}

bool GetRsi(double &rsiValue)
{
   double buf[];
   ArraySetAsSeries(buf, true);
   // read two values: [0]=forming bar, [1]=completed bar
   if(CopyBuffer(g_rsiH1, 0, 0, 2, buf) < 2)
      return(false);            // data not ready — retry on next tick
   rsiValue = buf[1];           // completed bar: stable for signals
   return(true);
}

void OnDeinit(const int reason)
{
   IndicatorRelease(g_rsiH1);
   IndicatorRelease(g_emaM15);
}`,
      codeTitle: 'Handles.mq5'
    },
    useCase: {
      intro: 'New capabilities enabled by the handle model:',
      items: [
        { when: 'Multi-timeframe advisors (M15 entry, H1 filter)', why: 'Two handles and two CopyBuffer calls: the H1 trend filter and the M15 trigger inside one advisor, without cross-chart iCustom indirection.' },
        { when: 'Multi-symbol advisors (a grid across six pairs)', why: 'One handle per symbol stored in a context class; each symbol loop performs its own CopyBuffer. Scaling is linear and orderly.' },
        { when: 'Custom indicators as advisor data sources', why: 'iCustom also returns a handle in MQL5; the data pipeline is identical, so research indicators connect directly to production advisors.' },
        { when: 'Dashboards reading many indicators', why: 'Create all handles once and refresh values on a timer — one indicator service serves both display and logic.' }
      ]
    },
    efficiency: {
      intro: 'The handle model rewards the following usage patterns:',
      tips: [
        { title: 'Create handles in OnInit, never in OnTick', desc: 'Calling iMA in OnTick creates or looks up a service on every tick. A handle is infrastructure: built once, used continuously.', code: `// incorrect (inside OnTick)\ndouble v = iMA(_Symbol, 0, 20, 0, MODE_EMA, PRICE_CLOSE, ...); // MQL4-style\n\n// correct\ndouble buf[]; ArraySetAsSeries(buf, true);\nif(CopyBuffer(g_maHandle, 0, 1, 1, buf) == 1) v = buf[0];` },
        { title: 'Copy only what is needed', desc: 'For two values: CopyBuffer(handle, 0, 0, 2, buf). Do not copy 500 bars to read two.' },
        { title: 'Release every handle in OnDeinit', desc: 'Audit pairs: each i*/OnnxCreate/DatabaseOpen call must have a matching release/close guaranteed by OnDeinit or an owning destructor.' },
        { title: 'Handle "data not ready" gracefully', desc: 'CopyBuffer returning -1 on early ticks is normal; return(false) and wait for the next tick instead of retrying in a tight loop.' }
      ]
    },
    example: {
      title: 'A multi-timeframe advisor: H1 filter, M15 execution',
      code: `#include <Trade\\Trade.mqh>

CTrade trade;
input int    InpFastM15 = 12;
input int    InpSlowM15 = 26;
input int    InpTrendH1 = 200;
sinput ulong InpMagic   = 20241114;

int hFastM15 = INVALID_HANDLE, hSlowM15 = INVALID_HANDLE;
int hTrendH1 = INVALID_HANDLE;

int OnInit()
{
   trade.SetExpertMagicNumber(InpMagic);
   hFastM15 = iMA(_Symbol, PERIOD_M15, InpFastM15, 0, MODE_EMA, PRICE_CLOSE);
   hSlowM15 = iMA(_Symbol, PERIOD_M15, InpSlowM15, 0, MODE_EMA, PRICE_CLOSE);
   hTrendH1 = iMA(_Symbol, PERIOD_H1,  InpTrendH1, 0, MODE_EMA, PRICE_CLOSE);
   if(hFastM15 == INVALID_HANDLE || hSlowM15 == INVALID_HANDLE ||
      hTrendH1 == INVALID_HANDLE)
      return(INIT_FAILED);
   return(INIT_SUCCEEDED);
}

void OnDeinit(const int reason)
{
   IndicatorRelease(hFastM15);
   IndicatorRelease(hSlowM15);
   IndicatorRelease(hTrendH1);
}

bool CopyMA(int handle, double &prev, double &curr)
{
   double buf[];
   ArraySetAsSeries(buf, true);
   if(CopyBuffer(handle, 0, 0, 3, buf) < 3) return(false);
   prev = buf[2]; curr = buf[1];   // two completed bars
   return(true);
}

void OnTick()
{
   static datetime lastBar = 0;
   datetime cur = iTime(_Symbol, PERIOD_M15, 0);
   if(cur == lastBar) return;
   lastBar = cur;

   double fPrev, fCurr, sPrev, sCurr, tPrev, tCurr;
   if(!CopyMA(hFastM15, fPrev, fCurr)) return;
   if(!CopyMA(hSlowM15, sPrev, sCurr)) return;
   if(!CopyMA(hTrendH1, tPrev, tCurr)) return;

   bool trendUp = tCurr > 0 && fCurr > tCurr;        // price above the H1 trend
   bool crossUp = (fPrev <= sPrev) && (fCurr > sCurr);

   if(trendUp && crossUp && PositionsTotal() == 0)
      trade.Buy(0.10, _Symbol, 0.0, 0.0, 0.0, "MTF cross");
}`,
      explanation: [
        'Three handles are three parallel services: two on M15 (trigger) and one on H1 (direction filter). In MQL4 this required per-call PERIOD_H1 arguments; here it is a consistent data flow.',
        'CopyMA copies three values and reads the two completed bars (indices 2 and 1) — decisions use finished data only, immune to repaint.',
        'Returning false while data is not ready keeps the advisor smooth during the first seconds after attach, when higher-timeframe history may still be downloading.',
        'This is the "multi-source signal engine" pattern from the Architecture page: each source has a handle, a context and one output contract.'
      ]
    }
  },

  // ────────────────────────────────────────────────
  {
    id: 'trading',
    title: 'Trading: Positions, Orders and CTrade',
    subtitle: 'The MT5 position model, MqlTradeRequest and the modern execution flow',
    icon: 'chart',
    keywords: 'ctrade position order mqltraderequest mqltraderesult retcode filling mode positions total deal netting hedging',
    syntax: {
      intro:
        'MT5 separates two concepts that MQL4 merges: POSITIONS (active exposure per symbol) and ORDERS (requests: market and pending). Understanding this model makes the entire MQL5 trading API coherent.',
      points: [
        { label: 'Netting vs hedging accounts', desc: 'Netting: one aggregate position per symbol (buy 1 lot + buy 1 lot = one 2-lot position). Hedging: opposite trades form two coexisting positions. The mode is an account property, not a code choice.' },
        { label: 'MqlTradeRequest / MqlTradeResult', desc: 'The raw execution contract: action, symbol, volume, price, sl, tp, type_filling, magic. The result replies: retcode, deal, order, price, volume.' },
        { label: 'CTrade (the convenient path)', desc: 'Buy/Sell/PositionOpen/PositionClose/PositionModify/OrderDelete — fills the request and checks the retcode. Covers 95% of needs.' },
        { label: 'PositionsTotal / PositionGetTicket(i)', desc: 'Loop over active positions: ticket = PositionGetTicket(i) selects the context, then PositionGetDouble(POSITION_PROFIT) and related calls read data.' },
        { label: 'type_filling', desc: 'ORDER_FILLING_FOK (fill all or cancel), IOC (fill partial, cancel remainder), RETURN. Brokers differ; SetTypeFillingBySymbol resolves it automatically.' },
        { label: 'Retcode', desc: 'TRADE_RETCODE_DONE = success; REQUOTE/PRICE_CHANGED = retry; INVALID_STOPS/INVALID_VOLUME = fix parameters. Check trade.ResultRetcode(), not only the boolean result.' }
      ],
      code: `#include <Trade\\Trade.mqh>

CTrade trade;
input double InpLots = 0.10;
sinput ulong InpMagic = 20241114;

int OnInit()
{
   trade.SetExpertMagicNumber(InpMagic);
   trade.SetDeviationInPoints(20);
   trade.SetTypeFillingBySymbol(_Symbol);
   trade.SetAsyncMode(false);           // synchronous: the result is final
   return(INIT_SUCCEEDED);
}

//+------------------------------------------------------------------+
//| Position loop: the basis of management (trailing, break-even)    |
//+------------------------------------------------------------------+
void ManagePositions()
{
   for(int i = PositionsTotal() - 1; i >= 0; i--)
   {
      ulong ticket = PositionGetTicket(i);      // selects position context
      if(ticket == 0) continue;
      if(PositionGetString(POSITION_SYMBOL) != _Symbol) continue;
      if(PositionGetInteger(POSITION_MAGIC) != (long)InpMagic) continue;

      double profit  = PositionGetDouble(POSITION_PROFIT);
      double openPr  = PositionGetDouble(POSITION_PRICE_OPEN);
      double sl      = PositionGetDouble(POSITION_SL);
      long   type    = PositionGetInteger(POSITION_TYPE);

      PrintFormat("#%I64u %s lots=%.2f profit=%.2f sl=%s",
                  ticket, type == POSITION_TYPE_BUY ? "BUY" : "SELL",
                  PositionGetDouble(POSITION_VOLUME), profit,
                  DoubleToString(sl, _Digits));

      // break-even above +$50
      if(profit > 50 && sl < openPr)
         trade.PositionModify(ticket, openPr, PositionGetDouble(POSITION_TP));
   }
}

//+------------------------------------------------------------------+
//| Manual execution with MqlTradeRequest — low level                |
//+------------------------------------------------------------------+
bool RawMarketBuy(double lots, double sl, double tp)
{
   MqlTradeRequest req = {};
   MqlTradeResult  res = {};

   req.action       = TRADE_ACTION_DEAL;
   req.symbol       = _Symbol;
   req.volume       = lots;
   req.type         = ORDER_TYPE_BUY;
   req.price        = SymbolInfoDouble(_Symbol, SYMBOL_ASK);
   req.sl           = sl;
   req.tp           = tp;
   req.deviation    = 20;
   req.magic        = InpMagic;
   req.comment      = "raw-buy";
   req.type_filling = ORDER_FILLING_IOC;

   if(!OrderSend(req, res))
   {
      Print("OrderSend failed, error=", GetLastError());
      return(false);
   }
   PrintFormat("retcode=%u deal=%I64u price=%s",
               res.retcode, res.deal, DoubleToString(res.price, _Digits));
   return(res.retcode == TRADE_RETCODE_DONE || res.retcode == TRADE_RETCODE_PLACED);
}`,
      codeTitle: 'Trading.mq5'
    },
    useCase: {
      intro: 'Selecting the execution path and position model correctly:',
      items: [
        { when: 'Single-direction strategies (trend following)', why: 'Netting accounts fit: one aggregate position; CTrade.Buy/Sell reverses the position on an opposite signal. Simple and sufficient for most strategies.' },
        { when: 'Layered strategies (core plus hedge legs)', why: 'Hedging accounts: opposing trades coexist with separate tickets; manage legs through the ticket loop. Confirm the account is hedging before designing this way.' },
        { when: 'Standard execution', why: 'CTrade plus SetTypeFillingBySymbol plus ResultRetcode checks. Three configuration lines replace dozens of manual request fields.' },
        { when: 'Full control requirements (explicit IOC, precise partial closes)', why: 'Raw MqlTradeRequest: every field is explicit and every retcode is logged — also the path for reproducing broker-specific issues.' }
      ]
    },
    efficiency: {
      intro: 'Efficient MQL5 execution means few round-trips and always-read retcodes:',
      tips: [
        { title: 'One operation per decision', desc: 'CTrade.Buy with SL/TP in one call — a single round-trip. Avoid the ECN-era MQL4 pattern (open empty, then modify) on MT5 servers that accept stops directly.' },
        { title: 'Always inspect ResultRetcode', desc: 'trade.Buy() can fail for several reasons; only the retcode distinguishes requotes (REQUOTE/PRICE_CHANGED: retry) from parameter faults (INVALID_STOPS: do not retry).', code: `if(!trade.PositionClose(ticket))\n{\n   uint rc = trade.ResultRetcode();\n   bool transient = (rc == TRADE_RETCODE_REQUOTE ||\n                     rc == TRADE_RETCODE_PRICE_CHANGED ||\n                     rc == TRADE_RETCODE_CONNECTION);\n   if(!transient) return;   // do not retry permanent categories\n}` },
        { title: 'Iterate positions via PositionGetTicket', desc: 'GetTicket selects the context in one call — more compact and safer than manual PositionSelect; keep the backwards loop while closures occur mid-iteration.' }
      ]
    },
    example: {
      title: 'Closing all advisor positions correctly in MQL5',
      code: `#include <Trade\\Trade.mqh>
CTrade trade;
sinput ulong InpMagic = 20241114;

bool CloseAllOwnPositions()
{
   bool allClosed = true;

   for(int i = PositionsTotal() - 1; i >= 0; i--)
   {
      ulong ticket = PositionGetTicket(i);
      if(ticket == 0) continue;
      if(PositionGetString(POSITION_SYMBOL) != _Symbol) continue;
      if(PositionGetInteger(POSITION_MAGIC) != (long)InpMagic) continue;

      // backwards loop: closing shifts the remaining indices
      if(!trade.PositionClose(ticket))
      {
         uint rc = trade.ResultRetcode();
         PrintFormat("Close #%I64u failed retcode=%u (%s)",
                     ticket, rc, trade.ResultRetcodeDescription());

         // classification: only transient failures retry on the next tick
         if(rc != TRADE_RETCODE_REQUOTE &&
            rc != TRADE_RETCODE_PRICE_CHANGED &&
            rc != TRADE_RETCODE_CONNECTION)
            allClosed = false;
      }
   }
   return(allClosed);
}

void OnTick()
{
   // example trigger: flat all positions at session end
   if(TimeHour(TimeCurrent()) == 22)
      CloseAllOwnPositions();
}`,
      explanation: [
        'The backwards loop (PositionsTotal()-1 to 0) is structural, not stylistic: closing a position shifts the list, and backwards iteration keeps indices valid — the classic close-all defect is skipping half the positions.',
        'Symbol and magic filters restrict "close all" to this advisor\'s positions; without filters, user manual orders are closed as well.',
        'Retcode classification decides whether a failure retries on the next tick (transient) or is logged and alerted (permanent), matching the retry pattern of the MQL4 section with modern codes.',
        'Model note: on netting accounts one close per symbol suffices; on hedging accounts the ticket loop above is required. Code must know the account mode (ACCOUNT_MARGIN_MODE).'
      ]
    }
  },

  // ────────────────────────────────────────────────
  {
    id: 'timeseries',
    title: 'Timeseries and Data Access',
    subtitle: 'CopyRates, MqlRates, iTime — reading market history correctly',
    icon: 'database',
    keywords: 'copyrates mqlrates copyclose itime bars series history timeframe candle data',
    syntax: {
      intro:
        'MQL5 does not expose predefined Close[]/Time[] arrays. Market history is copied explicitly via the Copy* family into arrays or structs. This costs a step but grants full control: how much data, which timeframe, which symbol.',
      points: [
        { label: 'MqlRates', desc: 'A struct describing one candle: time, open, high, low, close, tick_volume, spread, real_volume. The primary unit of bar analysis.' },
        { label: 'CopyRates(symbol, tf, start, count, rates[])', desc: 'Copies candles into an MqlRates array. start=0 is the current bar with series indexing; an overload accepts a date range. Returns the number of bars copied.' },
        { label: 'CopyClose/CopyHigh and related', desc: 'Single-field variants: CopyClose(symbol, tf, 1, 50, closes) yields the last 50 closes. Lighter when one series suffices.' },
        { label: 'iTime/iHigh/iLow/iClose', desc: 'Still available in MQL5 for reading one value — iTime(_Symbol, PERIOD_H1, 1). Practical for new bar detection and single values.' },
        { label: 'Bars(symbol, tf)', desc: 'Number of available bars. Check before large copies; requesting more bars than exist returns fewer, not an error.' },
        { label: 'Return-value contract', desc: 'All Copy* functions return the element count; a return below the requested count means incomplete data. Always check before using the array.' }
      ],
      code: `void AnalyzeLastBars()
{
   MqlRates rates[];
   ArraySetAsSeries(rates, true);        // [0] = current bar

   int copied = CopyRates(_Symbol, PERIOD_CURRENT, 0, 50, rates);
   if(copied < 50)
   {
      Print("Incomplete data: ", copied, "/", 50);
      return;
   }

   // last completed candle = rates[1]
   double range = rates[1].high - rates[1].low;
   double body  = MathAbs(rates[1].close - rates[1].open);
   bool   bull  = rates[1].close > rates[1].open;

   // 20-bar swing high (bars 1..20)
   double highest = rates[1].high;
   for(int i = 2; i <= 20; i++)
      if(rates[i].high > highest) highest = rates[i].high;

   PrintFormat("Bar %s: range=%s body=%.0f%% bull=%s swingHigh=%s",
               TimeToString(rates[1].time, TIME_MINUTES),
               DoubleToString(range, _Digits),
               range > 0 ? body / range * 100 : 0,
               bull ? "yes" : "no",
               DoubleToString(highest, _Digits));
}

void OnTick()
{
   // new bar detection: a single value suffices
   static datetime last = 0;
   datetime cur = iTime(_Symbol, PERIOD_CURRENT, 0);
   if(cur != last) { last = cur; AnalyzeLastBars(); }
}`,
      codeTitle: 'Timeseries.mq5'
    },
    useCase: {
      intro: 'Matching the data tool to the workload:',
      items: [
        { when: 'Multi-field candle analysis (patterns, wicks, bodies)', why: 'CopyRates with MqlRates: one copy yields open/high/low/close/volume/spread for clean pattern loops.' },
        { when: 'A single price series (closes for a manual average)', why: 'CopyClose — lighter in memory and bandwidth than a full MqlRates copy.' },
        { when: 'New bar detection and bar open times', why: 'iTime for a single value — compact, using the static datetime comparison pattern.' },
        { when: 'Multi-symbol advisors on one chart', why: 'CopyRates("GBPUSD", PERIOD_H1, ...) runs from an EA attached to EURUSD — the official path for dashboards and portfolio advisors, in contrast to the fragile MQL4 equivalents.' }
      ]
    },
    efficiency: {
      intro: 'Data access cost multiplies quickly; the conservation rules:',
      tips: [
        { title: 'Copy the minimum, history sufficient', desc: 'For 50 bars, request 50, not 1000. Indicator handles (previous topic) are more efficient still, since the terminal computes once for all readers.' },
        { title: 'Copy on bar events, not per tick', desc: 'Completed bar values never change; there is no reason to re-copy 50 candles on every tick.' },
        { title: 'Set series indexing once, consistently', desc: 'Choose one indexing convention project-wide (series=true recommended) and follow it. Mixed conventions cause most MQL5 off-by-one defects.' },
        { title: 'Check returns to prevent out-of-range', desc: 'if(copied < needed) return; — a shorter-than-expected array is the safety contract of every Copy* call.' }
      ]
    },
    example: {
      title: 'Pin bar detection over MqlRates candle structure',
      code: `struct PatternResult
{
   bool   isPin;
   double slLevel;      // above/below the pin extreme
   string note;
};

PatternResult DetectPinBar(const MqlRates &r)   // by reference: no copy
{
   PatternResult res;
   res.isPin  = false;
   res.slLevel = 0;
   res.note   = "";

   double range = r.high - r.low;
   if(range <= 0) return(res);

   double upperWick = r.high - MathMax(r.open, r.close);
   double lowerWick = MathMin(r.open, r.close) - r.low;
   double body      = MathAbs(r.close - r.open);

   // bearish pin: upper wick over 60% of range, small body below
   if(upperWick > range * 0.6 && body < range * 0.25)
   {
      res.isPin   = true;
      res.slLevel = r.high + range * 0.1;
      res.note    = "bearish pin";
   }
   // bullish pin: dominant lower wick
   else if(lowerWick > range * 0.6 && body < range * 0.25)
   {
      res.isPin   = true;
      res.slLevel = r.low - range * 0.1;
      res.note    = "bullish pin";
   }
   return(res);
}

void OnTick()
{
   static datetime last = 0;
   datetime cur = iTime(_Symbol, PERIOD_CURRENT, 0);
   if(cur == last) return;
   last = cur;

   MqlRates rates[];
   ArraySetAsSeries(rates, true);
   if(CopyRates(_Symbol, PERIOD_CURRENT, 0, 3, rates) < 3) return;

   PatternResult p = DetectPinBar(rates[1]);   // completed bar
   if(p.isPin)
      PrintFormat("PIN BAR %s | SL level=%s",
                  p.note, DoubleToString(p.slLevel, _Digits));
}`,
      explanation: [
        'DetectPinBar receives const MqlRates &r — pass by reference without copying and without modification, a clean data contract enabled by struct usage.',
        'The pattern result is a struct (isPin + slLevel + note): the signal carries context, namely a defensible stop level, ready for the risk and execution layers.',
        'Analysis runs exactly once per bar against rates[1] (a completed bar): zero repaint and zero recomputation.',
        'This maps directly to the Signal Engine of the Architecture page: data reading, pattern detection, then execution layers.'
      ]
    }
  },

  // ────────────────────────────────────────────────
  {
    id: 'event-model',
    title: 'Advanced Event Model',
    subtitle: 'OnTradeTransaction, OnChartEvent, custom events — account-aware, interactive advisors',
    icon: 'workflow',
    keywords: 'ontradetransaction onchartevent eventchartcustom chart event custom keypress click panel transaction',
    syntax: {
      intro:
        'The MQL5 event model turns an advisor from a price reactor into a system reactor: programs can react to account transactions, chart clicks, keystrokes and inter-program events. This enables operational panels, automatic journaling and multi-advisor coordination.',
      points: [
        { label: 'OnTradeTransaction(trans, request, result)', desc: 'Invoked on every trading event: orders added/filled/removed, deals recorded, positions changed. trans.type distinguishes them (TRADE_TRANSACTION_DEAL_ADD, ORDER_ADD, ...).' },
        { label: 'Reading an incoming deal', desc: 'trans.deal is the deal ticket; complete the data via HistoryDealSelect(trans.deal), then HistoryDealGetDouble(DEAL_PROFIT) and related calls — full context for every execution.' },
        { label: 'OnChartEvent(id, lparam, dparam, sparam)', desc: 'Handles CHARTEVENT_OBJECT_CLICK (chart buttons), CHARTEVENT_KEYDOWN, CHARTEVENT_MOUSE_MOVE and CHARTEVENT_CUSTOM+n (custom events).' },
        { label: 'EventChartCustom', desc: 'Sends custom events between charts/advisors: EventChartCustom(chartId, evcode, lparam, dparam, "payload") — lightweight coordination between programs in one terminal.' },
        { label: 'OnTimer as an alternative heartbeat', desc: 'EventSetMillisecondTimer drives light dashboard refreshes, paired with OnChartEvent for interactive UIs.' }
      ],
      code: `#include <Trade\\Trade.mqh>
CTrade trade;

//+------------------------------------------------------------------+
//| Automatic journaling: record every incoming deal                 |
//+------------------------------------------------------------------+
void OnTradeTransaction(const MqlTradeTransaction &trans,
                        const MqlTradeRequest &request,
                        const MqlTradeResult &result)
{
   if(trans.type != TRADE_TRANSACTION_DEAL_ADD) return;

   if(!HistoryDealSelect(trans.deal))
   {
      Print("Deal not yet in history: ", trans.deal);
      return;
   }

   long   entry  = HistoryDealGetInteger(trans.deal, DEAL_ENTRY);
   long   dtype  = HistoryDealGetInteger(trans.deal, DEAL_TYPE);
   double profit = HistoryDealGetDouble(trans.deal, DEAL_PROFIT);
   double volume = HistoryDealGetDouble(trans.deal, DEAL_VOLUME);
   string sym    = HistoryDealGetString(trans.deal, DEAL_SYMBOL);

   if(entry == DEAL_ENTRY_OUT)
      PrintFormat("[CLOSED] %s %s vol=%.2f profit=%.2f",
                  sym, dtype == DEAL_TYPE_BUY ? "buy" : "sell",
                  volume, profit);
}

//+------------------------------------------------------------------+
//| A simple chart button panel                                      |
//+------------------------------------------------------------------+
int OnInit()
{
   ObjectCreate(0, "btnCloseAll", OBJ_BUTTON, 0, 0, 0);
   ObjectSetInteger(0, "btnCloseAll", OBJPROP_CORNER, CORNER_RIGHT_UPPER);
   ObjectSetInteger(0, "btnCloseAll", OBJPROP_XDISTANCE, 120);
   ObjectSetInteger(0, "btnCloseAll", OBJPROP_YDISTANCE, 30);
   ObjectSetInteger(0, "btnCloseAll", OBJPROP_XSIZE, 110);
   ObjectSetInteger(0, "btnCloseAll", OBJPROP_YSIZE, 28);
   ObjectSetString(0, "btnCloseAll", OBJPROP_TEXT, "CLOSE ALL");
   return(INIT_SUCCEEDED);
}

void OnChartEvent(const int id, const long &lparam, const double &dparam,
                  const string &sparam)
{
   if(id == CHARTEVENT_OBJECT_CLICK && sparam == "btnCloseAll")
   {
      Print("CLOSE ALL button pressed");
      // ... invoke the advisor close-all logic
      ObjectSetInteger(0, "btnCloseAll", OBJPROP_STATE, false);
   }
}`,
      codeTitle: 'Events.mq5'
    },
    useCase: {
      intro: 'Capabilities opened by the event model:',
      items: [
        { when: 'Automatic execution journals', why: 'OnTradeTransaction with DEAL_ENTRY_OUT records profit/loss for every closure — the basis of live statistics and anomaly alerts without polling.' },
        { when: 'Advisors with operational buttons', why: 'OBJ_BUTTON plus CHARTEVENT_OBJECT_CLICK: close-all, pause and mode switching, keeping manual control above automation.' },
        { when: 'Multi-advisor coordination', why: 'EventChartCustom between charts: a master broadcasts decisions (pause all during news) and other advisors respond — a lightweight orchestrator without files or sockets.' },
        { when: 'Keyboard-confirmed entries', why: 'CHARTEVENT_KEYDOWN with B/S keys: the advisor produces signals, the trader approves with one keystroke — a human-in-the-loop pattern.' }
      ]
    },
    efficiency: {
      intro: 'Some events are cheap, others are expensive:',
      tips: [
        { title: 'Filter on trans.type first', desc: 'One order generates several transactions (REQUEST, ORDER_ADD, DEAL_ADD). Exit immediately for unhandled types.' },
        { title: 'Keep OnChartEvent handlers light', desc: 'Set flags or state in the handler; heavy work (execution, computation) belongs to OnTick/OnTimer. UI handlers must finish in microseconds to keep the chart smooth.' },
        { title: 'Separate UI timers from logic', desc: 'A 250 ms timer refreshes labels; logic stays on bar events. Never place UI refresh inside OnTick.' },
        { title: 'Prefix chart objects and clean them', desc: 'Name objects "codex_*" and call ObjectsDeleteAll(0, "codex_") in OnDeinit so the user chart is left clean.' }
      ]
    },
    example: {
      title: 'Semi-automated entries: advisor signals with trader confirmation',
      code: `#include <Trade\\Trade.mqh>
CTrade trade;

bool   g_signalPending = false;
string g_pendingNote   = "";

// signal from the strategy logic (simplified here)
void CheckSignal()
{
   static datetime last = 0;
   datetime cur = iTime(_Symbol, PERIOD_CURRENT, 0);
   if(cur == last) return;
   last = cur;

   double buf[];
   ArraySetAsSeries(buf, true);
   int h = iRSI(_Symbol, PERIOD_CURRENT, 14, PRICE_CLOSE);
   if(CopyBuffer(h, 0, 1, 1, buf) == 1 && buf[0] < 30)
   {
      g_signalPending = true;
      g_pendingNote   = StringFormat("RSI %.1f @ %s", buf[0],
                        TimeToString(cur, TIME_MINUTES));
   }
   IndicatorRelease(h);
}

void OnTick()
{
   CheckSignal();
}

void OnChartEvent(const int id, const long &lparam, const double &dparam,
                  const string &sparam)
{
   if(id != CHARTEVENT_KEYDOWN) return;

   // 66 = \'B\', 83 = \'S\'
   if(g_signalPending && lparam == 66)          // B approves the buy
   {
      double ask = SymbolInfoDouble(_Symbol, SYMBOL_ASK);
      double sl  = NormalizeDouble(ask - 300 * _Point, _Digits);
      double tp  = NormalizeDouble(ask + 600 * _Point, _Digits);
      trade.Buy(0.10, _Symbol, 0.0, sl, tp, "confirmed " + g_pendingNote);
      g_signalPending = false;
   }
   else if(g_signalPending && lparam == 83)     // S rejects
   {
      g_signalPending = false;
      Print("Signal rejected by trader");
   }
}`,
      explanation: [
        'Human-in-the-loop automation: the advisor computes signals with discipline, the trader retains the trigger for context that is difficult to encode (major events). This is a common transition stage before full automation.',
        'g_signalPending is cross-event state — the same pattern as the state machine in the OOP topic: keyboard events may only act on valid state.',
        'The RSI handle in this example is created and released at the point of use for brevity; production code moves it to OnInit/OnDeinit per the Handle-Based Indicators topic.',
        'Combined with the Standard Library topic (OBJ_BUTTON), this pattern forms a complete operational panel: signal arrives, button activates, trader confirms, OnTradeTransaction journals the result.'
      ]
    }
  },

  // ────────────────────────────────────────────────
  {
    id: 'strategy-tester',
    title: 'Strategy Tester and Optimization',
    subtitle: 'Real ticks, multi-currency, custom criteria — the MQL5 research laboratory',
    icon: 'flask',
    keywords: 'strategy tester backtest optimization real ticks genetic ontester custom criterion forward testing walk forward',
    syntax: {
      intro:
        'The MT5 Strategy Tester is a complete research laboratory: real-tick execution from broker tick data, multi-symbol backtests in one run, genetic optimization, and custom scoring via OnTester. This is the strongest technical argument for MQL5 in serious research.',
      points: [
        { label: 'Execution models', desc: '"Every tick based on real ticks" (most accurate, broker tick data), "1 minute OHLC", and "Open prices only" (fast, for per-bar advisors). The model must match the strategy granularity.' },
        { label: 'Multi-symbol backtests', desc: 'Select several symbols in the tester; one EA trades the portfolio and results are consolidated — impossible as an official feature in MQL4.' },
        { label: 'double OnTester()', desc: 'After the backtest, the EA returns a score. With "Custom max" as the optimization criterion, the genetic algorithm maximizes that score instead of raw profit.' },
        { label: 'TesterStatistics()', desc: 'Inside OnTester: read profit factor, drawdown, trade count and other metrics to compose a custom score.' },
        { label: 'Frames and visual optimization', desc: 'OnTesterPass/OnTesterDeinit plus FrameAdd send per-pass data to a chart for custom distribution visualizations.' },
        { label: 'Deposit, leverage and delays', desc: 'Configure initial deposit, leverage and execution delay. Latency simulation is decisive for scalping strategies.' }
      ],
      code: `#property tester_no_cache   // do not cache pass results

sinput bool InpUseCustomScore = true;

//+------------------------------------------------------------------+
//| Custom score: profit adjusted for drawdown and trade count       |
//+------------------------------------------------------------------+
double OnTester()
{
   double profit       = TesterStatistics(STAT_PROFIT);
   double profitFactor = TesterStatistics(STAT_PROFIT_FACTOR);
   double maxDD        = TesterStatistics(STAT_EQUITY_DDREL_PERCENT);
   double trades       = TesterStatistics(STAT_TRADES);

   // quality over quantity: require a statistically meaningful sample,
   // penalize large drawdowns, cap the profit factor bonus
   if(trades < 100) return(0);

   double ddPenalty = 1.0 / (1.0 + maxDD / 10.0);
   double pfBonus   = MathMin(profitFactor, 3.0);   // cap: PF above 3 is usually overfit
   double score     = profit * ddPenalty * pfBonus;

   PrintFormat("Score=%.2f (profit=%.2f DD=%.1f%% PF=%.2f n=%.0f)",
               score, profit, maxDD, profitFactor, trades);
   return(score);
}`,
      codeTitle: 'OnTester.mq5'
    },
    useCase: {
      intro: 'Research workflows that use the tester fully:',
      items: [
        { when: 'Validating a new strategy before live use', why: 'Real ticks over one to two years reveal behavior under genuine spread and slippage. An advisor that performs well on open prices may fail on real ticks — this must be known before capital is exposed.' },
        { when: 'Multi-pair portfolios', why: 'Multi-symbol backtests test interactions between positions (margin, shared exposure) that per-pair tests never reveal.' },
        { when: 'Optimization without overfitting', why: 'A custom score with drawdown penalties and minimum trade counts forces the optimizer toward robust parameters rather than lucky ones.' },
        { when: 'Lightweight walk-forward', why: 'Optimize on period A, validate unchanged parameters on period B, repeat with a shift. Out-of-sample consistency is the only evidence against overfitting.' }
      ]
    },
    efficiency: {
      intro: 'Efficient optimization: small search spaces, honest scores, fast modes during exploration:',
      tips: [
        { title: 'Coarse exploration on fast models, finals on real ticks', desc: 'Run a 500-combination grid on "1 minute OHLC" first, then test the top 20 candidates on real ticks. This order saves tens of hours.' },
        { title: 'Lock non-strategy parameters with sinput', desc: 'Magic numbers, paths and debug flags must not join the grid; each participating input multiplies combinations.' },
        { title: 'Cap bonuses that overfit easily', desc: 'Profit factors above 3 over 100+ trades are usually sampling artifacts. Honest scores keep optimization results trustworthy out of sample.', code: `double pfBonus = MathMin(profitFactor, 3.0);\ndouble score = profit * (1.0 / (1.0 + maxDD / 10.0)) * pfBonus;` },
        { title: 'tester_no_cache while iterating on code', desc: 'During code changes, disable pass caching so stale results are not mistaken for new ones.' }
      ]
    },
    example: {
      title: 'A manual walk-forward protocol in three steps',
      code: `/*
  LIGHTWEIGHT WALK-FORWARD PROTOCOL (executed manually in the tester)

  Data: EURUSD H1, 2021-2024 (4 years)

  STEP 1 — Optimization (in-sample)
    Period   : 2021.01.01 - 2022.12.31
    Model    : 1 minute OHLC (fast, for grid exploration)
    Criterion: Custom max (the OnTester score in this file)
    Grid     : MaPeriod 10..60 step 5, SlPips 20..60 step 10

  STEP 2 — Validation (out-of-sample)
    Period   : 2023.01.01 - 2023.12.31  (never seen by the optimizer)
    Model    : Every tick based on real ticks
    Parameters: TOP 3 scores from step 1, unchanged
    Accept if: profit > 0 AND PF > 1.15 AND DD < 20%

  STEP 3 — Stress before live
    Period   : 2024.01.01 - 2024.12.31
    Add      : execution delay 100-300ms, spread +20% (tester settings)
    Accept if still positive -> one month on demo -> small live size
*/

double OnTester()
{
   double profit = TesterStatistics(STAT_PROFIT);
   double dd     = TesterStatistics(STAT_EQUITY_DDREL_PERCENT);
   double pf     = TesterStatistics(STAT_PROFIT_FACTOR);
   double n      = TesterStatistics(STAT_TRADES);

   if(n < 100)          return(0);   // sample too small
   if(dd > 25)          return(0);   // large drawdown: eliminated
   if(profit <= 0)      return(0);

   return(profit / (1.0 + dd) * MathMin(pf, 2.5));
}`,
      explanation: [
        'OnTester is the scoring function: it defines what a good result means numerically. Without it, the optimizer maximizes raw profit and consistently selects the most overfit combinations.',
        'The three-step protocol separates data seen by the optimizer (in-sample) from validation data (out-of-sample) — the core of backtesting methodology.',
        'The third step (delay and wider spread) simulates worst-case live conditions; strategies surviving it proceed to demo.',
        'Architecture link: parameters read via input (never hard-coded) are what make this protocol possible — external configuration is a precondition for repeatable research.'
      ]
    }
  },

  // ────────────────────────────────────────────────
  {
    id: 'onnx-ml',
    title: 'ONNX and Machine Learning',
    subtitle: 'Model inference inside the advisor — no server, no DLL',
    icon: 'brain',
    keywords: 'onnx machine learning ai model inference onnxrun onnxcreate matrix neural network prediction',
    syntax: {
      intro:
        'MQL5 embeds an ONNX runtime: models trained in Python (PyTorch/scikit-learn) are exported to .onnx and executed directly inside the advisor via OnnxRun. This is the largest functional gap versus MQL4, where all inference required WebRequest or DLL bridges.',
      points: [
        { label: 'The pipeline', desc: 'Python: train, export to ONNX with frozen feature order, place the file in MQL5\\Files, OnnxCreate, set input/output shapes, OnnxRun per bar, OnnxRelease.' },
        { label: 'OnnxCreate("model.onnx", ONNX_DEFAULT)', desc: 'Loads a model from Files (or an embedded #resource). INVALID_HANDLE indicates failure; always check.' },
        { label: 'OnnxSetInputShape / OnnxSetOutputShape', desc: 'Declares tensor shapes when the model does not carry them explicitly, for example {1, 10} = one sample of ten features.' },
        { label: 'OnnxRun(handle, flags, input, output)', desc: 'Synchronous inference: float arrays or matrices in, outputs written back. Fast for small models (microseconds to milliseconds).' },
        { label: 'Native matrix and vector types', desc: 'MQL5 provides matrix and vector types (a light NumPy analog) for feature engineering without manual loops.' },
        { label: 'The feature contract', desc: 'The feature order and scaling used during training must be replicated exactly in MQL5 — the most common ML integration defect.' }
      ],
      code: `// model.onnx: trained in Python, input [1, N_FEATURE], output [1,1]
#resource "model.onnx" as uchar modelData[]   // optional: embed into the EA

long   g_onnx = INVALID_HANDLE;
int    N_FEATURE = 10;

int OnInit()
{
   g_onnx = OnnxCreate("model.onnx", ONNX_DEFAULT);
   if(g_onnx == INVALID_HANDLE)
   {
      Print("Failed to load the ONNX model");
      return(INIT_FAILED);
   }

   long inShape[]  = {1, N_FEATURE};
   long outShape[] = {1, 1};
   if(!OnnxSetInputShape(g_onnx, 0, inShape) ||
      !OnnxSetOutputShape(g_onnx, 0, outShape))
   {
      Print("Shape mismatch with the model");
      return(INIT_FAILED);
   }
   return(INIT_SUCCEEDED);
}

void OnDeinit(const int reason)
{
   if(g_onnx != INVALID_HANDLE) OnnxRelease(g_onnx);
}

//+------------------------------------------------------------------+
//| Build features EXACTLY as during training (order and scale)      |
//+------------------------------------------------------------------+
bool BuildFeatures(float &features[])
{
   MqlRates rates[];
   ArraySetAsSeries(rates, true);
   if(CopyRates(_Symbol, PERIOD_CURRENT, 1, 40, rates) < 40) return(false);

   ArrayResize(features, N_FEATURE);
   // example features: 5/10/20-bar relative returns, range ratio
   for(int k = 0; k < 5; k++)
      features[k] = (float)((rates[1 + k].close - rates[2 + k].close)
                            / rates[2 + k].close);
   features[5] = (float)((rates[1].high - rates[1].low) / rates[1].close);
   // ... remaining features follow the training notebook
   return(true);
}

void OnTick()
{
   static datetime lastBar = 0;
   datetime cur = iTime(_Symbol, PERIOD_CURRENT, 0);
   if(cur == lastBar) return;
   lastBar = cur;

   float features[];
   if(!BuildFeatures(features)) return;

   float output[1];
   if(!OnnxRun(g_onnx, ONNX_DEBUG_LOGS, features, output))
   {
      Print("OnnxRun failed, error=", GetLastError());
      return;
   }

   double probUp = output[0];   // e.g. classification P(up)
   PrintFormat("P(up) = %.3f", probUp);
   if(probUp > 0.62)
      Print("SIGNAL: high up-probability");
}`,
      codeTitle: 'ONNX.mq5'
    },
    useCase: {
      intro: 'When in-advisor inference is appropriate, and when it is not:',
      items: [
        { when: 'Lightweight per-bar models (direction classifiers, signal filters)', why: 'Small sklearn/XGBoost models exported to ONNX run in microseconds per bar — ideal as probabilistic filters above deterministic signals.' },
        { when: 'Advisors deployed on plain VPS instances', why: 'No Python server, no ports, no URL allowlists; one .onnx file travels with the advisor. Deployment equals a standard advisor.' },
        { when: 'Backtests consistent with live behavior', why: 'OnnxRun runs inside the tester as well, so the identical model is validated on real ticks. External inference cannot be backtested this way.' },
        { when: 'Large models, active retraining, heavy ensembles', why: 'Keep the external path (WebRequest to Python). Native ONNX suits small, stable models; see the Architecture page for the comparison.' }
      ]
    },
    efficiency: {
      intro: 'In-advisor ML is efficient only with disciplined data contracts:',
      tips: [
        { title: 'One source of truth for features', desc: 'Write the feature builder once, ideally generated from the training notebook or a shared specification table. Divergent features between Python and MQL5 mean the model consumes invalid input.' },
        { title: 'Inference per bar, not per tick', desc: 'Bar-direction probability does not meaningfully change 50 times within one bar. Run OnnxRun on the bar event for consistent logic and stable CPU load.' },
        { title: 'Validate model output', desc: 'Models emit NaN or out-of-range values on anomalous features; validate before using output as a signal.', code: `double p = output[0];\nif(!(p >= 0.0 && p <= 1.0))   // NaN fails this check as well\n{\n   Print("Invalid model output: ", p);\n   return;\n}` },
        { title: 'Record the model version', desc: 'Store the model name/version in order comments and journals; during later audits it identifies which model produced each decision.' }
      ]
    },
    example: {
      title: 'The Python export script and the two-world contract',
      code: `# train_and_export.py  (runs OUTSIDE MT5, once per model)
import pandas as pd
from sklearn.ensemble import GradientBoostingClassifier
from skl2onnx import to_onnx
import numpy as np

# 1. features IDENTICAL to BuildFeatures() in MQL5:
#    5 relative returns + range ratio + ... (see the contract table)
FEATURES = ["ret1", "ret2", "ret3", "ret4", "ret5", "range_ratio", ...]

df = pd.read_csv("eurusd_h1.csv")          # exported advisor journal
X, y = df[FEATURES], df["target_up"]       # label: next close higher?

clf = GradientBoostingClassifier().fit(X, y)

# 2. export to ONNX with explicit shapes
onx = to_onnx(clf, X[:1].astype(np.float32),
              options={id(clf): {"zipmap": False}})
with open("model.onnx", "wb") as f:
    f.write(onx.SerializeToString())

# 3. place model.onnx in MQL5/Files -> OnnxCreate in the advisor
print("model.onnx ready. Feature order MUST match MQL5:",
      list(FEATURES))`,
      flavor: 'python',
      explanation: [
        'skl2onnx wraps a scikit-learn model into a single .onnx file: no server and no Python runtime on the trading VPS.',
        'The final line is the critical one: the feature order contract. The leading ML-trading defect is differently ordered features on the training and inference sides.',
        'Training data originates from the advisor CSV/SQLite journal (see Arrays and Strings, and Database and File I/O): the advisor produces data, the data trains the model, the model returns to the advisor.',
        'For the full architecture (training loops, ensembles, multiple models), see the Architecture page, which compares native ONNX with the REST pattern.'
      ]
    }
  },

  // ────────────────────────────────────────────────
  {
    id: 'database-file',
    title: 'Database and File I/O',
    subtitle: 'Built-in SQLite, CSV and binary files — proper persistence for advisors',
    icon: 'server',
    keywords: 'sqlite database fileopen filewrite csv binary persistence journal resource',
    syntax: {
      intro:
        'MQL5 includes a native SQLite client: full SQL inside the advisor without DLLs. Together with the File* family (CSV, TXT, binary), programs have proper persistence for journals, restart-surviving state and training datasets.',
      points: [
        { label: 'DatabaseOpen("journal.db", DATABASE_OPEN_READWRITE | DATABASE_OPEN_CREATE)', desc: 'Opens or creates a database in MQL5\\Files. Returns an int handle; INVALID_HANDLE on failure.' },
        { label: 'DatabasePrepare / DatabaseBind / DatabaseRead', desc: 'Prepare an SQL statement, bind parameters (?) and read rows until exhausted, then DatabaseFinalize. Parameter binding prevents quoting defects.' },
        { label: 'A trade journal table', desc: 'Minimal schema: trades(id, time, symbol, side, lots, entry, exit, profit, magic, comment). INSERT from OnTradeTransaction produces a journal without polling.' },
        { label: 'The FileOpen family', desc: 'FILE_CSV (FileWrite per column), FILE_TXT (text lines), FILE_BIN (raw structs, fast for large caches). FILE_COMMON is a folder shared across terminals.' },
        { label: 'Database versus file', desc: 'Database: relational data with aggregate queries (daily statistics per pair). CSV: exchange with Excel/Python. BIN: internal caches at volume.' },
        { label: '#resource', desc: 'Embeds files (ONNX models, images, small binaries) into the compiled EA for single-file deployment.' }
      ],
      code: `#include <Trade\\Trade.mqh>

int g_db = INVALID_HANDLE;

int OnInit()
{
   g_db = DatabaseOpen("codex_journal.db",
                       DATABASE_OPEN_READWRITE | DATABASE_OPEN_CREATE);
   if(g_db == INVALID_HANDLE)
   {
      Print("DatabaseOpen failed: ", GetLastError());
      return(INIT_FAILED);
   }

   // idempotent: created once regardless of restart count
   DatabaseExecute(g_db,
      "CREATE TABLE IF NOT EXISTS trades ("
      " id INTEGER PRIMARY KEY AUTOINCREMENT,"
      " ts TEXT NOT NULL,"
      " symbol TEXT, side TEXT, lots REAL,"
      " entry REAL, exit_price REAL, profit REAL,"
      " magic INTEGER, note TEXT);");
   return(INIT_SUCCEEDED);
}

void OnDeinit(const int reason)
{
   if(g_db != INVALID_HANDLE) DatabaseClose(g_db);
}

//+------------------------------------------------------------------+
//| Safe INSERT with parameter binding                               |
//+------------------------------------------------------------------+
void JournalTrade(string sym, string side, double lots,
                  double entry, double exitP, double profit)
{
   string q = "INSERT INTO trades (ts, symbol, side, lots, entry,"
              " exit_price, profit, magic, note)"
              " VALUES (?1,?2,?3,?4,?5,?6,?7,?8,?9);";
   int stmt = DatabasePrepare(g_db, q);
   if(stmt == INVALID_HANDLE) return;

   DatabaseBind(stmt, 0, TimeToString(TimeCurrent(), TIME_DATE | TIME_SECONDS));
   DatabaseBind(stmt, 1, sym);
   DatabaseBind(stmt, 2, side);
   DatabaseBind(stmt, 3, lots);
   DatabaseBind(stmt, 4, entry);
   DatabaseBind(stmt, 5, exitP);
   DatabaseBind(stmt, 6, profit);
   DatabaseBind(stmt, 7, 20241114);
   DatabaseBind(stmt, 8, "auto-journal");

   DatabaseRead(stmt);          // executes the INSERT
   DatabaseFinalize(stmt);
}

//+------------------------------------------------------------------+
//| Aggregate query: daily statistics                                |
//+------------------------------------------------------------------+
void PrintDailyStats()
{
   int stmt = DatabasePrepare(g_db,
      "SELECT substr(ts,1,10) AS day,"
      " COUNT(*) AS n, ROUND(SUM(profit),2) AS total"
      " FROM trades GROUP BY day ORDER BY day DESC LIMIT 5;");
   if(stmt == INVALID_HANDLE) return;

   for(int r = 0; DatabaseRead(stmt); r++)
      PrintFormat("%s  trades=%lld  P/L=%.2f",
                  DatabaseColumnText(stmt, 0),
                  DatabaseColumnInteger(stmt, 1),
                  DatabaseColumnDouble(stmt, 2));
   DatabaseFinalize(stmt);
}`,
      codeTitle: 'Database.mq5'
    },
    useCase: {
      intro: 'Choosing between a database and plain files:',
      items: [
        { when: 'Trade journals and live statistics', why: 'SQLite: INSERT from OnTradeTransaction, aggregate queries on demand (per day, per pair, per magic). Spreadsheets cannot query; a database can.' },
        { when: 'ML training datasets', why: 'Query features and labels directly, or read the .db from Python (sqlite3 standard library) — the cleanest data bridge between MT5 and a data pipeline.' },
        { when: 'Restart-surviving state (last bar, virtual positions)', why: 'A key/value state table is more structured than GlobalVariables and is backed up with the .db file.' },
        { when: 'Configuration shared across advisors or terminals', why: 'FILE_COMMON plus CSV: the shared folder on one machine is the simplest location for the file-handshake pattern from the Architecture page.' }
      ]
    },
    efficiency: {
      intro: 'Persistence must not slow trading:',
      tips: [
        { title: 'INSERT on events, not polling', desc: 'OnTradeTransaction performs the INSERT. No history scans per tick; the database grows with events, not ticks.' },
        { title: 'Prepared statements with binding', desc: 'DatabasePrepare once per query shape, bind per record. Concatenated SQL per insert is slower and vulnerable to quoting defects.' },
        { title: 'One long-lived connection in OnInit..OnDeinit', desc: 'Open once into a global handle and close in OnDeinit. Open/close per insert causes repeated I/O and locking.' },
        { title: 'Index frequently queried columns', desc: 'CREATE INDEX on ts and magic keeps aggregate queries instant across journals of tens of thousands of rows.' }
      ]
    },
    example: {
      title: 'Full integration: deal to database to a Python dataset',
      code: `// ── MQL5 side: record every closing deal (see the Event Model topic) ──
void OnTradeTransaction(const MqlTradeTransaction &trans,
                        const MqlTradeRequest &request,
                        const MqlTradeResult &result)
{
   if(trans.type != TRADE_TRANSACTION_DEAL_ADD) return;
   if(!HistoryDealSelect(trans.deal)) return;
   if(HistoryDealGetInteger(trans.deal, DEAL_ENTRY) != DEAL_ENTRY_OUT) return;

   JournalTrade(
      HistoryDealGetString(trans.deal, DEAL_SYMBOL),
      HistoryDealGetInteger(trans.deal, DEAL_TYPE) == DEAL_TYPE_BUY
         ? "buy" : "sell",
      HistoryDealGetDouble(trans.deal, DEAL_VOLUME),
      HistoryDealGetDouble(trans.deal, DEAL_PRICE),
      HistoryDealGetDouble(trans.deal, DEAL_PRICE),   // exit ~deal price
      HistoryDealGetDouble(trans.deal, DEAL_PROFIT));
}

/* ── Python side: read the journal directly from the .db file ──
import sqlite3, pandas as pd

con = sqlite3.connect(r"MQL5\\\\Files\\\\codex_journal.db")
df = pd.read_sql("SELECT * FROM trades", con)
print(df.groupby("symbol")["profit"].agg(["count", "sum", "mean"]))
# -> direct input for training and evaluation
*/`,
      flavor: 'mixed',
      explanation: [
        'A complete chain without a single polling loop: deal occurs, OnTradeTransaction fires, INSERT executes, Python reads the .db for analysis or training.',
        'DatabaseOpen files live in MQL5\\Files; Python and Excel (via the SQLite driver) read the same path — the lowest-friction bridge between trading and data science.',
        'The DEAL_ENTRY_OUT filter keeps only closing transactions, so the journal contains realized results without opening-transaction noise.',
        'Combined with ONNX (previous topic), the cycle is complete: the advisor produces data, the data trains the model, the model returns as .onnx.'
      ]
    }
  },

  // ────────────────────────────────────────────────
  {
    id: 'tips-efisiensi',
    title: 'Performance Patterns',
    subtitle: 'Handle caching, asynchronous operations, event-driven design — MQL5 performance style',
    icon: 'zap',
    keywords: 'optimization efficiency async handle cache profile bottleneck mql5 performance',
    syntax: {
      intro:
        'MQL5 performance rests on three pillars: infrastructure built once (handles and objects in OnInit), work triggered by the narrowest event (bar and transaction events rather than every tick), and minimal data transfer (small Copy* requests).',
      points: [
        { label: 'Pillar 1: init-once', desc: 'Indicator handles, CTrade/CSymbolInfo objects, database connections and symbol snapshots all belong to OnInit. OnTick only uses them.' },
        { label: 'Pillar 2: event-driven', desc: 'Choose the narrowest event that answers the need: OnTradeTransaction for executions (not polling), bar events for signals (not every tick), OnTimer for UI refresh.' },
        { label: 'Pillar 3: minimal data', desc: 'CopyBuffer/CopyRates with the smallest sufficient count; one atomic MqlTick per cycle; no repeated copies of the same history.' },
        { label: 'Asynchronous trade operations', desc: 'trade.SetAsyncMode(true) sends requests without waiting for the result — a fire-and-forget pattern for high-volume flows; outcomes arrive via OnTradeTransaction.' },
        { label: 'Measure before optimizing', desc: 'GetMicrosecondCount() around suspect blocks, accumulated over 1000 events. Bottleneck guesses are nearly always wrong; numbers are not.' }
      ],
      code: `// pattern: one OnTick, three different speeds
int g_db;
CTrade trade;

void OnTick()
{
   uint t0 = GetMicrosecondCount();

   // SPEED 1 (every tick): light management over cached data
   //   -> trailing runs responsively without heavy computation

   // SPEED 2 (new bar): signals, ONNX inference, summary logging
   static datetime lastBar = 0;
   datetime cur = iTime(_Symbol, PERIOD_CURRENT, 0);
   if(cur != lastBar)
   {
      lastBar = cur;
      UpdateSignals();        // CopyBuffer/OnnxRun/CopyRates: here
   }

   // SPEED 3 (transactions): execution reactions
   //   -> OnTradeTransaction, not history polling

   g_usAccum += GetMicrosecondCount() - t0;
   if(++g_usCount % 2000 == 0)
      PrintFormat("avg OnTick = %.1f us", (double)g_usAccum / g_usCount);
}`,
      codeTitle: 'Performance.mq5'
    },
    useCase: {
      intro: 'Requirement to pattern mapping:',
      items: [
        { when: 'Single-strategy, single-symbol advisor', why: 'The three pillars alone are sufficient. Priority: risk correctness over micro-optimization.' },
        { when: 'Multi-symbol (portfolio) advisors', why: 'A context class per symbol (handles, state, cache) with a loop over contexts in OnTick. Init-once prevents per-symbol cost multiplication.' },
        { when: 'Dashboards with many data reads', why: 'OnTimer at 250 ms–1 s for refresh; never OnTick. Data is read once per interval and shared by all widgets.' },
        { when: 'High-volume execution or large grids', why: 'Consider SetAsyncMode(true) with verification via OnTradeTransaction, removing blocking round-trips from the hot path at the cost of asynchronous confirmation management.' }
      ]
    },
    efficiency: {
      intro: 'An anti-slow checklist specific to MQL5:',
      tips: [
        { title: 'Audit handle leaks', desc: 'Count create/release pairs: every i*/OnnxCreate/DatabaseOpen on any path needs a guaranteed matching release in OnDeinit or an owning destructor.' },
        { title: 'Do not copy the same data twice', desc: 'Two components CopyBuffer-ing the same handle: copy once in the orchestrator and share through a struct or class. Per-bar caching is the simplest form.' },
        { title: 'Journal per transaction, UI per timer, signals per bar', desc: 'The three speeds must never merge into one execution path — merging them is the usual cause of advisors that "suddenly became slow" after a feature was added.' },
        { title: 'Strings only at system edges', desc: 'StringFormat and Print belong to journals and displays; core logic uses numbers and structs. Strings in inner loops are invisible repeated allocations.' }
      ]
    },
    example: {
      title: 'Per-symbol contexts — multi-pair scaling without friction',
      code: `class CSymbolContext
{
public:
   string            symbol;
   int               fastHandle;
   int               slowHandle;
   datetime          lastBar;
   bool              signalBuy;
   // state machine, statistics, etc.

                   CSymbolContext(const string sym)
   {
      symbol     = sym;
      lastBar    = 0;
      signalBuy  = false;
      fastHandle = iMA(sym, PERIOD_CURRENT, 12, 0, MODE_EMA, PRICE_CLOSE);
      slowHandle = iMA(sym, PERIOD_CURRENT, 26, 0, MODE_EMA, PRICE_CLOSE);
   }
                  ~CSymbolContext()
   {
      IndicatorRelease(fastHandle);
      IndicatorRelease(slowHandle);
   }

   void OnBar()
   {
      double f[], s[];
      ArraySetAsSeries(f, true);
      ArraySetAsSeries(s, true);
      if(CopyBuffer(fastHandle, 0, 1, 2, f) < 2) return;
      if(CopyBuffer(slowHandle, 0, 1, 2, s) < 2) return;
      signalBuy = (f[1] <= s[1]) && (f[0] > s[0]);
   }
};

CSymbolContext *g_contexts[];

int OnInit()
{
   string pairs[] = {"EURUSD", "GBPUSD", "USDJPY", "AUDUSD"};
   ArrayResize(g_contexts, ArraySize(pairs));
   for(int i = 0; i < ArraySize(pairs); i++)
      g_contexts[i] = new CSymbolContext(pairs[i]);
   return(INIT_SUCCEEDED);
}

void OnDeinit(const int reason)
{
   for(int i = 0; i < ArraySize(g_contexts); i++)
      delete g_contexts[i];
}

void OnTick()
{
   for(int i = 0; i < ArraySize(g_contexts); i++)
   {
      datetime cur = iTime(g_contexts[i].symbol, PERIOD_CURRENT, 0);
      if(cur == g_contexts[i].lastBar) continue;   // no new bar yet
      g_contexts[i].lastBar = cur;
      g_contexts[i].OnBar();
   }
}`,
      explanation: [
        'Init-once applied per symbol: handles are created in the context constructor and released in the destructor. Adding symbols does not change the pattern and no handles leak.',
        'OnTick becomes a light context loop: a new bar check per symbol, heavy work only for symbols with a new bar. Total cost grows linearly.',
        'Compared with procedural parallel arrays (symbols[], handles[], states[]), a context class keeps data and behavior together — the reason the Architecture page speaks in components rather than global variables.',
        'This extends directly: add the state machine field from the OOP topic and the risk manager from the Standard Library topic to obtain a complete portfolio advisor framework.'
      ]
    }
  }
]
