import { Component, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Quote } from '../../../domain/entities/quote.entity';
import { PriceBadgeComponent } from '../../../shared/components/price-badge/price-badge.component';

@Component({
  selector: 'fs-quote-card',
  standalone: true,
  imports: [CommonModule, RouterModule, PriceBadgeComponent],
  template: `
    <a [routerLink]="['/stock', quote().symbol]"
       class="block bg-surface-800 border border-surface-600 rounded-lg p-4 hover:border-accent-blue transition-colors cursor-pointer">
      <div class="flex justify-between items-start mb-2">
        <span class="text-white font-bold text-sm">{{ quote().symbol }}</span>
        <fs-price-badge [change]="quote().changePercent" [isPercent]="true" />
      </div>
      <div class="text-2xl font-bold font-mono" [class]="priceColor()">
        \${{ quote().price | number:'1.2-2' }}
      </div>
      <div class="flex justify-between mt-2 text-xs text-gray-500">
        <span>H: \${{ quote().high | number:'1.2-2' }}</span>
        <span>L: \${{ quote().low  | number:'1.2-2' }}</span>
      </div>
    </a>
  `,
})
export class QuoteCardComponent {
  quote = input.required<Quote>();

  priceColor = computed(() =>
    this.quote().change >= 0 ? 'text-accent-green' : 'text-accent-red'
  );
}
