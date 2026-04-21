import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'fs-portfolio',
  standalone: true,
  imports: [CommonModule],
  template: `<div class="p-8 text-white"><h1 class="text-2xl font-bold">Portfolio</h1></div>`,
})
export class PortfolioComponent {}
