import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NewsItem } from '../../../domain/entities/news.entity';

@Component({
  selector: 'fs-news-feed',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="bg-surface-800 border border-surface-600 rounded-lg p-4">
      <h3 class="text-gray-400 text-xs uppercase tracking-wider mb-3">Latest News</h3>
      <div class="flex flex-col gap-3">
        @for (item of news(); track item.id) {
          <a [href]="item.url" target="_blank" rel="noopener"
             class="flex gap-3 group hover:bg-surface-700 rounded p-2 transition-colors">
            @if (item.image) {
              <img [src]="item.image" alt="" class="w-16 h-16 object-cover rounded flex-shrink-0 bg-surface-600" />
            }
            <div class="flex flex-col gap-1 min-w-0">
              <span class="text-white text-sm font-medium line-clamp-2 group-hover:text-accent-blue transition-colors">
                {{ item.headline }}
              </span>
              <div class="flex gap-2 text-xs text-gray-500">
                <span>{{ item.source }}</span>
                <span>·</span>
                <span>{{ item.datetime * 1000 | date:'MMM d, h:mm a' }}</span>
              </div>
            </div>
          </a>
        } @empty {
          <p class="text-gray-600 text-sm text-center py-4">No news available</p>
        }
      </div>
    </div>
  `,
})
export class NewsFeedComponent {
  news = input<NewsItem[]>([]);
}
