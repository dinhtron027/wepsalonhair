import type { IStoragePort } from "./IStoragePort";

export class MemoryStorageAdapter implements IStoragePort {
  private readonly data = new Map<string, string>();

  public get(key: string): string | null {
    return this.data.get(key) ?? null;
  }

  public set(key: string, value: string): void {
    this.data.set(key, value);
  }

  public remove(key: string): void {
    this.data.delete(key);
  }
}
