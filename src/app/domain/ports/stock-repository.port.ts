import { Observable } from 'rxjs';
import { Stock } from '../entities/stock.entity';
import { Quote } from '../entities/quote.entity';
import { Candle, Timeframe } from '../entities/candle.entity';
import { NewsItem } from '../entities/news.entity';

export abstract class IStockRepository {
  abstract searchStocks(query: string): Observable<Stock[]>;
  abstract getQuote(symbol: string): Observable<Quote>;
  abstract getCandles(symbol: string, resolution: Timeframe, from: number, to: number): Observable<Candle>;
  abstract getNews(symbol: string): Observable<NewsItem[]>;
  abstract getMarketStatus(): Observable<{ isOpen: boolean; session: string }>;
}
