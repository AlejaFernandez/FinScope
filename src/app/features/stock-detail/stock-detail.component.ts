import { Component, OnInit, inject, signal, DestroyRef, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, of } from 'rxjs';
import { GetQuoteUseCase } from '../../application/use-cases/get-quote.usecase';
import { GetCandlesUseCase } from '../../application/use-cases/get-candles.usecase';
import { SubscribeLivePricesUseCase } from '../../application/use-cases/subscribe-live-prices.usecase';
import { Quote } from '../../domain/entities/quote.entity';
import { Candle, Timeframe } from '../../domain/entities/candle.entity';
import { NewsItem } from '../../domain/entities/news.entity';
import { IStockRepository } from '../../domain/ports/stock-repository.port';
import { CandlestickChartComponent } from '../../shared/components/candlestick-chart/candlestick-chart.component';
import { StockInfoPanelComponent } from './components/stock-info-panel.component';
import { NewsFeedComponent } from './components/news-feed.component';

const TIMEFRAMES: { label: string; value: Timeframe; days: number }[] = [
  { label: '1D', value: '1',  days: 1  },
  { label: '1W', value: '15', days: 7  },
  { label: '1M', value: '60', days: 30 },
  { label: '3M', value: 'D',  days: 90 },
  { label: '1Y', value: 'D',  days: 365 },
];

@Component({
  selector: 'fs-stock-detail',
  standalone: true,
  imports: [CommonModule, CandlestickChartComponent, StockInfoPanelComponent, NewsFeedComponent],
  template: `
    <div class="flex flex-col gap-4">

      <!-- Header -->
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <h1 class="text-2xl font-bold text-white">{{ symbol() }}</h1>
          @if (livePrice()) {
            <span class="text-xs px-2 py-0.5 rounded bg-accent-green/20 text-accent-green animate-pulse">LIVE</span>
          }
        </div>

        <!-- Timeframe selector -->
        <div class="flex gap-1">
          @for (tf of timeframes; track tf.label) {
            <button
              (click)="onTimeframeChange(tf)"
              [class]="tf.label === selectedTimeframe().label
                ? 'bg-accent-blue text-white'
                : 'text-gray-400 hover:text-white hover:bg-surface-700'"
              class="px-3 py-1 rounded text-xs font-semibold transition-colors">
              {{ tf.label }}
            </button>
          }
        </div>
      </div>

      <!-- Info panel -->
      @if (quote()) {
        <fs-stock-info-panel [quote]="quote()!" />
      }

      <!-- Chart -->
      <div class="bg-surface-800 border border-surface-600 rounded-lg p-4">
        @defer (on immediate) {
          <fs-candlestick-chart [candles]="candles()" [height]="420" />
        } @placeholder {
          <div class="h-96 flex items-center justify-center text-gray-600">Cargando chart...</div>
        }
      </div>

      <!-- News -->
      @defer (on viewport) {
        <fs-news-feed [news]="news()" />
      } @placeholder {
        <div class="bg-surface-800 border border-surface-600 rounded-lg p-4 h-32 animate-pulse"></div>
      }

    </div>
  `,
})
export class StockDetailComponent implements OnInit {
  private readonly route        = inject(ActivatedRoute);
  private readonly getQuoteUC   = inject(GetQuoteUseCase);
  private readonly getCandlesUC = inject(GetCandlesUseCase);
  private readonly liveUC       = inject(SubscribeLivePricesUseCase);
  private readonly repo         = inject(IStockRepository);
  private readonly destroyRef   = inject(DestroyRef);
  private readonly isBrowser    = isPlatformBrowser(inject(PLATFORM_ID));

  timeframes = TIMEFRAMES;

  symbol            = signal('');
  quote             = signal<Quote | null>(null);
  candles           = signal<Candle | null>(null);
  news              = signal<NewsItem[]>([]);
  livePrice         = signal(false);
  selectedTimeframe = signal(TIMEFRAMES[2]);

  ngOnInit(): void {
    const sym = this.route.snapshot.paramMap.get('symbol') ?? 'AAPL';
    this.symbol.set(sym);
    if (!this.isBrowser) return;
    this.loadQuote();
    this.loadCandles();
    this.loadNews();
    this.subscribeToLive();
  }

  onTimeframeChange(tf: typeof TIMEFRAMES[0]): void {
    this.selectedTimeframe.set(tf);
    this.loadCandles();
  }

  private loadQuote(): void {
    this.getQuoteUC.execute(this.symbol()).pipe(
      catchError(() => of(null)),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe(q => { if (q) this.quote.set(q); });
  }

  private loadCandles(): void {
    const to   = Math.floor(Date.now() / 1000);
    const from = to - this.selectedTimeframe().days * 86400;
    this.getCandlesUC.execute(this.symbol(), this.selectedTimeframe().value, from, to).pipe(
      catchError(() => of(null)),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe(c => this.candles.set(c));
  }

  private loadNews(): void {
    this.repo.getNews(this.symbol()).pipe(
      catchError(() => of([])),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe(n => this.news.set(n));
  }

  private subscribeToLive(): void {
    this.liveUC.subscribe(this.symbol());
    this.liveUC.trades$().pipe(
      takeUntilDestroyed(this.destroyRef),
    ).subscribe(trade => {
      if (trade.symbol !== this.symbol()) return;
      this.livePrice.set(true);
      this.quote.update(q => q
        ? { ...q, price: trade.price, change: trade.price - q.previousClose, changePercent: ((trade.price - q.previousClose) / q.previousClose) * 100 }
        : q
      );
    });
  }
}
