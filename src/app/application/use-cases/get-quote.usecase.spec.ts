import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { GetQuoteUseCase } from './get-quote.usecase';
import { IStockRepository } from '../../domain/ports/stock-repository.port';
import { Quote } from '../../domain/entities/quote.entity';

const mockQuote: Quote = {
  symbol: 'AAPL',
  price: 182.5,
  change: 1.2,
  changePercent: 0.66,
  high: 184.0,
  low: 181.0,
  open: 181.5,
  previousClose: 181.3,
  timestamp: 1700000000,
};

describe('GetQuoteUseCase', () => {
  let useCase: GetQuoteUseCase;
  let repo: jest.Mocked<IStockRepository>;

  beforeEach(() => {
    repo = {
      getQuote: jest.fn().mockReturnValue(of(mockQuote)),
      searchStocks: jest.fn(),
      getCandles: jest.fn(),
      getNews: jest.fn(),
      getMarketStatus: jest.fn(),
    } as unknown as jest.Mocked<IStockRepository>;

    TestBed.configureTestingModule({
      providers: [GetQuoteUseCase, { provide: IStockRepository, useValue: repo }],
    });

    useCase = TestBed.inject(GetQuoteUseCase);
  });

  it('should call repository getQuote with the given symbol', (done) => {
    useCase.execute('AAPL').subscribe((quote) => {
      expect(repo.getQuote).toHaveBeenCalledWith('AAPL');
      expect(quote).toEqual(mockQuote);
      done();
    });
  });
});
