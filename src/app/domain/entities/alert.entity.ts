export type AlertCondition = 'above' | 'below';

export interface Alert {
  id: string;
  symbol: string;
  condition: AlertCondition;
  targetPrice: number;
  createdAt: number;
  triggered: boolean;
  triggeredAt?: number;
}
