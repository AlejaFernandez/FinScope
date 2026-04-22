import { Component, OnInit, inject, DestroyRef, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { PortfolioStore } from '../../store/portfolio.store';
import { SubscribeLivePricesUseCase } from '../../application/use-cases/subscribe-live-prices.usecase';
import { AddPositionFormComponent } from './components/add-position-form.component';
import { Position } from '../../domain/entities/position.entity';

@Component({
  selector: 'fs-portfolio',
  standalone: true,
  imports: [CommonModule, AddPositionFormComponent],
  template: `
    <div class="flex flex-col gap-4">

      <!-- Header stats -->
      <div class="grid grid-cols-2 md:grid-cols-3 gap-3">
        <div class="bg-surface-800 border border-surface-600 rounded-lg p-4">
          <p class="text-gray-500 text-xs uppercase tracking-wider mb-1">Total Value</p>
          <p class="text-white text-2xl font-bold font-mono">\${{ store.totalValue() | number:'1.2-2' }}</p>
        </div>
        <div class="bg-surface-800 border border-surface-600 rounded-lg p-4">
          <p class="text-gray-500 text-xs uppercase tracking-wider mb-1">Total P&L</p>
          <p class="text-2xl font-bold font-mono" [class]="store.totalPnl() >= 0 ? 'text-accent-green' : 'text-accent-red'">
            {{ store.totalPnl() >= 0 ? '+' : '' }}\${{ store.totalPnl() | number:'1.2-2' }}
          </p>
        </div>
        <div class="bg-surface-800 border border-surface-600 rounded-lg p-4">
          <p class="text-gray-500 text-xs uppercase tracking-wider mb-1">Positions</p>
          <p class="text-white text-2xl font-bold font-mono">{{ store.positions().length }}</p>
        </div>
      </div>

      <!-- Add position form -->
      <fs-add-position-form (positionAdded)="onPositionAdded($event)" />

      <!-- Positions table -->
      <div class="bg-surface-800 border border-surface-600 rounded-lg overflow-hidden">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b border-surface-600 text-gray-500 text-xs uppercase tracking-wider">
              <th class="text-left px-4 py-3">Symbol</th>
              <th class="text-right px-4 py-3">Shares</th>
              <th class="text-right px-4 py-3">Avg Cost</th>
              <th class="text-right px-4 py-3">Current</th>
              <th class="text-right px-4 py-3">Mkt Value</th>
              <th class="text-right px-4 py-3">P&L</th>
              <th class="text-right px-4 py-3">P&L %</th>
              <th class="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            @for (pos of store.positionsWithPnl(); track pos.id) {
              <tr class="border-b border-surface-700 hover:bg-surface-700 transition-colors">
                <td class="px-4 py-3 font-bold text-white">{{ pos.symbol }}</td>
                <td class="px-4 py-3 text-right text-gray-300 font-mono">{{ pos.shares }}</td>
                <td class="px-4 py-3 text-right text-gray-300 font-mono">\${{ pos.avgCost | number:'1.2-2' }}</td>
                <td class="px-4 py-3 text-right font-mono text-white">\${{ pos.currentPrice | number:'1.2-2' }}</td>
                <td class="px-4 py-3 text-right font-mono text-white">\${{ pos.marketValue | number:'1.2-2' }}</td>
                <td class="px-4 py-3 text-right font-mono font-semibold"
                    [class]="pos.pnl >= 0 ? 'text-accent-green' : 'text-accent-red'">
                  {{ pos.pnl >= 0 ? '+' : '' }}\${{ pos.pnl | number:'1.2-2' }}
                </td>
                <td class="px-4 py-3 text-right font-mono font-semibold"
                    [class]="pos.pnlPercent >= 0 ? 'text-accent-green' : 'text-accent-red'">
                  {{ pos.pnlPercent >= 0 ? '+' : '' }}{{ pos.pnlPercent | number:'1.2-2' }}%
                </td>
                <td class="px-4 py-3 text-right">
                  <button (click)="store.removePosition(pos.id)"
                          class="text-gray-600 hover:text-accent-red transition-colors text-xs">✕</button>
                </td>
              </tr>
            } @empty {
              <tr>
                <td colspan="8" class="px-4 py-8 text-center text-gray-600">
                  No positions yet — add one above
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>

    </div>
  `,
})
export class PortfolioComponent implements OnInit {
  store      = inject(PortfolioStore);
  private liveUC     = inject(SubscribeLivePricesUseCase);
  private destroyRef = inject(DestroyRef);
  private isBrowser  = isPlatformBrowser(inject(PLATFORM_ID));

  ngOnInit(): void {
    this.store.init();
    if (!this.isBrowser) return;
    this.subscribeToLive();
  }

  onPositionAdded(pos: Omit<Position, 'id' | 'openedAt'>): void {
    this.store.addPosition(pos);
    this.liveUC.subscribe(pos.symbol);
  }

  private subscribeToLive(): void {
    this.store.positions().forEach(p => this.liveUC.subscribe(p.symbol));
    this.liveUC.trades$().pipe(
      takeUntilDestroyed(this.destroyRef),
    ).subscribe(t => this.store.updateLivePrice(t.symbol, t.price));
  }
}
