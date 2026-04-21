import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TopbarComponent } from './shared/components/topbar/topbar.component';
import { SidebarComponent } from './shared/components/sidebar/sidebar.component';

@Component({
  selector: 'fs-root',
  standalone: true,
  imports: [RouterOutlet, TopbarComponent, SidebarComponent],
  template: `
    <div class="flex flex-col h-screen overflow-hidden">
      <fs-topbar />
      <div class="flex flex-1 overflow-hidden">
        <fs-sidebar />
        <main class="flex-1 overflow-auto bg-surface-900 p-4">
          <router-outlet />
        </main>
      </div>
    </div>
  `,
})
export class AppComponent {}
