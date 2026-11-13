import type { IStoragePort } from "./IStoragePort";

/**
 * Lớp LocalStorageAdapter: Hiện thực hóa IStoragePort sử dụng Web Storage API (LocalStorage).
 * 
 * Kiến thức kỹ thuật cho bài tiểu luận Web:
 * 1. Khái niệm LocalStorage:
 *    - Là cơ chế lưu trữ dữ liệu phía Client (trình duyệt) theo cặp key-value với dung lượng ~5MB - 10MB.
 *    - Dữ liệu tồn tại vĩnh viễn (persistent), không bị mất đi khi người dùng tải lại trang (F5) hoặc đóng trình duyệt.
 *    - Chỉ lưu trữ được dữ liệu dạng chuỗi (String). Khi muốn lưu object/mảng, cần dùng JSON.stringify(),
 *      và khi đọc ra thì dùng JSON.parse().
 * 
 * 2. Tại sao phải bọc trong khối try/catch?
 *    - Một số trường hợp trình duyệt chặn truy cập LocalStorage:
 *      + Người dùng bật chế độ ẩn danh (Private / Incognito Mode) với chính sách chặn cookie nghiêm ngặt.
 *      + Người dùng tắt quyền lưu trữ trong Cài đặt bảo mật trình duyệt.
 *      + Bộ nhớ LocalStorage đã đạt đến hạn mức tối đa (QuotaExceededError).
 *    - Nếu gọi trực tiếp window.localStorage trong các tình huống trên mà không có try/catch,
 *      trình duyệt sẽ ném ngoại lệ (throw DOMException) làm toàn bộ ứng dụng web bị crash (màn hình trắng).
 *    - Việc bọc try/catch giúp ứng dụng hoạt động an toàn, ghi nhận cảnh báo (warn) và trả về fallback null thay vì crash.
 */
export class LocalStorageAdapter implements IStoragePort {
  /**
   * Đọc dữ liệu từ LocalStorage theo khóa.
   * @param key - Khóa định danh dữ liệu cần lấy (ví dụ: 'token')
   * @returns Chuỗi dữ liệu nếu tìm thấy, hoặc null nếu không có hoặc có lỗi truy cập
   */
  public get(key: string): string | null {
    try {
      return window.localStorage.getItem(key);
    } catch (e) {
      console.warn("localStorage.getItem is not available:", e);
      return null;
    }
  }

  /**
   * Lưu dữ liệu vào LocalStorage.
   * @param key - Khóa định danh
   * @param value - Giá trị dạng chuỗi cần lưu
   */
  public set(key: string, value: string): void {
    try {
      window.localStorage.setItem(key, value);
    } catch (e) {
      console.warn("localStorage.setItem is not available:", e);
    }
  }

  /**
   * Xóa một mục dữ liệu khỏi LocalStorage theo khóa định danh.
   * @param key - Khóa của mục cần xóa (thường gọi khi người dùng thực hiện đăng xuất)
   */
  public remove(key: string): void {
    try {
      window.localStorage.removeItem(key);
    } catch (e) {
      console.warn("localStorage.removeItem is not available:", e);
    }
  }
}
