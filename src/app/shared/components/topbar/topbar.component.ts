import { Component, OnInit, inject, signal, DestroyRef, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { interval, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { GetQuoteUseCase } from '../../../application/use-cases/get-quote.usecase';
import { Quote } from '../../../domain/entities/quote.entity';
import { PriceBadgeComponent } from '../price-badge/price-badge.component';

interface MarketSymbol {
  symbol: string;
  label: string;
  quote: Quote | null;
}

@Component({
  selector: 'fs-topbar',
  standalone: true,
  imports: [CommonModule, PriceBadgeComponent],
  template: `
    <header class="h-10 bg-surface-800 border-b border-surface-600 flex items-center px-4 gap-6 text-xs">
      <span class="text-accent-blue font-bold tracking-widest text-sm">FINSCOPE</span>

      <div class="flex items-center gap-6 ml-4">
        @for (item of symbols(); track item.symbol) {
          <div class="flex items-center gap-2">
            <span class="text-gray-400">{{ item.label }}</span>
            @if (item.quote) {
              <span class="text-white font-semibold">\${{ item.quote.price | number:'1.2-2' }}</span>
              <fs-price-badge [change]="item.quote.changePercent" [isPercent]="true" />
            } @else {
              <span class="text-gray-600">---</span>
            }
          </div>
        }
      </div>

      <div class="ml-auto flex items-center gap-2">
        <span [class]="marketOpen() ? 'text-accent-green' : 'text-accent-red'" class="text-xs">●</span>
        <span class="text-gray-400">{{ marketOpen() ? 'Market Open' : 'Market Closed' }}</span>
      </div>
    </header>
  `,
})
export class TopbarComponent implements OnInit {
  private readonly getQuote = inject(GetQuoteUseCase);
  private readonly destroyRef = inject(DestroyRef);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  marketOpen = signal(this.isMarketHours());
  symbols = signal<MarketSymbol[]>([
    { symbol: 'SPY',  label: 'S&P 500', quote: null },
    { symbol: 'QQQ',  label: 'NASDAQ',  quote: null },
    { symbol: 'DIA',  label: 'DOW',     quote: null },
    { symbol: 'IWM',  label: 'R2000',   quote: null },
  ]);

  ngOnInit(): void {
    if (!this.isBrowser) return;
    this.loadQuotes();
    interval(30000)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.loadQuotes());
  }

  private loadQuotes(): void {
    this.symbols().forEach(item => {
      this.getQuote.execute(item.symbol)
        .pipe(
          catchError(() => of(null)),
          takeUntilDestroyed(this.destroyRef),
        )
        .subscribe(quote => {
          if (!quote) return;
          this.symbols.update(list =>
            list.map(s => s.symbol === item.symbol ? { ...s, quote } : s)
          );
        });
    });
  }

  private isMarketHours(): boolean {
    const now = new Date();
    const ny = new Date(now.toLocaleString('en-US', { timeZone: 'America/New_York' }));
    const day = ny.getDay();
    const hour = ny.getHours() + ny.getMinutes() / 60;
    return day >= 1 && day <= 5 && hour >= 9.5 && hour < 16;
  }
}
