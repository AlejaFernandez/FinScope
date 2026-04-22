import { Component, OnInit, inject, signal, DestroyRef, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AlertsStore } from '../../store/alerts.store';
import { SubscribeLivePricesUseCase } from '../../application/use-cases/subscribe-live-prices.usecase';
import { AlertCondition } from '../../domain/entities/alert.entity';

@Component({
  selector: 'fs-alerts',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="flex flex-col gap-4">

      <!-- Toast notifications -->
      <div class="fixed top-14 right-4 z-50 flex flex-col gap-2">
        @for (a of store.triggered(); track a.id) {
          <div class="bg-amber-900 border border-amber-500 text-amber-200 rounded-lg px-4 py-3 text-sm flex items-center gap-3 shadow-lg">
            <span class="text-amber-400">◎</span>
            <span><strong>{{ a.symbol }}</strong> hit \${{ a.targetPrice | number:'1.2-2' }}</span>
            <button (click)="store.clearTriggered()" class="ml-auto text-amber-400 hover:text-white">✕</button>
          </div>
        }
      </div>

      <!-- Add alert form -->
      <form [formGroup]="form" (ngSubmit)="onSubmit()"
            class="bg-surface-800 border border-surface-600 rounded-lg p-4 flex flex-wrap gap-3 items-end">
        <div class="flex flex-col gap-1">
          <label class="text-gray-400 text-xs uppercase tracking-wider">Symbol</label>
          <input formControlName="symbol" placeholder="AAPL"
                 class="bg-surface-700 border border-surface-600 text-white text-sm rounded px-3 py-1.5 w-28 uppercase
                        focus:outline-none focus:border-accent-blue" />
        </div>
        <div class="flex flex-col gap-1">
          <label class="text-gray-400 text-xs uppercase tracking-wider">Condition</label>
          <select formControlName="condition"
                  class="bg-surface-700 border border-surface-600 text-white text-sm rounded px-3 py-1.5
                         focus:outline-none focus:border-accent-blue">
            <option value="above">Price Above</option>
            <option value="below">Price Below</option>
          </select>
        </div>
        <div class="flex flex-col gap-1">
          <label class="text-gray-400 text-xs uppercase tracking-wider">Target Price</label>
          <input formControlName="targetPrice" type="number" min="0.01" placeholder="200.00"
                 class="bg-surface-700 border border-surface-600 text-white text-sm rounded px-3 py-1.5 w-32
                        focus:outline-none focus:border-accent-blue" />
        </div>
        <button type="submit" [disabled]="form.invalid"
                class="px-4 py-1.5 bg-accent-blue text-white text-sm rounded font-semibold
                       hover:bg-blue-500 disabled:opacity-40 transition-colors">
          Set Alert
        </button>
      </form>

      <!-- Alerts list -->
      <div class="bg-surface-800 border border-surface-600 rounded-lg overflow-hidden">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b border-surface-600 text-gray-500 text-xs uppercase tracking-wider">
              <th class="text-left px-4 py-3">Symbol</th>
              <th class="text-left px-4 py-3">Condition</th>
              <th class="text-right px-4 py-3">Target</th>
              <th class="text-left px-4 py-3">Status</th>
              <th class="text-left px-4 py-3">Created</th>
              <th class="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            @for (alert of store.alerts(); track alert.id) {
              <tr class="border-b border-surface-700 hover:bg-surface-700 transition-colors"
                  [class.opacity-50]="alert.triggered">
                <td class="px-4 py-3 font-bold text-white">{{ alert.symbol }}</td>
                <td class="px-4 py-3 text-gray-300">
                  {{ alert.condition === 'above' ? '▲ Above' : '▼ Below' }}
                </td>
                <td class="px-4 py-3 text-right font-mono text-white">
                  \${{ alert.targetPrice | number:'1.2-2' }}
                </td>
                <td class="px-4 py-3">
                  @if (alert.triggered) {
                    <span class="text-xs px-2 py-0.5 rounded bg-accent-green/20 text-accent-green">Triggered</span>
                  } @else {
                    <span class="text-xs px-2 py-0.5 rounded bg-accent-blue/20 text-accent-blue">Active</span>
                  }
                </td>
                <td class="px-4 py-3 text-gray-500 text-xs">
                  {{ alert.createdAt | date:'MMM d, h:mm a' }}
                </td>
                <td class="px-4 py-3 text-right">
                  <button (click)="store.removeAlert(alert.id)"
                          class="text-gray-600 hover:text-accent-red transition-colors text-xs">✕</button>
                </td>
              </tr>
            } @empty {
              <tr>
                <td colspan="6" class="px-4 py-8 text-center text-gray-600">
                  No alerts set — create one above
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </div>
  `,
})
export class AlertsComponent implements OnInit {
  store      = inject(AlertsStore);
  private liveUC     = inject(SubscribeLivePricesUseCase);
  private destroyRef = inject(DestroyRef);
  private isBrowser  = isPlatformBrowser(inject(PLATFORM_ID));

  form = inject(FormBuilder).nonNullable.group({
    symbol:      ['', Validators.required],
    condition:   ['above' as AlertCondition],
    targetPrice: [0, [Validators.required, Validators.min(0.01)]],
  });

  ngOnInit(): void {
    this.store.init();
    if (!this.isBrowser) return;
    this.subscribeToLive();
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    const { symbol, condition, targetPrice } = this.form.getRawValue();
    this.store.addAlert(symbol.toUpperCase(), condition, targetPrice);
    this.liveUC.subscribe(symbol.toUpperCase());
    this.form.reset({ symbol: '', condition: 'above', targetPrice: 0 });
  }

  private subscribeToLive(): void {
    this.store.alerts().forEach(a => this.liveUC.subscribe(a.symbol));
    this.liveUC.trades$().pipe(
      takeUntilDestroyed(this.destroyRef),
    ).subscribe(t => this.store.evaluatePrice(t.symbol, t.price));
  }
}
