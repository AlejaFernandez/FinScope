import { Component, inject, signal, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { debounceTime, distinctUntilChanged, switchMap, catchError, of } from 'rxjs';
import { SearchStocksUseCase } from '../../application/use-cases/search-stocks.usecase';
import { Stock } from '../../domain/entities/stock.entity';

@Component({
  selector: 'fs-screener',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, ScrollingModule],
  template: `
    <div class="flex flex-col gap-4">

      <!-- Search input -->
      <div class="relative">
        <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">⌕</span>
        <input
          [formControl]="searchCtrl"
          placeholder="Search stocks — e.g. Apple, TSLA, NVDA..."
          class="w-full bg-surface-800 border border-surface-600 text-white text-sm rounded-lg
                 pl-8 pr-4 py-2.5 focus:outline-none focus:border-accent-blue transition-colors"
        />
        @if (loading()) {
          <span class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-xs animate-pulse">searching...</span>
        }
      </div>

      <!-- Results -->
      <div class="bg-surface-800 border border-surface-600 rounded-lg overflow-hidden">
        <div class="px-4 py-2 border-b border-surface-600 text-gray-500 text-xs">
          {{ results().length }} results
        </div>

        @if (results().length > 0) {
          <cdk-virtual-scroll-viewport itemSize="48" class="h-96">
            <table class="w-full text-sm">
              <tbody>
                <tr *cdkVirtualFor="let stock of results(); trackBy: trackBySymbol"
                    [routerLink]="['/stock', stock.symbol]"
                    class="flex items-center px-4 h-12 border-b border-surface-700
                           hover:bg-surface-700 cursor-pointer transition-colors">
                  <td class="w-24 font-bold text-white">{{ stock.symbol }}</td>
                  <td class="flex-1 text-gray-300 truncate">{{ stock.name }}</td>
                  <td class="w-28 text-right text-gray-500 text-xs">{{ stock.exchange }}</td>
                </tr>
              </tbody>
            </table>
          </cdk-virtual-scroll-viewport>
        } @else if (!loading() && searchCtrl.value) {
          <p class="text-center text-gray-600 py-8">No results for "{{ searchCtrl.value }}"</p>
        } @else if (!searchCtrl.value) {
          <p class="text-center text-gray-600 py-8">Type a symbol or company name to search</p>
        }
      </div>

    </div>
  `,
})
export class ScreenerComponent {
  private readonly searchUC  = inject(SearchStocksUseCase);
  private readonly destroyRef = inject(DestroyRef);

  searchCtrl = new FormControl('', { nonNullable: true });
  results    = signal<Stock[]>([]);
  loading    = signal(false);

  constructor() {
    this.searchCtrl.valueChanges.pipe(
      debounceTime(400),
      distinctUntilChanged(),
      switchMap(q => {
        if (!q || q.length < 1) { this.results.set([]); return of([]); }
        this.loading.set(true);
        return this.searchUC.execute(q).pipe(catchError(() => of([])));
      }),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe(r => {
      this.results.set(r);
      this.loading.set(false);
    });
  }

  trackBySymbol(_: number, s: Stock): string { return s.symbol; }
}
