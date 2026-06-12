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
  DEFAULT_CUSTOMER_PASSWORD: Joi.string().min(6).default('Customer@123456')
})
  .unknown()
  .prefs({ abortEarly: false });

const { error, value } = envSchema.validate(process.env);

if (error) {
  throw new Error(`Environment validation error: ${error.message}`);
}

module.exports = value;
