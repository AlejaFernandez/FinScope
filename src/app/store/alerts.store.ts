import { inject } from '@angular/core';
import { signalStore, withState, withMethods, patchState } from '@ngrx/signals';
import { IStoragePort } from '../domain/ports/storage.port';
import { Alert, AlertCondition } from '../domain/entities/alert.entity';

const STORAGE_KEY = 'fs_alerts';

interface AlertsState {
  alerts: Alert[];
  triggered: Alert[];
}

export const AlertsStore = signalStore(
  { providedIn: 'root' },
  withState<AlertsState>({ alerts: [], triggered: [] }),

  withMethods((store) => {
    const storage = inject(IStoragePort);

    const save = (): void => storage.set(STORAGE_KEY, store.alerts());

    return {
      init(): void {
        const saved = storage.get<Alert[]>(STORAGE_KEY);
        if (saved) patchState(store, { alerts: saved });
      },

      addAlert(symbol: string, condition: AlertCondition, targetPrice: number): void {
        const alert: Alert = {
          id: crypto.randomUUID(),
          symbol,
          condition,
          targetPrice,
          createdAt: Date.now(),
          triggered: false,
        };
        patchState(store, { alerts: [...store.alerts(), alert] });
        save();
      },

      removeAlert(id: string): void {
        patchState(store, { alerts: store.alerts().filter(a => a.id !== id) });
        save();
      },

      evaluatePrice(symbol: string, price: number): Alert | null {
        let fired: Alert | null = null;
        const updated = store.alerts().map(a => {
          if (a.triggered || a.symbol !== symbol) return a;
          const hit = a.condition === 'above' ? price >= a.targetPrice : price <= a.targetPrice;
          if (hit) {
            fired = { ...a, triggered: true, triggeredAt: Date.now() };
            return fired;
          }
          return a;
        });
        patchState(store, { alerts: updated });
        if (fired) {
          patchState(store, { triggered: [...store.triggered(), fired!] });
          save();
        }
        return fired;
      },

      clearTriggered(): void {
        patchState(store, { triggered: [] });
      },
    };
  })
);
