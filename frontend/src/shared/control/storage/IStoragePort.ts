/**
 * Interface IStoragePort: Định nghĩa hợp đồng (Interface Contract) cho các bộ điều hợp lưu trữ (Storage Adapters).
 * 
 * Mục đích kiến trúc:
 * - Áp dụng nguyên lý Đảo ngược phụ thuộc (Dependency Inversion Principle - SOLID):
 *   Các module nghiệp vụ phía trên phụ thuộc vào abstraction (IStoragePort) chứ không phụ thuộc trực tiếp vào
 *   công nghệ lưu trữ cụ thể (như window.localStorage hay in-memory Map).
 * - Giúp dễ dàng thay thế từ LocalStorage sang MemoryStorage (khi chạy kiểm thử unit test hoặc khi người dùng tắt cookie).
 */
export interface IStoragePort {
  /**
   * Lấy giá trị chuỗi lưu trữ theo khóa định danh.
   * @param key Khóa định danh của phần tử cần lấy (ví dụ: 'token', 'salon-auth-storage')
   * @returns Chuỗi dữ liệu nếu tồn tại, hoặc null nếu không tìm thấy
   */
  get(key: string): string | null;

  /**
   * Lưu trữ một cặp khóa - giá trị vào bộ nhớ.
   * @param key Khóa định danh
   * @param value Giá trị chuỗi cần lưu (chuỗi thông thường hoặc chuỗi JSON sau khi JSON.stringify)
   */
  set(key: string, value: string): void;

  /**
   * Xóa bỏ phần tử khỏi bộ nhớ lưu trữ theo khóa định danh.
   * @param key Khóa định danh của phần tử cần xóa (thường dùng khi đăng xuất người dùng)
   */
  remove(key: string): void;
}
