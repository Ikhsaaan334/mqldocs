import type { CheatCategory } from './types'

export const CHEAT_MQL4: CheatCategory[] = [
  {
    category: 'Orders and Execution',
    icon: 'chart',
    rows: [
      { signature: 'OrderSend(sym, cmd, lots, price, slip, sl, tp, cmt, magic, exp, color)', desc: 'Opens a market or pending order; returns a ticket or -1' },
      { signature: 'OrderSelect(i, SELECT_BY_POS, MODE_TRADES)', desc: 'Selects order i (or SELECT_BY_TICKET) into context' },
      { signature: 'OrderClose(ticket, lots, price, slip)', desc: 'Closes a market order fully or partially' },
      { signature: 'OrderModify(ticket, price, sl, tp, exp)', desc: 'Modifies stop loss, take profit or pending price' },
      { signature: 'OrdersTotal()', desc: 'Count of open orders in the account (all symbols)' },
      { signature: 'RefreshRates()', desc: 'Resynchronizes Bid/Ask after slow operations' }
    ]
  },
  {
    category: 'Prices and Symbols',
    icon: 'wallet',
    rows: [
      { signature: 'Bid / Ask', desc: 'Current sell/buy prices of the chart symbol' },
      { signature: 'Point / Digits', desc: 'Minimum price unit and decimal count' },
      { signature: 'MarketInfo(sym, MODE_MINLOT|MAXLOT|LOTSTEP)', desc: 'Broker volume constraints' },
      { signature: 'MarketInfo(sym, MODE_TICKVALUE|TICKSIZE)', desc: 'Distance-to-money conversion for risk sizing' },
      { signature: 'MarketInfo(sym, MODE_STOPLEVEL)', desc: 'Minimum SL/TP distance from price' },
      { signature: 'Symbol()', desc: 'Chart symbol name' }
    ]
  },
  {
    category: 'Indicators (direct values)',
    icon: 'trend',
    rows: [
      { signature: 'iMA(sym, tf, period, ma_shift, mode, price, shift)', desc: 'Moving average; the last shift selects the bar' },
      { signature: 'iRSI(sym, tf, period, price, shift)', desc: 'Relative Strength Index' },
      { signature: 'iATR(sym, tf, period, shift)', desc: 'Average True Range (volatility measure)' },
      { signature: 'iMACD(sym, tf, fast, slow, sig, price, mode, shift)', desc: 'MODE_MAIN / MODE_SIGNAL' },
      { signature: 'iCustom(sym, tf, "Name", params..., bufIdx, shift)', desc: 'Custom indicator buffer' },
      { signature: 'iHighest(sym, tf, MODE_HIGH, count, start)', desc: 'Index of the bar with the highest high' }
    ]
  },
  {
    category: 'Time and Data',
    icon: 'clock',
    rows: [
      { signature: 'TimeCurrent()', desc: 'Server time of the last tick' },
      { signature: 'Time[0], Close[1], High[2]', desc: 'Predefined series arrays; [0] is the forming bar' },
      { signature: 'iTime(sym, tf, shift)', desc: 'Bar open time (for new bar detection)' },
      { signature: 'TimeHour(t), TimeDayOfWeek(t)', desc: 'Session and weekday filters' },
      { signature: "D'2024.03.15 14:30'", desc: 'Datetime literal for comparisons' },
      { signature: 'EventSetTimer(sec) → OnTimer()', desc: 'Local timer independent of ticks' }
    ]
  },
  {
    category: 'Utilities',
    icon: 'zap',
    rows: [
      { signature: 'NormalizeDouble(v, Digits)', desc: 'Price precision before sending to the server' },
      { signature: 'GetLastError() / ResetLastError()', desc: 'Read and clear the last error code' },
      { signature: 'MathFloor(lot/step)*step', desc: 'Round volume down to the broker lot step' },
      { signature: 'StringFormat("%.2f", x) / DoubleToString', desc: 'Log and text formatting' },
      { signature: 'FileOpen(name, FILE_CSV|FILE_WRITE|FILE_ANSI)', desc: 'CSV journal; FileSeek(SEEK_END) for append' },
      { signature: 'GlobalVariableSet/Get(name)', desc: 'Small restart-surviving state per terminal' }
    ]
  }
]

