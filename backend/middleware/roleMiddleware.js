/**
 * roleMiddleware: Hàm trung gian phân quyền truy cập (Authorization).
 * 
 * Áp dụng mô hình Higher-Order Function (Hàm bậc cao):
 * Nhận danh sách các vai trò được phép (...allowedRoles, ví dụ: 'admin', 'staff'),
 * và trả về một hàm middleware Express chuẩn: (req, res, next).
 * 
 * - Yêu cầu authMiddleware phải chạy trước để gán req.user.
 * - Nếu người dùng chưa đăng nhập -> trả về mã 401 Unauthorized.
 * - Nếu vai trò của người dùng không nằm trong danh sách được phép -> trả về mã 403 Forbidden.
 * - Nếu thỏa mãn -> gọi next() để tiếp tục chuyển đến Controller xử lý.
 */
const ApiError = require('../utils/ApiError');

const roleMiddleware = (...allowedRoles) => (req, res, next) => {
  if (!req.user) {
    return next(new ApiError(401, 'Ban chua dang nhap'));
  }

  if (!allowedRoles.includes(req.user.role)) {
    return next(new ApiError(403, 'Ban khong co quyen truy cap tai nguyen nay'));
  }

  return next();
};

module.exports = roleMiddleware;
