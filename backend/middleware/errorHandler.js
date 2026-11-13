const ApiError = require('../utils/ApiError');
const env = require('../config/env');

/**
 * notFoundHandler: Middleware xử lý route không tồn tại (404 Not Found).
 * Được đăng ký sau tất cả các route hợp lệ trong app.js.
 * Nếu request không khớp với bất kỳ route nào, Express sẽ gọi middleware này.
 *
 * @param {Request}  req - Object request chứa URL được truy cập.
 * @param {Response} res - Object response để gửi JSON lỗi 404.
 *
 * `req.originalUrl`: URL gốc người dùng đã gõ (vd: /api/nonexistent),
 * giúp thông báo lỗi rõ ràng hơn là chỉ trả về "Not Found".
 */
const notFoundHandler = (req, res) => {
  res.status(404).json({
    success: false,
    message: `Khong tim thay ${req.originalUrl}`
  });
};

/**
 * errorHandler: Global Error Middleware — xử lý tập trung mọi lỗi xảy ra trong ứng dụng.
 *
 * Express nhận biết đây là Error Middleware vì có đúng 4 tham số: (error, req, res, next).
 * Mọi lỗi được chuyển đến đây thông qua `next(error)` hoặc từ `asyncHandler`.
 *
 * Quy trình xử lý lỗi (5 bước):
 * 1. Kiểm tra nếu response đã được gửi một phần → chuyển lỗi cho Express mặc định xử lý.
 * 2. Phát hiện và chuẩn hóa lỗi đặc biệt từ MongoDB.
 * 3. Phát hiện và chuẩn hóa các lỗi không phải ApiError.
 * 4. Xây dựng JSON payload lỗi chuẩn hóa.
 * 5. Gửi HTTP Response lỗi về Client.
 *
 * @param {Error}    error - Object lỗi được ném từ bất kỳ middleware hoặc controller nào.
 * @param {Request}  req   - Object request gốc.
 * @param {Response} res   - Object response để gửi JSON lỗi.
 * @param {Function} next  - Hàm next để chuyển lỗi cho Express mặc định xử lý nếu cần.
 */
const errorHandler = (error, req, res, next) => {
  // BƯỚC 1: Nếu header đã được gửi (streaming response), không thể gửi thêm
  // → chuyển lỗi cho Express default error handler để tránh lỗi "Cannot set headers"
  if (res.headersSent) {
    return next(error);
  }

  let normalizedError = error;

  // BƯỚC 2: Chuẩn hóa lỗi đặc biệt từ MongoDB/Mongoose
  if (error?.code === 11000) {
    // Lỗi Duplicate Key (code 11000): xảy ra khi vi phạm ràng buộc unique của MongoDB
    // Ví dụ: email đã tồn tại, hoặc cùng lúc/ngày đã có người đặt lịch
    const duplicatedFields = Object.keys(error.keyPattern || error.keyValue || {});

    if (duplicatedFields.includes('date') && duplicatedFields.includes('time')) {
      // Trường hợp đặc biệt: trùng lịch hẹn (date + time unique index trong Booking schema)
      normalizedError = new ApiError(
        409, // 409 Conflict: tài nguyên đang xung đột với trạng thái hiện tại
        'Khung gio nay da co khach dat, vui long chon gio khac'
      );
    } else {
      // Trường hợp chung: trường nào đó vi phạm unique (vd: email đã tồn tại)
      const duplicatedField = duplicatedFields[0];
      normalizedError = new ApiError(
        409,
        `${duplicatedField || 'Du lieu'} da ton tai trong he thong`
      );
    }
  } else if (error?.name === 'CastError') {
    // Lỗi CastError: Mongoose không thể chuyển đổi giá trị sang kiểu dữ liệu mong đợi
    // Thường xảy ra khi truyền ID sai định dạng ObjectId (vd: "abc" thay vì "507f1f77...")
    normalizedError = new ApiError(400, 'ID khong hop le');
  } else if (!(error instanceof ApiError)) {
    // BƯỚC 3: Lỗi không phải ApiError → lỗi hệ thống bất ngờ (bug, kết nối DB đứt...)
    // Trong production: ẩn thông báo lỗi chi tiết để tránh lộ thông tin nhạy cảm
    // Trong development: hiển thị thông báo gốc để debug
    const isProduction = env.NODE_ENV === 'production';
    const message = isProduction ? 'Internal server error' : (error.message || 'Internal server error');
    normalizedError = new ApiError(500, message);
  }

  // BƯỚC 4: Xây dựng JSON payload lỗi chuẩn hóa
  const statusCode = normalizedError.statusCode || 500;
  const payload = {
    success: false,
    message: normalizedError.message || 'Internal server error',
    meta: {
      // requestId giúp tra cứu log cụ thể khi cần debug vấn đề từ phía Server
      requestId: res.locals?.requestId || req.id || null
    }
  };

  // Chỉ trả về `details` trong môi trường development (tránh lộ thông tin trong production)
  if (normalizedError.details && process.env.NODE_ENV !== 'production') {
    payload.details = normalizedError.details;
  }

  // BƯỚC 5: Gửi HTTP Response lỗi về Client
  res.status(statusCode).json(payload);
};

module.exports = {
  errorHandler,
  notFoundHandler
};
