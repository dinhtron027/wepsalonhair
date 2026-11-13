/**
 * response.js: Tiện ích chuẩn hóa cấu trúc HTTP Response thành công trong toàn bộ API.
 *
 * Mục tiêu: Đảm bảo mọi response thành công từ API đều có cùng định dạng JSON,
 * giúp Frontend dễ dàng xử lý và hiển thị dữ liệu một cách nhất quán.
 *
 * Cấu trúc JSON trả về:
 * {
 *   "success": true,
 *   "message": "Thông báo thành công",
 *   "data": { ... },     // Dữ liệu chính (nếu có)
 *   "meta": {            // Thông tin bổ sung (nếu có)
 *     "requestId": "...", // ID request để tra cứu log
 *     "total": 100,       // Ví dụ: tổng số bản ghi khi phân trang
 *     ...
 *   }
 * }
 */

/**
 * Gửi HTTP Response thành công với cấu trúc chuẩn hóa.
 *
 * @param {Response} res - Object Express Response để gửi phản hồi về Client.
 * @param {Object} options - Tùy chọn cấu hình response.
 *   @param {number}  [options.statusCode=200] - HTTP status code (mặc định 200 OK).
 *                                               Dùng 201 khi tạo mới tài nguyên thành công.
 *   @param {string}  [options.message='Success'] - Thông báo mô tả kết quả xử lý.
 *   @param {*}       [options.data]              - Dữ liệu trả về (object, array, null...).
 *                                                  Nếu không truyền, trường `data` sẽ bị bỏ qua.
 *   @param {Object}  [options.meta]              - Thông tin metadata bổ sung (phân trang, thống kê...).
 * @returns {Response} Express Response object đã được gửi (kết thúc vòng đời request).
 *
 * Cơ chế requestId:
 *   `res.locals.requestId` được gắn tự động bởi middleware `requestLogger` ở app.js.
 *   ID này xuất hiện trong cả response và file log, giúp tra cứu request cụ thể khi debug.
 */
const sendSuccess = (res, { statusCode = 200, message = 'Success', data, meta } = {}) => {
  // Khởi tạo payload cơ bản với success:true và message
  const payload = {
    success: true,
    message
  };

  // Chỉ thêm trường `data` nếu được cung cấp (tránh trả về `data: undefined`)
  if (data !== undefined) {
    payload.data = data;
  }

  // Lấy requestId từ res.locals (được gắn bởi middleware requestLogger)
  const requestId = res.locals?.requestId;

  // Hợp nhất meta tùy chỉnh với requestId
  const responseMeta = {
    ...(meta || {}),
    ...(requestId ? { requestId } : {})
  };

  // Chỉ thêm trường `meta` nếu có ít nhất một key (tránh trả về `meta: {}`)
  if (Object.keys(responseMeta).length) {
    payload.meta = responseMeta;
  }

  // Đặt HTTP status code và gửi JSON response về Client
  return res.status(statusCode).json(payload);
};

module.exports = { sendSuccess };
