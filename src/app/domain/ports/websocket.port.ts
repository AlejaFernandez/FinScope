import { Observable } from 'rxjs';

export interface LiveTrade {
  symbol: string;
  price: number;
  volume: number;
  timestamp: number;
}

export abstract class IWebSocketPort {
  abstract connect(): void;
  abstract disconnect(): void;
  abstract subscribe(symbol: string): void;
  abstract unsubscribe(symbol: string): void;
  abstract trades$(): Observable<LiveTrade>;
  abstract connectionStatus$(): Observable<'connected' | 'disconnected' | 'reconnecting'>;
}
