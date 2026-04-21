export interface Position {
  id: string;
  symbol: string;
  shares: number;
  avgCost: number;
  openedAt: number;
}

export interface PositionWithPnl extends Position {
  currentPrice: number;
  marketValue: number;
  pnl: number;
  pnlPercent: number;
}
