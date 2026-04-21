import { TestBed } from '@angular/core/testing';
import { of, BehaviorSubject } from 'rxjs';
import { SubscribeLivePricesUseCase } from './subscribe-live-prices.usecase';
import { IWebSocketPort, LiveTrade } from '../../domain/ports/websocket.port';

const mockTrade: LiveTrade = { symbol: 'AAPL', price: 182.5, volume: 100, timestamp: 1700000000 };

describe('SubscribeLivePricesUseCase', () => {
  let useCase: SubscribeLivePricesUseCase;
  let ws: jest.Mocked<IWebSocketPort>;

  beforeEach(() => {
    ws = {
      subscribe: jest.fn(),
      unsubscribe: jest.fn(),
      trades$: jest.fn().mockReturnValue(of(mockTrade)),
      connectionStatus$: jest.fn().mockReturnValue(new BehaviorSubject('connected')),
      connect: jest.fn(),
      disconnect: jest.fn(),
    } as unknown as jest.Mocked<IWebSocketPort>;

    TestBed.configureTestingModule({
      providers: [SubscribeLivePricesUseCase, { provide: IWebSocketPort, useValue: ws }],
    });

    useCase = TestBed.inject(SubscribeLivePricesUseCase);
  });

  it('should call ws.subscribe with the given symbol', () => {
    useCase.subscribe('AAPL');
    expect(ws.subscribe).toHaveBeenCalledWith('AAPL');
  });

  it('should call ws.unsubscribe with the given symbol', () => {
    useCase.unsubscribe('AAPL');
    expect(ws.unsubscribe).toHaveBeenCalledWith('AAPL');
  });

  it('should return trades observable from ws', (done) => {
    useCase.trades$().subscribe((trade) => {
      expect(trade).toEqual(mockTrade);
      done();
    });
  });

  it('should return connection status observable from ws', (done) => {
    useCase.connectionStatus$().subscribe((status) => {
      expect(status).toBe('connected');
      done();
    });
  });
});
