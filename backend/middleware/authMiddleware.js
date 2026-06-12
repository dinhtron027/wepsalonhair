const jwt = require('jsonwebtoken');
const env = require('../config/env');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');

const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new ApiError(401, 'Ban chua dang nhap'));
  }

  try {
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, env.JWT_SECRET);
    const user = await User.findById(decoded.sub);

    if (!user) {
      return next(new ApiError(401, 'Tai khoan khong ton tai hoac da bi xoa'));
    }

    req.user = user;
    return next();
  } catch (error) {
    return next(new ApiError(401, 'Token khong hop le hoac da het han'));
  }
};

module.exports = authMiddleware;
