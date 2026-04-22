import {
  Component, input, effect, ElementRef, viewChild, OnDestroy, PLATFORM_ID, inject,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Candle } from '../../../domain/entities/candle.entity';

@Component({
  selector: 'fs-candlestick-chart',
  standalone: true,
  template: `<div #chartContainer class="w-full" [style.height.px]="height()"></div>`,
})
export class CandlestickChartComponent implements OnDestroy {
  candles  = input<Candle | null>(null);
  height   = input(320);

  private chartRef = viewChild<ElementRef>('chartContainer');
  private chart: any = null;
  private series: any = null;
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  constructor() {
    effect(() => {
      const candles = this.candles();
      if (!this.isBrowser || !candles || candles.status !== 'ok') return;
      this.renderChart(candles);
    });
  }

  private async renderChart(candles: Candle): Promise<void> {
    const el = this.chartRef()?.nativeElement;
    if (!el) return;

    const { createChart, CandlestickSeries } = await import('lightweight-charts');

    if (!this.chart) {
      this.chart = createChart(el, {
        layout: { background: { color: '#0f1629' }, textColor: '#9ca3af' },
        grid: { vertLines: { color: '#1c2645' }, horzLines: { color: '#1c2645' } },
        timeScale: { borderColor: '#1c2645', timeVisible: true },
        rightPriceScale: { borderColor: '#1c2645' },
        width: el.clientWidth,
        height: this.height(),
      });
      this.series = this.chart.addSeries(CandlestickSeries, {
        upColor: '#22c55e', downColor: '#ef4444',
        borderUpColor: '#22c55e', borderDownColor: '#ef4444',
        wickUpColor: '#22c55e', wickDownColor: '#ef4444',
      });

      new ResizeObserver(() => this.chart?.applyOptions({ width: el.clientWidth }))
        .observe(el);
    }

    const data = candles.timestamp.map((t, i) => ({
      time: t as any,
      open:  candles.open[i],
      high:  candles.high[i],
      low:   candles.low[i],
      close: candles.close[i],
    }));

    this.series.setData(data);
    this.chart.timeScale().fitContent();
  }

  ngOnDestroy(): void {
    this.chart?.remove();
  }
}
