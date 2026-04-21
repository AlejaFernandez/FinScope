import { Injectable, OnDestroy } from '@angular/core';
import { Subject, BehaviorSubject, Observable, timer } from 'rxjs';
import { retryWhen, delayWhen, tap } from 'rxjs/operators';
import { IWebSocketPort, LiveTrade } from '../../../domain/ports/websocket.port';
import { environment } from '../../../../environments/environment';

@Injectable()
export class FinnhubWebSocketAdapter implements IWebSocketPort, OnDestroy {
  private ws: WebSocket | null = null;
  private trades = new Subject<LiveTrade>();
  private status = new BehaviorSubject<'connected' | 'disconnected' | 'reconnecting'>('disconnected');
  private retryDelay = 3000;

  connect(): void {
    this.createConnection();
  }

  private createConnection(): void {
    this.ws = new WebSocket(`wss://ws.finnhub.io?token=${environment.finnhubApiKey}`);

    this.ws.onopen = () => this.status.next('connected');

    this.ws.onmessage = ({ data }) => {
      const msg = JSON.parse(data);
      if (msg.type === 'trade') {
        msg.data.forEach((t: any) => {
          this.trades.next({ symbol: t.s, price: t.p, volume: t.v, timestamp: t.t });
        });
      }
    };

    this.ws.onclose = () => {
      this.status.next('reconnecting');
      setTimeout(() => this.createConnection(), this.retryDelay);
    };

    this.ws.onerror = () => this.ws?.close();
  }

  disconnect(): void {
    this.ws?.close();
    this.status.next('disconnected');
  }

  subscribe(symbol: string): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type: 'subscribe', symbol }));
    }
  }

  unsubscribe(symbol: string): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type: 'unsubscribe', symbol }));
    }
  }

  trades$(): Observable<LiveTrade> {
    return this.trades.asObservable();
  }

  connectionStatus$(): Observable<'connected' | 'disconnected' | 'reconnecting'> {
    return this.status.asObservable();
  }

  ngOnDestroy(): void {
    this.disconnect();
  }
}
