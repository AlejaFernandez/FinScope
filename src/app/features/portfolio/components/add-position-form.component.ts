import { Component, output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Position } from '../../../domain/entities/position.entity';

@Component({
  selector: 'fs-add-position-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <form [formGroup]="form" (ngSubmit)="onSubmit()"
          class="bg-surface-800 border border-surface-600 rounded-lg p-4 flex flex-wrap gap-3 items-end">
      <div class="flex flex-col gap-1">
        <label class="text-gray-400 text-xs uppercase tracking-wider">Symbol</label>
        <input formControlName="symbol" placeholder="AAPL"
               class="bg-surface-700 border border-surface-600 text-white text-sm rounded px-3 py-1.5 w-28 uppercase
                      focus:outline-none focus:border-accent-blue" />
      </div>
      <div class="flex flex-col gap-1">
        <label class="text-gray-400 text-xs uppercase tracking-wider">Shares</label>
        <input formControlName="shares" type="number" min="0.001" placeholder="10"
               class="bg-surface-700 border border-surface-600 text-white text-sm rounded px-3 py-1.5 w-28
                      focus:outline-none focus:border-accent-blue" />
      </div>
      <div class="flex flex-col gap-1">
        <label class="text-gray-400 text-xs uppercase tracking-wider">Avg Cost</label>
        <input formControlName="avgCost" type="number" min="0.01" placeholder="150.00"
               class="bg-surface-700 border border-surface-600 text-white text-sm rounded px-3 py-1.5 w-32
                      focus:outline-none focus:border-accent-blue" />
      </div>
      <button type="submit" [disabled]="form.invalid"
              class="px-4 py-1.5 bg-accent-blue text-white text-sm rounded font-semibold
                     hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
        Add Position
      </button>
    </form>
  `,
})
export class AddPositionFormComponent {
  positionAdded = output<Omit<Position, 'id' | 'openedAt'>>();

  form = inject(FormBuilder).nonNullable.group({
    symbol:  ['', [Validators.required, Validators.minLength(1)]],
    shares:  [0,  [Validators.required, Validators.min(0.001)]],
    avgCost: [0,  [Validators.required, Validators.min(0.01)]],
  });

  onSubmit(): void {
    if (this.form.invalid) return;
    const { symbol, shares, avgCost } = this.form.getRawValue();
    this.positionAdded.emit({ symbol: symbol.toUpperCase(), shares, avgCost });
    this.form.reset({ symbol: '', shares: 0, avgCost: 0 });
  }
}
