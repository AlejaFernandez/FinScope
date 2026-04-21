export interface Candle {
  symbol: string;
  open: number[];
  high: number[];
  low: number[];
  close: number[];
  volume: number[];
  timestamp: number[];
  status: 'ok' | 'no_data';
}

export type Timeframe = '1' | '5' | '15' | '60' | 'D';
