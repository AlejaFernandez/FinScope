import { ApplicationConfig, provideZoneChangeDetection, APP_INITIALIZER } from '@angular/core';
import { provideRouter, withPreloading, PreloadAllModules } from '@angular/router';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';

import { routes } from './app.routes';
import { IStockRepository } from './domain/ports/stock-repository.port';
import { IWebSocketPort } from './domain/ports/websocket.port';
import { IStoragePort } from './domain/ports/storage.port';
import { FinnhubHttpAdapter } from './infrastructure/adapters/http/finnhub-http.adapter';
import { FinnhubWebSocketAdapter } from './infrastructure/adapters/websocket/finnhub-websocket.adapter';
import { LocalStorageAdapter } from './infrastructure/adapters/storage/localstorage.adapter';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes, withPreloading(PreloadAllModules)),
    provideHttpClient(withFetch()),
    provideClientHydration(withEventReplay()),
    { provide: IStockRepository, useClass: FinnhubHttpAdapter },
    { provide: IWebSocketPort, useClass: FinnhubWebSocketAdapter },
    { provide: IStoragePort, useClass: LocalStorageAdapter },
    {
      provide: APP_INITIALIZER,
      useFactory: (ws: IWebSocketPort) => () => ws.connect(),
      deps: [IWebSocketPort],
      multi: true,
    },
  ],
};
