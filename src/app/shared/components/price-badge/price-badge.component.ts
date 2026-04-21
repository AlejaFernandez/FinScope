import { Component, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'fs-price-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span [class]="badgeClass()">
      {{ prefix() }}{{ formattedChange() }}
    </span>
  `,
})
export class PriceBadgeComponent {
  change = input.required<number>();
  isPercent = input(false);
  prefix = input('');

  formattedChange = computed(() => {
    const val = this.change();
    const sign = val >= 0 ? '+' : '';
    const suffix = this.isPercent() ? '%' : '';
    return `${sign}${val.toFixed(2)}${suffix}`;
  });

  badgeClass = computed(() => {
    const base = 'text-xs font-semibold px-1.5 py-0.5 rounded';
    return this.change() >= 0
      ? `${base} text-accent-green`
      : `${base} text-accent-red`;
  });
}
