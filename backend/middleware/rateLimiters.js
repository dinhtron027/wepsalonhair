const rateLimit = require('express-rate-limit');
const env = require('../config/env');

const rateLimitResponse = (message) => ({
  success: false,
  message
});

const apiRateLimiter = rateLimit({
  windowMs: Number(env.RATE_LIMIT_WINDOW_MS),
  max: Number(env.RATE_LIMIT_MAX),
  standardHeaders: true,
  legacyHeaders: false,
  message: rateLimitResponse('Qua nhieu yeu cau, vui long thu lai sau')
});

const authRateLimiter = rateLimit({
  windowMs: Number(env.RATE_LIMIT_WINDOW_MS),
  max: Number(env.AUTH_RATE_LIMIT_MAX),
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  message: rateLimitResponse('Qua nhieu lan dang nhap, vui long thu lai sau')
});

module.exports = {
  apiRateLimiter,
  authRateLimiter
};
