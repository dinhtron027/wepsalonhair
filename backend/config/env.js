const dotenv = require('dotenv');
const Joi = require('joi');

/**
 * env.js: Xác thực và chuẩn hóa toàn bộ biến môi trường (Environment Variables) của ứng dụng.
 *
 * VẤN ĐỀ: Nếu ứng dụng đọc trực tiếp `process.env.PORT` hoặc `process.env.JWT_SECRET`
 * mà không kiểm tra, có thể xảy ra:
 * - Giá trị undefined (quên khai báo trong .env).
 * - Kiểu dữ liệu sai (PORT là chuỗi "5000" thay vì số 5000).
 * - Giá trị rỗng hoặc thiếu (JWT_SECRET quá ngắn → bảo mật yếu).
 *
 * GIẢI PHÁP: Dùng thư viện Joi để xác thực (validate) toàn bộ process.env ngay khi Server khởi động.
 * Nếu có biến môi trường nào không hợp lệ → ném lỗi ngay lập tức, không để ứng dụng chạy trong
 * trạng thái không an toàn.
 *
 * Thứ tự thực hiện:
 * 1. Đọc file .env bằng dotenv.config() → gán vào process.env.
 * 2. Joi xác thực và chuyển đổi kiểu dữ liệu cho process.env.
 * 3. Kiểm tra bảo mật bổ sung cho môi trường production.
 * 4. Export object `value` đã xác thực — dùng thay cho process.env trực tiếp.
 */

// BƯỚC 1: Đọc file .env và nạp các biến vào process.env
dotenv.config();

/**
 * Hàm validator tùy chỉnh cho FRONTEND_URL.
 * Cho phép cấu hình nhiều URL cách nhau bằng dấu phẩy:
 *   FRONTEND_URL=http://localhost:5173,https://salon.example.com
 *
 * @param {string}   value   - Giá trị chuỗi của biến môi trường FRONTEND_URL.
 * @param {Object}   helpers - Helpers của Joi để tạo thông báo lỗi tùy chỉnh.
 * @returns {string} Chuỗi các URL hợp lệ, loại bỏ khoảng trắng thừa và phần tử rỗng.
 */
const validateOriginList = (value, helpers) => {
  const origins = String(value)
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  if (!origins.length) {
    return helpers.error('any.invalid');
  }

  // Kiểm tra từng URL có hợp lệ không (phải là http:// hoặc https://)
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

  return origins.join(','); // Trả về chuỗi đã được chuẩn hóa
};

/**
 * Schema xác thực Joi cho toàn bộ biến môi trường.
 * Mỗi key tương ứng một biến trong file .env.
 * - `.default(value)`: Giá trị mặc định nếu biến không được khai báo.
 * - `.valid(...)`: Giới hạn các giá trị cho phép.
 * - `.min(n)`: Độ dài tối thiểu (dùng cho string và number).
 * - `.optional()`: Biến không bắt buộc phải có trong .env.
 */
