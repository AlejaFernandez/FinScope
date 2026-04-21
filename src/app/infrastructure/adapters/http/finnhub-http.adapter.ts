import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { IStockRepository } from '../../../domain/ports/stock-repository.port';
import { Stock } from '../../../domain/entities/stock.entity';
import { Quote } from '../../../domain/entities/quote.entity';
import { Candle, Timeframe } from '../../../domain/entities/candle.entity';
import { NewsItem } from '../../../domain/entities/news.entity';
import { environment } from '../../../../environments/environment';

@Injectable()
export class FinnhubHttpAdapter implements IStockRepository {
  private readonly http = inject(HttpClient);
  private readonly base = 'https://finnhub.io/api/v1';
  private readonly token = environment.finnhubApiKey;

  private params(extra: Record<string, string> = {}): HttpParams {
    return new HttpParams({ fromObject: { token: this.token, ...extra } });
  }

  searchStocks(query: string): Observable<Stock[]> {
    return this.http
      .get<{ result: any[] }>(`${this.base}/search`, { params: this.params({ q: query }) })
      .pipe(
        map(res =>
          res.result.map(r => ({
            symbol: r.symbol,
            name: r.description,
            exchange: r.primaryExchange ?? '',
            sector: '',
            industry: '',
            marketCap: 0,
            currency: 'USD',
          }))
        )
      );
  }

  getQuote(symbol: string): Observable<Quote> {
    return this.http
      .get<any>(`${this.base}/quote`, { params: this.params({ symbol }) })
      .pipe(
        map(r => ({
          symbol,
          price: r.c,
          change: r.d,
          changePercent: r.dp,
          high: r.h,
          low: r.l,
          open: r.o,
          previousClose: r.pc,
          timestamp: r.t,
        }))
      );
  }

  getCandles(symbol: string, resolution: Timeframe, from: number, to: number): Observable<Candle> {
    return this.http
      .get<any>(`${this.base}/stock/candle`, {
        params: this.params({ symbol, resolution, from: String(from), to: String(to) }),
      })
      .pipe(
        map(r => ({
          symbol,
          open: r.o ?? [],
          high: r.h ?? [],
          low: r.l ?? [],
          close: r.c ?? [],
          volume: r.v ?? [],
          timestamp: r.t ?? [],
          status: r.s,
        }))
      );
  }

  getNews(symbol: string): Observable<NewsItem[]> {
    const to = new Date().toISOString().split('T')[0];
    const from = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    return this.http
      .get<any[]>(`${this.base}/company-news`, { params: this.params({ symbol, from, to }) })
      .pipe(
        map(items =>
          items.map(i => ({
            id: String(i.id),
            symbol,
            headline: i.headline,
            summary: i.summary,
            source: i.source,
            url: i.url,
            datetime: i.datetime,
            image: i.image,
          }))
        )
      );
  }

  getMarketStatus(): Observable<{ isOpen: boolean; session: string }> {
    return this.http
      .get<any>(`${this.base}/stock/market-status`, { params: this.params({ exchange: 'US' }) })
      .pipe(map(r => ({ isOpen: r.isOpen, session: r.session ?? '' })));
  }
}
