import { Component, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Quote } from '../../../domain/entities/quote.entity';
import { PriceBadgeComponent } from '../../../shared/components/price-badge/price-badge.component';

@Component({
  selector: 'fs-stock-info-panel',
  standalone: true,
  imports: [CommonModule, PriceBadgeComponent],
  template: `
    <div class="bg-surface-800 border border-surface-600 rounded-lg p-4">
      <div class="flex items-baseline gap-3 mb-3">
        <span class="text-3xl font-bold font-mono" [class]="priceColor()">
          \${{ quote().price | number:'1.2-2' }}
        </span>
        <fs-price-badge [change]="quote().change" />
        <fs-price-badge [change]="quote().changePercent" [isPercent]="true" />
      </div>

      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
        <div class="flex flex-col gap-1">
          <span class="text-gray-500 uppercase tracking-wider">Open</span>
          <span class="text-white font-mono">\${{ quote().open | number:'1.2-2' }}</span>
        </div>
        <div class="flex flex-col gap-1">
          <span class="text-gray-500 uppercase tracking-wider">Prev Close</span>
          <span class="text-white font-mono">\${{ quote().previousClose | number:'1.2-2' }}</span>
        </div>
        <div class="flex flex-col gap-1">
          <span class="text-gray-500 uppercase tracking-wider">Day High</span>
          <span class="text-accent-green font-mono">\${{ quote().high | number:'1.2-2' }}</span>
        </div>
        <div class="flex flex-col gap-1">
          <span class="text-gray-500 uppercase tracking-wider">Day Low</span>
          <span class="text-accent-red font-mono">\${{ quote().low | number:'1.2-2' }}</span>
        </div>
      </div>
    </div>
  `,
})
export class StockInfoPanelComponent {
  quote = input.required<Quote>();
  priceColor = computed(() => this.quote().change >= 0 ? 'text-accent-green' : 'text-accent-red');
}
