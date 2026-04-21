import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'fs-stock-detail',
  standalone: true,
  imports: [CommonModule],
  template: `<div class="p-8 text-white"><h1 class="text-2xl font-bold">Stock Detail</h1></div>`,
})
export class StockDetailComponent {}
