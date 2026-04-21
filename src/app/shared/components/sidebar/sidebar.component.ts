import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, RouterLinkActive } from '@angular/router';

interface NavItem {
  path: string;
  label: string;
  icon: string;
}

@Component({
  selector: 'fs-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule, RouterLinkActive],
  template: `
    <aside class="w-52 bg-surface-800 border-r border-surface-600 flex flex-col h-full">
      <nav class="flex flex-col gap-1 p-3 mt-2">
        @for (item of navItems; track item.path) {
          <a
            [routerLink]="item.path"
            routerLinkActive="bg-surface-700 text-white"
            class="flex items-center gap-3 px-3 py-2 rounded text-gray-400 hover:text-white hover:bg-surface-700 transition-colors text-sm"
          >
            <span class="text-base">{{ item.icon }}</span>
            <span>{{ item.label }}</span>
          </a>
        }
      </nav>

      <div class="mt-4 px-3">
        <p class="text-gray-600 text-xs uppercase tracking-wider mb-2 px-3">Watchlist</p>
        <div class="flex flex-col gap-1">
          @for (symbol of watchlist(); track symbol) {
            <a
              [routerLink]="['/stock', symbol]"
              class="flex justify-between items-center px-3 py-1.5 rounded hover:bg-surface-700 transition-colors cursor-pointer"
            >
              <span class="text-white text-xs font-semibold">{{ symbol }}</span>
              <span class="text-gray-500 text-xs">—</span>
            </a>
          }
        </div>
      </div>
    </aside>
  `,
})
export class SidebarComponent {
  navItems: NavItem[] = [
    { path: '/dashboard', label: 'Dashboard',  icon: '▦' },
    { path: '/portfolio', label: 'Portfolio',  icon: '◈' },
    { path: '/alerts',    label: 'Alerts',     icon: '◎' },
    { path: '/screener',  label: 'Screener',   icon: '⊞' },
  ];

  watchlist = signal(['AAPL', 'TSLA', 'NVDA', 'MSFT', 'AMZN', 'META', 'GOOGL']);
}
