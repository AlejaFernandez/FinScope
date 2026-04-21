import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { SearchStocksUseCase } from './search-stocks.usecase';
import { IStockRepository } from '../../domain/ports/stock-repository.port';
import { Stock } from '../../domain/entities/stock.entity';

const mockStocks: Stock[] = [
  { symbol: 'AAPL', name: 'Apple Inc.', exchange: 'NASDAQ', sector: 'Tech', industry: 'Consumer Electronics', marketCap: 3000000000000, currency: 'USD' },
  { symbol: 'AAON', name: 'AAON Inc.', exchange: 'NASDAQ', sector: 'Industrials', industry: 'HVAC', marketCap: 5000000000, currency: 'USD' },
];

describe('SearchStocksUseCase', () => {
  let useCase: SearchStocksUseCase;
  let repo: jest.Mocked<IStockRepository>;

  beforeEach(() => {
    repo = {
      searchStocks: jest.fn().mockReturnValue(of(mockStocks)),
      getQuote: jest.fn(),
      getCandles: jest.fn(),
      getNews: jest.fn(),
      getMarketStatus: jest.fn(),
    } as unknown as jest.Mocked<IStockRepository>;

    TestBed.configureTestingModule({
      providers: [SearchStocksUseCase, { provide: IStockRepository, useValue: repo }],
    });

    useCase = TestBed.inject(SearchStocksUseCase);
  });

  it('should call repository searchStocks with the given query', (done) => {
    useCase.execute('AA').subscribe((stocks) => {
      expect(repo.searchStocks).toHaveBeenCalledWith('AA');
      expect(stocks).toEqual(mockStocks);
      expect(stocks).toHaveLength(2);
      done();
    });
  });
});
