import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { IStockRepository } from '../../domain/ports/stock-repository.port';
import { Stock } from '../../domain/entities/stock.entity';

@Injectable({ providedIn: 'root' })
export class SearchStocksUseCase {
  private readonly repo = inject(IStockRepository);

  execute(query: string): Observable<Stock[]> {
    return this.repo.searchStocks(query);
  }
}
