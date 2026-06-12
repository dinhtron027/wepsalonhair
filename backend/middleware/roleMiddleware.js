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
