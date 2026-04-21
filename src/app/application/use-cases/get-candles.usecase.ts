import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { IStockRepository } from '../../domain/ports/stock-repository.port';
import { Candle, Timeframe } from '../../domain/entities/candle.entity';

@Injectable({ providedIn: 'root' })
export class GetCandlesUseCase {
  private readonly repo = inject(IStockRepository);

  execute(symbol: string, resolution: Timeframe, from: number, to: number): Observable<Candle> {
    return this.repo.getCandles(symbol, resolution, from, to);
  }
}
