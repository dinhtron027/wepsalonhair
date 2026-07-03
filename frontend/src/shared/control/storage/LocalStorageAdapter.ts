import type { IStoragePort } from "./IStoragePort";

export class LocalStorageAdapter implements IStoragePort {
  public get(key: string): string | null {
    try {
      return window.localStorage.getItem(key);
    } catch (e) {
      console.warn("localStorage.getItem is not available:", e);
      return null;
    }
  }

  public set(key: string, value: string): void {
    try {
      window.localStorage.setItem(key, value);
    } catch (e) {
      console.warn("localStorage.setItem is not available:", e);
    }
  }

  public remove(key: string): void {
    try {
      window.localStorage.removeItem(key);
    } catch (e) {
      console.warn("localStorage.removeItem is not available:", e);
    }
  }
}
