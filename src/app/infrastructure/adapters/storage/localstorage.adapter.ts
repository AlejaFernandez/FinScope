import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { IStoragePort } from '../../../domain/ports/storage.port';

@Injectable()
export class LocalStorageAdapter implements IStoragePort {
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  get<T>(key: string): T | null {
    if (!this.isBrowser) return null;
    const item = localStorage.getItem(key);
    return item ? (JSON.parse(item) as T) : null;
  }

  set<T>(key: string, value: T): void {
    if (!this.isBrowser) return;
    localStorage.setItem(key, JSON.stringify(value));
  }

  remove(key: string): void {
    if (!this.isBrowser) return;
    localStorage.removeItem(key);
  }

  clear(): void {
    if (!this.isBrowser) return;
    localStorage.clear();
  }
}
