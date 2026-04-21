import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { of } from 'rxjs';
import { AppComponent } from './app.component';
import { IStockRepository } from './domain/ports/stock-repository.port';
import { IWebSocketPort } from './domain/ports/websocket.port';
import { IStoragePort } from './domain/ports/storage.port';

const mockRepo = { getQuote: jest.fn(() => of(null)), searchStocks: jest.fn(() => of([])), getCandles: jest.fn(() => of(null)), getNews: jest.fn(() => of([])), getMarketStatus: jest.fn(() => of(null)) };
const mockWs = { connect: jest.fn(), disconnect: jest.fn(), subscribe: jest.fn(), unsubscribe: jest.fn(), trades$: jest.fn(() => of()), connectionStatus$: jest.fn(() => of('disconnected')) };
const mockStorage = { get: jest.fn(() => null), set: jest.fn(), remove: jest.fn(), clear: jest.fn() };

describe('AppComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        { provide: IStockRepository, useValue: mockRepo },
        { provide: IWebSocketPort,   useValue: mockWs },
        { provide: IStoragePort,     useValue: mockStorage },
      ],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should render the shell layout', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('fs-topbar')).toBeTruthy();
    expect(el.querySelector('fs-sidebar')).toBeTruthy();
  });
});
