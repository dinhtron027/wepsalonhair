/**
 * ApiError.js: Custom Error Class cho các lỗi có thể dự đoán trước trong hệ thống API.
 *
 * JavaScript có lớp `Error` gốc, nhưng Error gốc không có trường `statusCode`.
 * ApiError mở rộng (extends) Error để thêm:
 * - `statusCode`: HTTP status code tương ứng để gửi về Client (400, 401, 403, 404, 409, 500...).
 * - `details`: Thông tin chi tiết lỗi (vd: danh sách trường bị lỗi validation).
 * - `isOperational`: Phân biệt lỗi nghiệp vụ (operational) với lỗi hệ thống (programmer error).
 *
 * Ý nghĩa của `isOperational = true`:
 * - Lỗi nghiệp vụ (operational): Dự kiến trước, an toàn — vd: "Không tìm thấy lịch hẹn" (404).
 *   Hệ thống xử lý bình thường, trả về HTTP error response cho Client.
 * - Lỗi hệ thống (non-operational): Không dự kiến — vd: kết nối DB đứt, lỗi logic code.
 *   Hệ thống cần log cẩn thận và có thể cần restart process.
 * errorHandler.js kiểm tra `isOperational` để quyết định cách xử lý.
 *
 * Ví dụ sử dụng:
 *   throw new ApiError(404, 'Khong tim thay lich hen');
 *   throw new ApiError(400, 'Du lieu khong hop le', { field: 'email', message: 'Sai dinh dang' });
 *   throw new ApiError(409, 'Email da ton tai trong he thong');
 */
class ApiError extends Error {
  /**
   * @param {number} statusCode - HTTP status code (vd: 400, 401, 403, 404, 409, 500).
   * @param {string} message    - Thông báo lỗi ngắn gọn (sẽ được trả về cho Client).
   * @param {*}      [details]  - Thông tin lỗi chi tiết tùy chọn (mảng lỗi validation, debug info...).
   *                              Chỉ được gửi về Client trong môi trường development.
   */
  constructor(statusCode, message, details = null) {
    // Gọi constructor của lớp cha (Error) để gán `this.message` và tạo stack trace
    super(message);

    this.name = 'ApiError';          // Đặt tên lớp để phân biệt trong log và debug
    this.statusCode = statusCode;    // HTTP status code để errorHandler trả về
    this.details = details;          // Chi tiết lỗi (vd: danh sách field validation thất bại)
    this.isOperational = true;       // Đánh dấu đây là lỗi nghiệp vụ, không phải lỗi hệ thống
  }
}

module.exports = ApiError;
