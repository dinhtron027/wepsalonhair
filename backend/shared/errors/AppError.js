class AppError extends Error {
  constructor(message, statusCode, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    Error.captureStackTrace(this, this.constructor);
  }
}

class ValidationError extends AppError {
  constructor(message = 'Dữ liệu đầu vào không hợp lệ') {
    super(message, 400);
  }
}

class BookingConflictError extends AppError {
  constructor(message = 'Khung giờ này đã có người đặt, vui lòng chọn giờ khác') {
    super(message, 409);
  }
}

class AuthError extends AppError {
  constructor(message = 'Lỗi xác thực người dùng') {
    super(message, 401);
  }
}

class NotFoundError extends AppError {
  constructor(message = 'Không tìm thấy tài nguyên') {
    super(message, 404);
  }
}

module.exports = {
  AppError,
  ValidationError,
  BookingConflictError,
  AuthError,
  NotFoundError
};
