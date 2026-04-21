import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { GetCandlesUseCase } from './get-candles.usecase';
import { IStockRepository } from '../../domain/ports/stock-repository.port';
import { Candle } from '../../domain/entities/candle.entity';

const mockCandle: Candle = {
  symbol: 'AAPL',
  open: [180, 181],
  high: [184, 183],
  low: [179, 180],
  close: [182, 182.5],
  volume: [1000000, 900000],
  timestamp: [1700000000, 1700003600],
  status: 'ok',
};

describe('GetCandlesUseCase', () => {
  let useCase: GetCandlesUseCase;
  let repo: jest.Mocked<IStockRepository>;

  beforeEach(() => {
    repo = {
      getCandles: jest.fn().mockReturnValue(of(mockCandle)),
      searchStocks: jest.fn(),
      getQuote: jest.fn(),
      getNews: jest.fn(),
      getMarketStatus: jest.fn(),
    } as unknown as jest.Mocked<IStockRepository>;

    TestBed.configureTestingModule({
      providers: [GetCandlesUseCase, { provide: IStockRepository, useValue: repo }],
    });

    useCase = TestBed.inject(GetCandlesUseCase);
  });

  it('should call repository getCandles with correct params', (done) => {
    const from = 1700000000;
    const to = 1700086400;

    useCase.execute('AAPL', 'D', from, to).subscribe((candle) => {
      expect(repo.getCandles).toHaveBeenCalledWith('AAPL', 'D', from, to);
      expect(candle).toEqual(mockCandle);
      done();
    });
  });
});
