/**
 * authMiddleware: Hàm trung gian (Middleware) xác thực người dùng thông qua mã JWT (JSON Web Token).
 * 
 * Luồng hoạt động:
 * 1. Đọc trường `Authorization` trong Header của HTTP Request.
 * 2. Kiểm tra tiền tố định dạng `Bearer <token>`.
 * 3. Dùng thư viện jsonwebtoken để giải mã và xác thực chữ ký số bằng khóa bí mật JWT_SECRET (thuật toán HS256).
 * 4. Truy vấn vào Database MongoDB để lấy bản ghi User tương ứng với ID lưu trong trường `sub` (Subject).
 * 5. Gắn thông tin người dùng vào đối tượng `req.user` để các hàm Controller tiếp theo sử dụng.
 */
const jwt = require('jsonwebtoken');
const env = require('../config/env');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');

const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  // Bước 1: Kiểm tra sự tồn tại của header Authorization và tiền tố Bearer
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new ApiError(401, 'Ban chua dang nhap'));
  }

  try {
    // Bước 2: Tách lấy chuỗi mã token phía sau từ khóa "Bearer "
    const token = authHeader.split(' ')[1];

    // Bước 3: Xác thực tính toàn vẹn và hạn sử dụng của token
    const decoded = jwt.verify(token, env.JWT_SECRET, {
      algorithms: ['HS256']
    });

    // Bước 4: Kiểm tra tài khoản người dùng có thực sự còn tồn tại trong cơ sở dữ liệu hay không
    const user = await User.findById(decoded.sub);

    if (!user) {
      return next(new ApiError(401, 'Tai khoan khong ton tai hoac da bi xoa'));
    }

    // Bước 5: Gắn thông tin user hợp lệ vào request context
    req.user = user;
    return next();
  } catch (error) {
    // Bắt các ngoại lệ như TokenExpiredError hoặc JsonWebTokenError
    return next(new ApiError(401, 'Token khong hop le hoac da het han'));
  }
};

module.exports = authMiddleware;
