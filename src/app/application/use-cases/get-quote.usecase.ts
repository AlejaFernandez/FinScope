import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { IStockRepository } from '../../domain/ports/stock-repository.port';
import { Quote } from '../../domain/entities/quote.entity';

@Injectable({ providedIn: 'root' })
export class GetQuoteUseCase {
  private readonly repo = inject(IStockRepository);

  execute(symbol: string): Observable<Quote> {
    return this.repo.getQuote(symbol);
  }
}
