const cors = require('cors');
const compression = require('compression');
const express = require('express');
const helmet = require('helmet');
const env = require('./config/env');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');
const { apiRateLimiter, authRateLimiter } = require('./middleware/rateLimiters');
const requestLogger = require('./middleware/requestLogger');
const adminRoutes = require('./routes/adminRoutes');
const authRoutes = require('./routes/authRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const cartRoutes = require('./routes/cartRoutes');
const orderRoutes = require('./routes/orderRoutes');
const productRoutes = require('./routes/productRoutes');
const serviceRoutes = require('./routes/serviceRoutes');
const addressRoutes = require('./routes/addressRoutes');
const shippingRoutes = require('./routes/shippingRoutes');
const webhookRoutes = require('./routes/webhookRoutes');


const app = express();

/**
 * Cấu hình Trust Proxy:
 * Khi chạy trên Production phía sau Nginx Reverse Proxy, Express cần tin tưởng header
 * `X-Forwarded-For` từ proxy để lấy đúng địa chỉ IP thực của Client (phục vụ tính năng Rate Limiting).
 */
if (env.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
}

/**
 * Xử lý danh sách Domain được phép truy cập (CORS Whitelist):
 * Lấy danh sách URL từ biến môi trường FRONTEND_URL và chuẩn hóa bỏ dấu gạch chéo cuối.
 */
const normalizeOrigin = (origin) => origin.trim().replace(/\/$/, '');
const allowedOrigins = env.FRONTEND_URL.split(',')
  .map((origin) => normalizeOrigin(origin))
  .filter(Boolean);

// Cho phép các kết nối thử nghiệm nội bộ loopback (localhost, 127.0.0.1)
const isLoopbackOrigin = (origin) => {
  try {
    const parsed = new URL(origin);
    return ['localhost', '127.0.0.1', '::1', '[::1]'].includes(parsed.hostname);
  } catch {
    return false;
  }
};

/**
 * Middleware CORS (Cross-Origin Resource Sharing):
 * Chỉ cho phép các domain nằm trong danh sách trắng (Whitelist) hoặc localhost gửi request.
 * `credentials: true`: Cho phép gửi kèm cookie và header xác thực.
 */
app.use(
  cors({
    origin: (origin, callback) => {
      // Cho phép các công cụ không có origin header (như Postman, cURL hoặc server-to-server)
      if (!origin) {
        callback(null, true);
        return;
      }

      const normalizedOrigin = normalizeOrigin(origin);

      if (allowedOrigins.includes(normalizedOrigin) || isLoopbackOrigin(normalizedOrigin)) {
        callback(null, true);
        return;
      }

      callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true
  })
);

/**
 * Middleware Bảo Mật & Tối Ưu Hóa:
 * 1. helmet(): Thiết lập các HTTP Header bảo mật tiêu chuẩn (chống Clickjacking, MIME-sniffing, XSS).
 * 2. compression(): Nén dữ liệu trả về bằng thuật toán Gzip giúp website tải nhanh hơn.
 * 3. express.json({ limit: '1mb' }): Đọc dữ liệu JSON trong body request, giới hạn dung lượng tối đa 1MB
 *    để ngăn chặn tấn công tràn bộ nhớ (Denial of Service).
 * 4. express.urlencoded(): Đọc dữ liệu gửi từ các HTML Form truyền thống.
 * 5. requestLogger: Ghi log thời gian phản hồi và mã trạng thái của mỗi lượt truy cập.
 * 6. apiRateLimiter: Giới hạn tần suất gọi API thông thường (tối đa 300 requests/15 phút).
 */
app.use(
  helmet({
    crossOriginOpenerPolicy: { policy: 'same-origin-allow-popups' }
  })
);
app.use(compression());
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(requestLogger);
app.use('/api', apiRateLimiter);

/**
 * Endpoint Kiểm Tra Sức Khỏe Hệ Thống (Health Check):
 * Giúp các công cụ giám sát (hoặc Nginx) kiểm tra xem Backend có đang hoạt động tốt hay không.
 */
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Salon Duong Chi API is running'
  });
});

/**
 * Đăng ký các Tuyến đường API (Routes) cho từng module nghiệp vụ:
 */
app.use('/api/auth', authRateLimiter, authRoutes); // Xác thực tài khoản (áp dụng giới hạn chặt chẽ 20 req/15 phút)
app.use('/api/services', serviceRoutes);           // Danh mục và chi tiết dịch vụ làm tóc
app.use('/api/products', productRoutes);           // Sản phẩm chăm sóc tóc
app.use('/api/bookings', bookingRoutes);           // Đặt lịch hẹn và kiểm tra khung giờ trống
app.use('/api/cart', cartRoutes);                   // Giỏ hàng người dùng
app.use('/api/orders', orderRoutes);               // Đơn hàng và lịch sử mua sắm
app.use('/api/addresses', addressRoutes);         // Sổ địa chỉ nhận hàng
app.use('/api/shipping', shippingRoutes);           // Tính phí vận chuyển theo khu vực
app.use('/api/admin', adminRoutes);                 // Bảng điều khiển quản trị, CRM và báo cáo doanh thu
app.use('/api/webhooks', webhookRoutes);           // Nhận thông báo tự động từ ngân hàng/Zalo

/**
 * Xử lý lỗi tập trung:
 * - notFoundHandler: Bắt tất cả các URL không tồn tại và trả về mã lỗi 404 Not Found.
 * - errorHandler: Bắt các lỗi phát sinh trong mã nguồn (mã lỗi 500 hoặc ApiError tùy biến)
 *   và trả về phản hồi JSON có cấu trúc rõ ràng, không làm lộ stack trace trên môi trường production.
 */
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