const envSchema = Joi.object({
  NODE_ENV: Joi.string().valid('development', 'test', 'production').default('development'),
  PORT: Joi.alternatives().try(Joi.number(), Joi.string()).default(5000),
  MONGODB_URI: Joi.string().default('mongodb://127.0.0.1:27017/salon-duong-chi'),

  // JWT_SECRET phải ít nhất 16 ký tự — càng dài càng khó bị brute-force
  JWT_SECRET: Joi.string().min(16).default('salon-duong-chi-super-secret-key'),
  JWT_EXPIRES_IN: Joi.string().default('7d'), // Thời gian token hết hạn (vd: '7d', '24h')

  // Rate Limiting: giới hạn số lượng request để chống DDoS và brute-force
  RATE_LIMIT_WINDOW_MS: Joi.number().integer().min(1000).default(15 * 60 * 1000), // 15 phút (ms)
  RATE_LIMIT_MAX: Joi.number().integer().min(1).default(300),         // Tối đa 300 request/15 phút
  AUTH_RATE_LIMIT_MAX: Joi.number().integer().min(1).default(20),     // Tối đa 20 lần đăng nhập/15 phút

  // FRONTEND_URL: danh sách origin được phép CORS (nhiều URL cách nhau bằng dấu phẩy)
  FRONTEND_URL: Joi.string()
    .custom(validateOriginList, 'frontend origin list')
    .default('http://localhost:5173'),

  // Cấu hình SMTP để gửi email (xác nhận đặt lịch, thông báo...)
  SMTP_HOST: Joi.string().allow('').optional(),
  SMTP_PORT: Joi.number().default(587),
  SMTP_USER: Joi.string().allow('').optional(),
  SMTP_PASS: Joi.string().allow('').optional(),
  EMAIL_FROM: Joi.string().allow('').default('Salon Duong Chi <no-reply@salon.local>'),

  // Zalo: gửi thông báo qua Zalo OA (tùy chọn)
  ZALO_WEBHOOK_URL: Joi.string().uri().allow('').optional(),
  ZALO_ACCESS_TOKEN: Joi.string().allow('').optional(),

  // Cấu hình cổng thanh toán
  PAYMENT_PROVIDER: Joi.string().valid('cash', 'momo', 'vnpay').default('cash'),
  PAYMENT_MOCK_ENABLED: Joi.boolean()
    .truthy('true').truthy('1')
    .falsy('false').falsy('0')
    .default(false), // Bật chế độ giả lập thanh toán (không gọi API thật)
  VNPAY_TMN_CODE: Joi.string().allow('').optional(),
  VNPAY_HASH_SECRET: Joi.string().allow('').optional(),
  MOMO_PARTNER_CODE: Joi.string().allow('').optional(),
  MOMO_ACCESS_KEY: Joi.string().allow('').optional(),
  MOMO_SECRET_KEY: Joi.string().allow('').optional(),

  // Tài khoản mặc định được tạo khi chạy script seed dữ liệu
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

  // Google OAuth: đăng nhập qua Google (nếu không cấu hình, tính năng bị vô hiệu hóa)
  GOOGLE_CLIENT_ID: Joi.string().allow('').optional(),
  GOOGLE_CLIENT_SECRET: Joi.string().allow('').optional(),
  GOOGLE_CALLBACK_URL: Joi.string().allow('').optional(),

  // Cloudinary: lưu trữ ảnh upload (ảnh dịch vụ, gallery...)
  CLOUDINARY_CLOUD_NAME: Joi.string().allow('').optional(),
  CLOUDINARY_API_KEY: Joi.string().allow('').optional(),
  CLOUDINARY_API_SECRET: Joi.string().allow('').optional(),

  // Thông tin tài khoản ngân hàng để tạo QR thanh toán chuyển khoản
  BANK_CODE: Joi.string().default('sacombank'),
  BANK_ACCOUNT_NUMBER: Joi.string().default('0988046664'),
  BANK_ACCOUNT_NAME: Joi.string().default('NGUYEN LINH DUONG'),
  BANK_TRANSFER_PREFIX: Joi.string().default('SDC'), // Prefix nội dung chuyển khoản (vd: SDC-ORDER123)
  WEBHOOK_SECRET_TOKEN: Joi.string().default('salon-duong-chi-webhook-secret-token')
})
  .unknown()              // Cho phép các biến môi trường khác không được khai báo trong schema
  .prefs({ abortEarly: false }); // Hiển thị TẤT CẢ lỗi thay vì dừng ở lỗi đầu tiên

// BƯỚC 2: Xác thực process.env theo schema đã khai báo
const { error, value } = envSchema.validate(process.env);

// BƯỚC 3: Nếu có lỗi xác thực → ném lỗi ngay, không để Server khởi động
if (error) {
  throw new Error(`Environment validation error: ${error.message}`);
}

// BƯỚC 4: Kiểm tra bảo mật bổ sung cho môi trường production
if (value.NODE_ENV === 'production') {
  const defaultJwtSecret = 'salon-duong-chi-super-secret-key';

  // Bắt buộc đổi JWT_SECRET và phải ít nhất 32 ký tự trong production
  // để chống brute-force tấn công JWT
  if (value.JWT_SECRET === defaultJwtSecret || value.JWT_SECRET.length < 32) {
    throw new Error(
      'Environment validation error: JWT_SECRET must be changed and at least 32 characters in production'
    );
  }
}

// Log cảnh báo nếu Google OAuth chưa được cấu hình (không ném lỗi, chỉ cảnh báo)
// Startup config check — chỉ log trạng thái, không log secret
const googleConfigReady = !!(value.GOOGLE_CLIENT_ID && value.GOOGLE_CLIENT_SECRET);
if (!googleConfigReady) {
  console.warn(
    '[Auth] Google OAuth config: hasGoogleClientId=%s, hasGoogleClientSecret=%s. Dang nhap Google se bi vo hieu.',
    !!value.GOOGLE_CLIENT_ID,
    !!value.GOOGLE_CLIENT_SECRET
  );
}

// Export object `value` đã xác thực và chuẩn hóa kiểu dữ liệu.
// Các module khác import file này thay vì đọc process.env trực tiếp để:
// - Luôn có kiểu dữ liệu đúng (PORT là number, không phải string).
// - Có giá trị mặc định nếu biến không được khai báo trong .env.
module.exports = value;
