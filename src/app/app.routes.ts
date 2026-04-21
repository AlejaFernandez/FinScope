import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full',
  },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent),
  },
  {
    path: 'stock/:symbol',
    loadComponent: () =>
      import('./features/stock-detail/stock-detail.component').then(m => m.StockDetailComponent),
  },
  {
    path: 'portfolio',
    loadComponent: () =>
      import('./features/portfolio/portfolio.component').then(m => m.PortfolioComponent),
  },
  {
    path: 'alerts',
    loadComponent: () =>
      import('./features/alerts/alerts.component').then(m => m.AlertsComponent),
  },
  {
    path: 'screener',
    loadComponent: () =>
      import('./features/screener/screener.component').then(m => m.ScreenerComponent),
  },
  {
    path: '**',
    redirectTo: 'dashboard',
  },
];
