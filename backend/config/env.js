const dotenv = require('dotenv');
const Joi = require('joi');

dotenv.config();

const validateOriginList = (value, helpers) => {
  const origins = String(value)
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  if (!origins.length) {
    return helpers.error('any.invalid');
  }

  for (const origin of origins) {
    try {
      const parsed = new URL(origin);
      if (!['http:', 'https:'].includes(parsed.protocol)) {
        return helpers.message(`FRONTEND_URL khong hop le: ${origin}`);
      }
    } catch {
      return helpers.message(`FRONTEND_URL khong hop le: ${origin}`);
    }
  }

  return origins.join(',');
};

const envSchema = Joi.object({
  NODE_ENV: Joi.string().valid('development', 'test', 'production').default('development'),
  PORT: Joi.alternatives().try(Joi.number(), Joi.string()).default(5000),
  MONGODB_URI: Joi.string().default('mongodb://127.0.0.1:27017/salon-duong-chi'),
  JWT_SECRET: Joi.string().min(16).default('salon-duong-chi-super-secret-key'),
  JWT_EXPIRES_IN: Joi.string().default('7d'),
  RATE_LIMIT_WINDOW_MS: Joi.number().integer().min(1000).default(15 * 60 * 1000),
  RATE_LIMIT_MAX: Joi.number().integer().min(1).default(300),
  AUTH_RATE_LIMIT_MAX: Joi.number().integer().min(1).default(20),
  FRONTEND_URL: Joi.string()
    .custom(validateOriginList, 'frontend origin list')
    .default('http://localhost:5173'),
  SMTP_HOST: Joi.string().allow('').optional(),
  SMTP_PORT: Joi.number().default(587),
  SMTP_USER: Joi.string().allow('').optional(),
  SMTP_PASS: Joi.string().allow('').optional(),
  EMAIL_FROM: Joi.string().allow('').default('Salon Duong Chi <no-reply@salon.local>'),
  ZALO_WEBHOOK_URL: Joi.string().uri().allow('').optional(),
  ZALO_ACCESS_TOKEN: Joi.string().allow('').optional(),
  PAYMENT_PROVIDER: Joi.string().valid('cash', 'momo', 'vnpay').default('cash'),
  PAYMENT_MOCK_ENABLED: Joi.boolean()
    .truthy('true')
    .truthy('1')
    .falsy('false')
    .falsy('0')
    .default(false),
  VNPAY_TMN_CODE: Joi.string().allow('').optional(),
  VNPAY_HASH_SECRET: Joi.string().allow('').optional(),
  MOMO_PARTNER_CODE: Joi.string().allow('').optional(),
  MOMO_ACCESS_KEY: Joi.string().allow('').optional(),
  MOMO_SECRET_KEY: Joi.string().allow('').optional(),
  DEFAULT_ADMIN_NAME: Joi.string().default('Salon Admin'),
  DEFAULT_ADMIN_EMAIL: Joi.string().email().default('admin@salonduongchi.vn'),
  DEFAULT_ADMIN_PHONE: Joi.string().default('0900000000'),
  DEFAULT_ADMIN_PASSWORD: Joi.string().min(6).default('Admin@123456'),
  DEFAULT_STAFF_EMAIL: Joi.string().email().default('staff@salonduongchi.vn'),
  DEFAULT_STAFF_PHONE: Joi.string().default('0900000001'),
  DEFAULT_STAFF_PASSWORD: Joi.string().min(6).default('Staff@123456'),
  DEFAULT_CUSTOMER_EMAIL: Joi.string().email().default('customer@salonduongchi.vn'),
  DEFAULT_CUSTOMER_PHONE: Joi.string().default('0900000002'),
  DEFAULT_CUSTOMER_PASSWORD: Joi.string().min(6).default('Customer@123456'),
  GOOGLE_CLIENT_ID: Joi.string().allow('').optional(),
  GOOGLE_CLIENT_SECRET: Joi.string().allow('').optional()
})
  .unknown()
  .prefs({ abortEarly: false });

const { error, value } = envSchema.validate(process.env);

if (error) {
  throw new Error(`Environment validation error: ${error.message}`);
}

if (value.NODE_ENV === 'production') {
  const defaultJwtSecret = 'salon-duong-chi-super-secret-key';

  if (value.JWT_SECRET === defaultJwtSecret || value.JWT_SECRET.length < 32) {
    throw new Error(
      'Environment validation error: JWT_SECRET must be changed and at least 32 characters in production'
    );
  }
}

// Startup config check — chỉ log trạng thái, không log secret
const googleConfigReady = !!(value.GOOGLE_CLIENT_ID && value.GOOGLE_CLIENT_SECRET);
if (!googleConfigReady) {
  console.warn(
    '[Auth] Google OAuth config: hasGoogleClientId=%s, hasGoogleClientSecret=%s. Dang nhap Google se bi vo hieu.',
    !!value.GOOGLE_CLIENT_ID,
    !!value.GOOGLE_CLIENT_SECRET
  );
}

module.exports = value;
