import { Component, OnInit, inject, signal, DestroyRef, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, of } from 'rxjs';
import { GetQuoteUseCase } from '../../application/use-cases/get-quote.usecase';
import { GetCandlesUseCase } from '../../application/use-cases/get-candles.usecase';
import { SubscribeLivePricesUseCase } from '../../application/use-cases/subscribe-live-prices.usecase';
import { Quote } from '../../domain/entities/quote.entity';
import { Candle, Timeframe } from '../../domain/entities/candle.entity';
import { QuoteCardComponent } from './components/quote-card.component';
import { CandlestickChartComponent } from '../../shared/components/candlestick-chart/candlestick-chart.component';
import { PriceBadgeComponent } from '../../shared/components/price-badge/price-badge.component';

const WATCHLIST = ['AAPL', 'TSLA', 'NVDA', 'MSFT', 'AMZN', 'META'];
const TIMEFRAMES: { label: string; value: Timeframe; days: number }[] = [
  { label: '1D', value: '1',  days: 1  },
  { label: '1W', value: '15', days: 7  },
  { label: '1M', value: '60', days: 30 },
  { label: '3M', value: 'D',  days: 90 },
];

@Component({
  selector: 'fs-dashboard',
  standalone: true,
  imports: [CommonModule, QuoteCardComponent, CandlestickChartComponent, PriceBadgeComponent],
  template: `
    <div class="flex flex-col gap-4">

      <!-- Quote cards grid -->
      <div class="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
        @for (q of quotes(); track q.symbol) {
          <fs-quote-card [quote]="q" />
        }
      </div>

      <!-- Main chart -->
      <div class="bg-surface-800 border border-surface-600 rounded-lg p-4">
        <div class="flex items-center justify-between mb-4">

          <!-- Symbol selector -->
          <div class="flex items-center gap-3">
            <select
              [value]="selectedSymbol()"
              (change)="onSymbolChange($event)"
              class="bg-surface-700 border border-surface-600 text-white text-sm rounded px-3 py-1.5 focus:outline-none focus:border-accent-blue">
              @for (s of watchlist; track s) {
                <option [value]="s">{{ s }}</option>
              }
            </select>

            @if (selectedQuote()) {
              <span class="text-white font-bold text-xl font-mono">
                \${{ selectedQuote()!.price | number:'1.2-2' }}
              </span>
              <fs-price-badge [change]="selectedQuote()!.change" />
              <fs-price-badge [change]="selectedQuote()!.changePercent" [isPercent]="true" />
            }
          </div>

          <!-- Timeframe selector -->
          <div class="flex gap-1">
            @for (tf of timeframes; track tf.value) {
              <button
                (click)="onTimeframeChange(tf)"
                [class]="tf.value === selectedTimeframe().value
                  ? 'bg-accent-blue text-white'
                  : 'text-gray-400 hover:text-white hover:bg-surface-700'"
                class="px-3 py-1 rounded text-xs font-semibold transition-colors">
                {{ tf.label }}
              </button>
            }
          </div>
        </div>

        @defer (on immediate) {
          <fs-candlestick-chart [candles]="candles()" [height]="380" />
        } @placeholder {
          <div class="h-96 flex items-center justify-center text-gray-600">Cargando chart...</div>
        }
      </div>

    </div>
  `,
})
export class DashboardComponent implements OnInit {
  private readonly getQuoteUC   = inject(GetQuoteUseCase);
  private readonly getCandlesUC = inject(GetCandlesUseCase);
  private readonly liveUC       = inject(SubscribeLivePricesUseCase);
  private readonly destroyRef   = inject(DestroyRef);
  private readonly isBrowser    = isPlatformBrowser(inject(PLATFORM_ID));

  watchlist   = WATCHLIST;
  timeframes  = TIMEFRAMES;

  quotes          = signal<Quote[]>([]);
  candles         = signal<Candle | null>(null);
  selectedSymbol  = signal(WATCHLIST[0]);
  selectedQuote   = signal<Quote | null>(null);
  selectedTimeframe = signal(TIMEFRAMES[2]);

  ngOnInit(): void {
    if (!this.isBrowser) return;
    this.loadQuotes();
    this.loadCandles();
    this.subscribeToLivePrices();
  }

  onSymbolChange(event: Event): void {
    const symbol = (event.target as HTMLSelectElement).value;
    this.selectedSymbol.set(symbol);
    this.loadCandles();
    this.loadSelectedQuote();
  }

  onTimeframeChange(tf: typeof TIMEFRAMES[0]): void {
    this.selectedTimeframe.set(tf);
    this.loadCandles();
  }

  private loadQuotes(): void {
    WATCHLIST.forEach(symbol => {
      this.getQuoteUC.execute(symbol).pipe(
        catchError(() => of(null)),
        takeUntilDestroyed(this.destroyRef),
      ).subscribe(q => {
        if (!q) return;
        this.quotes.update(list => {
          const idx = list.findIndex(x => x.symbol === symbol);
          return idx >= 0
            ? list.map((x, i) => i === idx ? q : x)
            : [...list, q];
        });
        if (symbol === this.selectedSymbol()) this.selectedQuote.set(q);
      });
    });
  }

  private loadSelectedQuote(): void {
    this.getQuoteUC.execute(this.selectedSymbol()).pipe(
      catchError(() => of(null)),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe(q => { if (q) this.selectedQuote.set(q); });
  }

  private loadCandles(): void {
    const to   = Math.floor(Date.now() / 1000);
    const from = to - this.selectedTimeframe().days * 86400;
    this.getCandlesUC.execute(this.selectedSymbol(), this.selectedTimeframe().value, from, to).pipe(
      catchError(() => of(null)),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe(c => this.candles.set(c));
  }

  private subscribeToLivePrices(): void {
    WATCHLIST.forEach(s => this.liveUC.subscribe(s));
    this.liveUC.trades$().pipe(
      takeUntilDestroyed(this.destroyRef),
    ).subscribe(trade => {
      this.quotes.update(list =>
        list.map(q => q.symbol === trade.symbol
          ? { ...q, price: trade.price, change: trade.price - q.previousClose, changePercent: ((trade.price - q.previousClose) / q.previousClose) * 100 }
          : q
        )
      );
      if (trade.symbol === this.selectedSymbol()) {
        this.selectedQuote.update(q => q
          ? { ...q, price: trade.price, change: trade.price - q.previousClose, changePercent: ((trade.price - q.previousClose) / q.previousClose) * 100 }
          : q
        );
      }
    });
  }
}