export const CHEAT_MQL5: CheatCategory[] = [
  {
    category: 'CTrade and Execution',
    icon: 'chart',
    rows: [
      { signature: 'trade.Buy/Sell(lot, sym, price, sl, tp, comment)', desc: 'Market entry via the wrapper; check ResultRetcode()' },
      { signature: 'trade.PositionOpen(sym, type, lot, price, sl, tp)', desc: 'Explicit variant with ENUM_ORDER_TYPE' },
      { signature: 'trade.PositionClose(ticket)', desc: 'Closes a position; PositionClosePartial for partial exits' },
      { signature: 'trade.PositionModify(ticket, sl, tp)', desc: 'Moves position stop levels' },
      { signature: 'trade.BuyLimit/SellLimit/BuyStop/SellStop(...)', desc: 'Explicit pending orders per type' },
      { signature: 'trade.SetTypeFillingBySymbol(_Symbol)', desc: 'Required in OnInit; prevents filling-mode errors' },
      { signature: 'OrderSend(MqlTradeRequest, MqlTradeResult)', desc: 'Raw path for full control (IOC/FOK, async)' }
    ]
  },
  {
    category: 'Positions and Orders',
    icon: 'wallet',
    rows: [
      { signature: 'PositionsTotal() / PositionGetTicket(i)', desc: 'Position loop; GetTicket also selects the context' },
      { signature: 'PositionGetDouble(POSITION_PROFIT|PRICE_OPEN|SL|TP)', desc: 'Monetary and price data of the selected position' },
      { signature: 'PositionGetInteger(POSITION_TYPE|MAGIC|TIME)', desc: 'Type (BUY/SELL), magic number, open time' },
      { signature: 'PositionGetString(POSITION_SYMBOL)', desc: 'Symbol filter during loops' },
      { signature: 'OrdersTotal() / OrderGetTicket(i)', desc: 'Pending orders only (not positions)' },
      { signature: 'HistoryDealSelect(deal) + HistoryDealGet*(DEAL_*)', desc: 'Reads history deal details' }
    ]
  },
  {
    category: 'Indicators (handle-based)',
    icon: 'trend',
    rows: [
      { signature: 'int h = iMA(sym, tf, period, shift_ma, MODE_EMA, price)', desc: 'Create the handle once in OnInit; INVALID_HANDLE on failure' },
      { signature: 'CopyBuffer(h, buffer, start, count, arr[])', desc: 'Reads values; verify the return is at least count' },
      { signature: 'ArraySetAsSeries(arr, true)', desc: 'Index 0 = newest (MQL4-style shift)' },
      { signature: 'IndicatorRelease(h)', desc: 'Required in OnDeinit — prevents leaks' },
      { signature: 'iCustom(sym, tf, "Name", params...) → CopyBuffer', desc: 'Custom indicators as data sources' },
      { signature: 'CopyRates(sym, tf, start, count, MqlRates[])', desc: 'Full candles: OHLC, volume and spread' }
    ]
  },
  {
    category: 'Tick, Symbol, Account',
    icon: 'database',
    rows: [
      { signature: 'MqlTick tick; SymbolInfoTick(_Symbol, tick)', desc: 'Atomic bid/ask/last/volume/time_msc snapshot' },
      { signature: 'SymbolInfoDouble(sym, SYMBOL_VOLUME_STEP|MIN|MAX)', desc: 'Broker volume rules' },
      { signature: 'SymbolInfoInteger(sym, SYMBOL_TRADE_STOPS_LEVEL)', desc: 'Minimum SL/TP distance' },
      { signature: 'AccountInfoDouble(ACCOUNT_BALANCE|EQUITY)', desc: 'Account data; or CAccountInfo' },
      { signature: 'CAccountInfo.FreeMarginCheck(sym, cmd, lot, price)', desc: 'Margin check before ordering' },
      { signature: 'TerminalInfoInteger(TERMINAL_TRADE_ALLOWED)', desc: 'Terminal autotrading permission' }
    ]
  },
  {
    category: 'Events, DB and ML',
    icon: 'brain',
    rows: [
      { signature: 'OnTradeTransaction(trans, request, result)', desc: 'Execution reaction without polling; check trans.type' },
      { signature: 'double OnTester() → TesterStatistics(...)', desc: 'Custom optimization score' },
      { signature: 'DatabaseOpen("db", ...CREATE) → DatabasePrepare/Bind/Read', desc: 'Native SQLite for journals and state' },
      { signature: 'long h = OnnxCreate("model.onnx", ONNX_DEFAULT)', desc: 'Loads an ML model; then OnnxSetInputShape' },
      { signature: 'OnnxRun(h, flags, features, output)', desc: 'Per-bar inference; validate the output' },
      { signature: 'EventChartCustom(chart, code, lp, dp, "s")', desc: 'Custom events between advisors and charts' }
    ]
  }
]
