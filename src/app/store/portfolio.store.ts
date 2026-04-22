import { inject } from '@angular/core';
import { signalStore, withState, withMethods, withComputed, patchState } from '@ngrx/signals';
import { computed } from '@angular/core';
import { IStoragePort } from '../domain/ports/storage.port';
import { Position, PositionWithPnl } from '../domain/entities/position.entity';

const STORAGE_KEY = 'fs_portfolio';

interface PortfolioState {
  positions: Position[];
  livePrices: Record<string, number>;
}

export const PortfolioStore = signalStore(
  { providedIn: 'root' },
  withState<PortfolioState>({ positions: [], livePrices: {} }),

  withComputed(({ positions, livePrices }) => ({
    positionsWithPnl: computed<PositionWithPnl[]>(() =>
      positions().map(pos => {
        const currentPrice = livePrices()[pos.symbol] ?? 0;
        const marketValue  = currentPrice * pos.shares;
        const costBasis    = pos.avgCost * pos.shares;
        const pnl          = marketValue - costBasis;
        const pnlPercent   = costBasis > 0 ? (pnl / costBasis) * 100 : 0;
        return { ...pos, currentPrice, marketValue, pnl, pnlPercent };
      })
    ),
    totalValue: computed(() =>
      positions().reduce((sum, pos) => {
        const price = livePrices()[pos.symbol] ?? 0;
        return sum + price * pos.shares;
      }, 0)
    ),
    totalPnl: computed(() =>
      positions().reduce((sum, pos) => {
        const price = livePrices()[pos.symbol] ?? 0;
        return sum + (price - pos.avgCost) * pos.shares;
      }, 0)
    ),
  })),

  withMethods((store) => {
    const storage = inject(IStoragePort);

    const loadFromStorage = (): void => {
      const saved = storage.get<Position[]>(STORAGE_KEY);
      if (saved) patchState(store, { positions: saved });
    };

    const saveToStorage = (): void => {
      storage.set(STORAGE_KEY, store.positions());
    };

    return {
      init: loadFromStorage,

      addPosition(position: Omit<Position, 'id' | 'openedAt'>): void {
        const newPos: Position = {
          ...position,
          id: crypto.randomUUID(),
          openedAt: Date.now(),
        };
        patchState(store, { positions: [...store.positions(), newPos] });
        saveToStorage();
      },

      removePosition(id: string): void {
        patchState(store, { positions: store.positions().filter(p => p.id !== id) });
        saveToStorage();
      },

      updateLivePrice(symbol: string, price: number): void {
        patchState(store, { livePrices: { ...store.livePrices(), [symbol]: price } });
      },
    };
  })
);
