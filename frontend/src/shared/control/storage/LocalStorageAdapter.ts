import type { IStoragePort } from "./IStoragePort";

export class LocalStorageAdapter implements IStoragePort {
  public get(key: string): string | null {
    return window.localStorage.getItem(key);
  }

  public set(key: string, value: string): void {
    window.localStorage.setItem(key, value);
  }

  public remove(key: string): void {
    window.localStorage.removeItem(key);
  }
}
