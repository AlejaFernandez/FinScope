import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { IWebSocketPort, LiveTrade } from '../../domain/ports/websocket.port';

@Injectable({ providedIn: 'root' })
export class SubscribeLivePricesUseCase {
  private readonly ws = inject(IWebSocketPort);

  subscribe(symbol: string): void {
    this.ws.subscribe(symbol);
  }

  unsubscribe(symbol: string): void {
    this.ws.unsubscribe(symbol);
  }

  trades$(): Observable<LiveTrade> {
    return this.ws.trades$();
  }

  connectionStatus$() {
    return this.ws.connectionStatus$();
  }
}
