import type { MigrationRow } from './types'

export const MIGRATION_ROWS: MigrationRow[] = [
  // Trading
  { category: 'Trading', previous: 'OrderSend(Symbol(), OP_BUY, lot, Ask, slip, sl, tp, "c", magic)', current: 'trade.Buy(lot, _Symbol, 0.0, sl, tp, "c")  // CTrade', note: 'Configure magic, deviation and filling once in OnInit via the Set* methods.' },
  { category: 'Trading', previous: 'OrderSend(..., OP_BUYLIMIT, price, ...)', current: 'trade.BuyLimit(lot, price, _Symbol, sl, tp, ORDER_TIME_GTC, 0, "c")', note: 'Pending orders become explicit methods per type.' },
  { category: 'Trading', previous: 'OrderClose(ticket, lots, price, slip)', current: 'trade.PositionClose(ticket)  // or PositionClosePartial(ticket, lot)', note: 'MQL5 operates on position tickets, not position indices.' },
  { category: 'Trading', previous: 'OrderModify(ticket, price, sl, tp, exp)', current: 'trade.PositionModify(ticket, sl, tp)', note: 'Verify a change of at least one point first; the "no changes" retcode still exists.' },
  { category: 'Trading', previous: 'OrderDelete(ticket)', current: 'trade.OrderDelete(ticket)', note: 'For pending orders that have not filled.' },
  { category: 'Trading', previous: 'for(i=OrdersTotal()-1;...) OrderSelect(i, SELECT_BY_POS)', current: 'for(i=PositionsTotal()-1;...) ulong tk = PositionGetTicket(i)', note: 'GetTicket selects the context in one call; pending orders are read via OrdersTotal/OrderGetTicket.' },
  { category: 'Trading', previous: 'OrderTicket(), OrderLots(), OrderStopLoss()...', current: 'PositionGetInteger/Double/String(POSITION_*)', note: 'After PositionGetTicket or PositionSelect; constant groups are split per data category.' },

  // Indicators
  { category: 'Indicators', previous: 'double v = iMA(NULL, 0, 20, 0, MODE_EMA, PRICE_CLOSE, 1)', current: 'int h = iMA(_Symbol, 0, 20, 0, MODE_EMA, PRICE_CLOSE); CopyBuffer(h, 0, 1, 1, buf)', note: 'The largest conceptual change: value, then handle plus CopyBuffer.' },
  { category: 'Indicators', previous: 'iRSI(NULL, 0, 14, PRICE_CLOSE, 1)', current: 'handle = iRSI(...) in OnInit + CopyBuffer', note: 'Create handles once in OnInit; release them in OnDeinit.' },
  { category: 'Indicators', previous: 'iCustom(NULL, 0, "MyInd", param, bufIdx, shift)', current: 'handle = iCustom(_Symbol, tf, "MyInd", param); CopyBuffer(handle, bufIdx, shift, 1, buf)', note: 'The same contract split into two steps: open a service, then read data.' },
  { category: 'Indicators', previous: '(not required — direct values)', current: 'IndicatorRelease(handle) in OnDeinit', note: 'Mandatory: unreleased handles leak resources.' },

  // Data & Time
  { category: 'Data & Time', previous: 'Close[1], High[1], Time[1] (predefined series)', current: 'CopyClose/CopyRates with ArraySetAsSeries, or iClose/iHigh/iTime', note: 'MQL5 has no predefined price arrays; request data explicitly as needed.' },
  { category: 'Data & Time', previous: 'iMA(..., PERIOD_H1, ..., shift) across timeframes directly', current: 'one handle per timeframe + CopyBuffer per handle', note: 'Multi-timeframe becomes explicit: one handle per (symbol, timeframe, parameters).' },
  { category: 'Data & Time', previous: 'if(Time[0] != lastBar) {...}', current: 'datetime cur = iTime(_Symbol, PERIOD_CURRENT, 0); if(cur != lastBar) {...}', note: 'The new bar detection pattern keeps the same shape.' },
  { category: 'Data & Time', previous: 'RefreshRates()', current: 'MqlTick tick; SymbolInfoTick(_Symbol, tick)', note: 'Atomic snapshot: bid, ask, volume and milliseconds from one source.' },

  // Information
  { category: 'Information', previous: 'Bid / Ask', current: 'SymbolInfoDouble(_Symbol, SYMBOL_BID / SYMBOL_ASK) or tick.bid/tick.ask', note: 'For critical execution, use MqlTick so values are atomic.' },
  { category: 'Information', previous: 'Point / Digits', current: '_Point / _Digits (modern predefined) or SymbolInfoDouble/Integer', note: 'MQL5 accepts Point/Digits in most contexts; _Point/_Digits is the official style.' },
  { category: 'Information', previous: 'MarketInfo(sym, MODE_MINLOT / LOTSTEP / TICKVALUE...)', current: 'SymbolInfoDouble(sym, SYMBOL_VOLUME_MIN / VOLUME_STEP / TRADE_TICK_VALUE)', note: 'Every MODE_* constant maps to a SYMBOL_* enum.' },
  { category: 'Information', previous: 'MarketInfo(sym, MODE_STOPLEVEL)', current: 'SymbolInfoInteger(sym, SYMBOL_TRADE_STOPS_LEVEL)', note: 'Stop level moved to the Integer family (the value is long).' },
  { category: 'Information', previous: 'AccountBalance() / AccountEquity()', current: 'AccountInfoDouble(ACCOUNT_BALANCE / ACCOUNT_EQUITY) or CAccountInfo', note: 'CAccountInfo from the Standard Library provides the most narrative API.' },
  { category: 'Information', previous: 'AccountFreeMarginCheck(...)', current: 'CAccountInfo.FreeMarginCheck(...) / AccountInfoDouble(ACCOUNT_MARGIN_FREE)', note: 'The pre-order margin check remains mandatory.' },

  // Other
  { category: 'Other', previous: 'IsTradeAllowed()', current: 'TerminalInfoInteger(TERMINAL_TRADE_ALLOWED) + MQLInfoInteger(MQL_TRADE_ALLOWED)', note: 'Two layers: terminal permission and program permission, checked separately.' },
  { category: 'Other', previous: 'extern int Param = 5;', current: 'input int Param = 5;  // or sinput to exclude from optimization', note: 'extern is effectively gone; input and sinput are the standard.' },
  { category: 'Other', previous: '#property strict', current: '(not required)', note: 'MQL5 is strict by default; this property does not apply.' },
  { category: 'Other', previous: 'GetLastError() after failed Order* calls', current: 'trade.ResultRetcode() + ResultRetcodeDescription()', note: 'Documented retcodes with human-readable descriptions accelerate debugging.' },
  { category: 'Other', previous: 'OrdersHistoryTotal() scans for history', current: 'OnTradeTransaction + HistoryDealSelect/HistoryDealGet*', note: 'From polling to event-driven: immediate reaction without loops.' },
  { category: 'Other', previous: 'GlobalVariableSet/Get for state', current: 'SQLite (a state table) or GlobalVariable* (still available)', note: 'For complex state, the database is far more structured.' }
]
