import type { IStoragePort } from "./IStoragePort";

/**
 * Lớp MemoryStorageAdapter: Hiện thực hóa IStoragePort sử dụng bộ nhớ tạm thời RAM (JavaScript Map).
 * 
 * Mục đích sử dụng:
 * 1. Phương án dự phòng (Fallback): Khi trình duyệt không hỗ trợ hoặc chặn LocalStorage (ví dụ trong môi trường Test, SSR,
 *    hoặc chế độ ẩn danh nghiêm ngặt), hệ thống có thể chuyển sang dùng MemoryStorageAdapter để ứng dụng tiếp tục hoạt động.
 * 2. Phạm vi vòng đời: Dữ liệu chỉ tồn tại trong vòng đời của phiên chạy hiện tại trên RAM;
 *    sẽ bị xóa sạch khi người dùng tải lại trang (F5) hoặc đóng tab.
 */
export class MemoryStorageAdapter implements IStoragePort {
  /** Map lưu trữ dữ liệu key-value trong bộ nhớ tiến trình JavaScript */
  private readonly data = new Map<string, string>();

  /**
   * Lấy giá trị chuỗi từ bộ nhớ RAM theo key.
   * @param key Khóa cần tìm
   * @returns Chuỗi dữ liệu hoặc null nếu không tồn tại
   */
  public get(key: string): string | null {
    return this.data.get(key) ?? null;
  }

  /**
   * Gán giá trị vào Map.
   * @param key Khóa định danh
   * @param value Giá trị chuỗi cần lưu
   */
  public set(key: string, value: string): void {
    this.data.set(key, value);
  }

  /**
   * Xóa một phần tử khỏi Map theo key.
   * @param key Khóa cần xóa
   */
  public remove(key: string): void {
    this.data.delete(key);
  }
}
