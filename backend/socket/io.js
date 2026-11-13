const jwt = require('jsonwebtoken');
const { Server } = require('socket.io');
const env = require('../config/env');
const User = require('../models/User');

/**
 * io.js: Module quản lý kết nối Realtime qua Socket.IO.
 *
 * Socket.IO là thư viện cho phép giao tiếp hai chiều (bidirectional) theo thời gian thực
 * giữa Server và Client qua giao thức WebSocket (tự động fallback về HTTP Long-Polling
 * nếu trình duyệt không hỗ trợ WebSocket).
 *
 * Chức năng của module này:
 * 1. Khởi tạo Socket.IO Server gắn vào HTTP Server (initSocket).
 * 2. Xác thực JWT khi Client kết nối (socketAuthMiddleware).
 * 3. Phân loại Client vào các "Room" dựa trên vai trò (authenticated, admins, role:admin...).
 * 4. Phát sự kiện realtime đến Room hoặc tất cả Client (emitRealtimeEvent).
 * 5. Phát thông báo hệ thống toàn cục (broadcastSystemNotification).
 *
 * Mô hình Room trong dự án:
 * - 'public'          → Khách chưa đăng nhập (guest)
 * - 'authenticated'   → Mọi người dùng đã đăng nhập
 * - 'role:admin'      → Chỉ admin
 * - 'role:staff'      → Chỉ staff
 * - 'role:customer'   → Chỉ customer
 * - 'admins'          → Alias cho admin, dùng khi emit sự kiện booking lên Admin Dashboard
 */

// Biến toàn module lưu instance Socket.IO duy nhất (Singleton Pattern)
// Singleton đảm bảo chỉ có một Server Socket.IO dù initSocket() được gọi nhiều lần
let ioInstance = null;

/**
 * Xóa dấu `/` thừa ở cuối URL để so sánh CORS chính xác.
 * Ví dụ: "http://localhost:5173/" → "http://localhost:5173"
 */
const normalizeOrigin = (origin) => origin.trim().replace(/\/$/, '');

/**
 * Phân tích danh sách FRONTEND_URL từ biến môi trường (env).
 * Hỗ trợ nhiều URL cách nhau bằng dấu phẩy:
 *   FRONTEND_URL=http://localhost:5173,https://salon.example.com
 * @returns {string[]} Mảng URL đã chuẩn hóa, loại bỏ phần tử rỗng.
 */
const parseAllowedOrigins = () =>
  env.FRONTEND_URL.split(',')
    .map((origin) => normalizeOrigin(origin))
    .filter(Boolean);

/**
 * Kiểm tra xem origin có phải từ localhost hay không.
 * Dùng để cho phép mọi kết nối từ máy local trong quá trình phát triển (development).
 *
 * @param {string} origin - URL nguồn gốc của request (vd: "http://localhost:5173").
 * @returns {boolean} true nếu là localhost/127.0.0.1/::1.
 */
const isLoopbackOrigin = (origin) => {
  try {
    const parsed = new URL(origin);
    return ['localhost', '127.0.0.1', '::1', '[::1]'].includes(parsed.hostname);
  } catch {
    return false; // URL không hợp lệ → không phải loopback
  }
};

/**
 * Trích xuất JWT Token từ kết nối Socket.IO.
 * Socket.IO Client có thể gửi token theo 3 cách (ưu tiên theo thứ tự):
 * 1. `socket.handshake.auth.token` (cách khuyến nghị của Socket.IO).
 * 2. `Authorization` header (chuẩn HTTP Bearer token).
 * 3. `token` query parameter trong URL kết nối (ít bảo mật hơn).
 *
 * @param {Socket} socket - Object Socket.IO đại diện cho một kết nối Client.
 * @returns {string} JWT token đã loại bỏ tiền tố "Bearer ", hoặc chuỗi rỗng nếu không có.
 */
const extractToken = (socket) => {
  // Cách 1: Lấy từ socket.handshake.auth (cách Socket.IO Client gửi token chuẩn)
  const authToken = socket.handshake.auth?.token;
  if (typeof authToken === 'string' && authToken.trim()) {
    return authToken.replace(/^Bearer\s+/i, '').trim();
  }

  // Cách 2: Lấy từ Authorization header (tương tự HTTP REST API)
  const headerAuth = socket.handshake.headers?.authorization;
  if (typeof headerAuth === 'string' && /^Bearer\s+/i.test(headerAuth)) {
    return headerAuth.replace(/^Bearer\s+/i, '').trim();
  }

  // Cách 3: Lấy từ query string (kém bảo mật hơn, chỉ dùng như fallback)
  const queryToken = socket.handshake.query?.token;
  if (typeof queryToken === 'string' && queryToken.trim()) {
    return queryToken.replace(/^Bearer\s+/i, '').trim();
  }

  return ''; // Không có token → kết nối ẩn danh (guest)
};

/**
 * Middleware xác thực JWT cho Socket.IO.
 * Chạy mỗi khi có Client mới kết nối (trước sự kiện 'connection').
 * Tương tự authMiddleware.js nhưng dành cho WebSocket thay vì HTTP.
 *
 * Luồng xử lý:
 * - Nếu không có token → gán vai trò 'guest', join room 'public'.
 * - Nếu có token hợp lệ → xác minh JWT, tìm user trong DB,
 *   gán `socket.user` và join các Room tương ứng vai trò.
 * - Nếu token lỗi/hết hạn → gán vai trò 'guest' (kết nối vẫn được phép, không bị ngắt).
 *
 * @param {Socket}   socket - Socket Client đang kết nối.
 * @param {Function} next   - Hàm cho phép kết nối tiếp tục (gọi next() không có lỗi).
 */
const socketAuthMiddleware = async (socket, next) => {
  // Hàm gán danh tính khách (guest) khi không có hoặc token không hợp lệ
  const attachGuestIdentity = () => {
    socket.user = {
      id: null,
      name: 'Guest',
      role: 'guest'
    };
    socket.join('public'); // Khách chỉ nhận sự kiện public
  };

  try {
    const token = extractToken(socket);

    if (!token) {
      attachGuestIdentity();
      return next(); // Cho phép kết nối tiếp tục với vai trò guest
    }

    // Giải mã và xác minh chữ ký JWT với thuật toán HS256
    const decoded = jwt.verify(token, env.JWT_SECRET, {
      algorithms: ['HS256']
    });

    // Tìm user trong DB để đảm bảo tài khoản vẫn tồn tại và chưa bị xóa
    const user = await User.findById(decoded.sub).select('_id name role');

    if (!user) {
      attachGuestIdentity(); // User đã bị xóa khỏi DB
      return next();
    }

    // Gán thông tin user vào socket để các handler sau có thể truy cập
    socket.user = {
      id: user._id.toString(),
      name: user.name,
      role: user.role
    };

    // Join các Room theo vai trò để nhận sự kiện phù hợp
    socket.join('authenticated');       // Mọi user đã đăng nhập
    socket.join(`role:${user.role}`);   // Room theo vai trò cụ thể (vd: role:admin)

    if (user.role === 'admin') {
      socket.join('admins'); // Room đặc biệt: nhận thông báo booking, hệ thống
    }

    return next();
  } catch (error) {
    // Token lỗi (hết hạn, sai chữ ký...) → kết nối vẫn được phép với vai trò guest
    // Không gọi next(error) vì socket vẫn được kết nối, chỉ ở mức guest
    attachGuestIdentity();
    return next();
  }
};

/**
 * Khởi tạo Socket.IO Server và gắn vào HTTP Server.
 * Áp dụng Singleton Pattern: chỉ tạo một instance duy nhất, lần gọi sau trả về instance cũ.
 *
 * @param {http.Server} httpServer - HTTP Server từ Node.js (tạo bởi http.createServer(app)).
 *   Socket.IO cần gắn vào HTTP Server (không phải Express app) để chia sẻ cùng port.
 * @returns {Server} Instance Socket.IO đã khởi tạo.
 *
 * Cấu hình CORS Socket.IO:
 *   Socket.IO có hệ thống CORS riêng, không dùng CORS middleware của Express.
 *   - Cho phép các origin trong FRONTEND_URL.
 *   - Cho phép mọi kết nối từ localhost (môi trường development).
 *   - Chặn các origin không được phép (trả về lỗi CORS).
 */
const initSocket = (httpServer) => {
  // Singleton: trả về instance đã tạo nếu gọi lại
  if (ioInstance) {
    return ioInstance;
  }

  ioInstance = new Server(httpServer, {
    cors: {
      // Hàm kiểm tra CORS động — được gọi với mỗi origin kết nối mới
      origin: (origin, callback) => {
        const allowedOrigins = parseAllowedOrigins();

        if (!origin) {
          // Không có origin (kết nối từ server-side, curl, Postman) → cho phép
          callback(null, true);
          return;
        }

        const normalizedOrigin = normalizeOrigin(origin);
        if (allowedOrigins.includes(normalizedOrigin) || isLoopbackOrigin(normalizedOrigin)) {
          callback(null, true); // Origin được phép → cho phép kết nối
          return;
        }

        // Origin không được phép → từ chối kết nối với lỗi CORS
        callback(new Error(`Socket CORS blocked for origin: ${origin}`));
      },
      credentials: true // Cho phép gửi cookie và Authorization header qua WebSocket
    }
  });

  // Đăng ký middleware xác thực JWT cho mọi kết nối mới
  ioInstance.use(socketAuthMiddleware);

  // Xử lý sự kiện khi Client kết nối thành công
  ioInstance.on('connection', (socket) => {
    // Gửi xác nhận kết nối thành công về Client ngay lập tức
    socket.emit('socket_connected', {
      connected: true,
      role: socket.user?.role || 'customer',
      message: 'Ket noi realtime thanh cong'
    });

    /**
     * Sự kiện 'admin:broadcast': cho phép Admin phát sự kiện tùy chỉnh đến tất cả Client.
     * Yêu cầu: socket.user.role === 'admin'.
     * Giới hạn: chỉ được phát sự kiện có tên bắt đầu bằng 'admin_' (bảo mật).
     *
     * Payload: { event: 'admin_announcement', data: { message: '...' } }
     */
    socket.on('admin:broadcast', (payload = {}) => {
      // Kiểm tra quyền: chỉ admin mới được phép phát sự kiện toàn hệ thống
      if (socket.user?.role !== 'admin') {
        socket.emit('socket_error', {
          message: 'Ban khong co quyen phat su kien quan tri'
        });
        return;
      }

      const eventName = typeof payload.event === 'string' ? payload.event.trim() : '';

      // Giới hạn namespace sự kiện: chỉ cho phép tên bắt đầu bằng 'admin_'
      // Ngăn chặn admin phát các sự kiện có thể gây xung đột với sự kiện hệ thống
      if (!eventName.startsWith('admin_')) {
        socket.emit('socket_error', {
          message: 'Chi duoc phat su kien admin_*'
        });
        return;
      }

      // Phát sự kiện đến tất cả Client đang kết nối
      ioInstance.emit(eventName, payload.data ?? null);
    });
  });

  return ioInstance;
};

/**
 * Lấy instance Socket.IO đã khởi tạo.
 * Dùng trong các module khác cần phát sự kiện realtime (bookingService, etc.).
 *
 * @returns {Server} Instance Socket.IO.
 * @throws {Error} Nếu Socket.IO chưa được khởi tạo (initSocket chưa được gọi).
 */
const getIO = () => {
  if (!ioInstance) {
    throw new Error('Socket.io chua duoc khoi tao');
  }

  return ioInstance;
};

/**
 * Phát sự kiện realtime đến Client theo Room hoặc tất cả.
 * Hàm tiện ích được gọi từ bookingService và các service khác khi có dữ liệu thay đổi.
 *
 * @param {string} eventName - Tên sự kiện (vd: 'booking_created', 'booking_updated').
 * @param {*}      payload   - Dữ liệu gửi kèm (thường là document MongoDB đã được .toObject()).
 * @param {Object} [options]
 *   @param {string} [options.room] - Tên Room nhận sự kiện (vd: 'admins').
 *                                    Nếu không cung cấp → phát đến tất cả Client.
 *
 * Nếu ioInstance chưa có (Server chưa khởi tạo) → thoát im lặng, không ném lỗi.
 * (Tránh làm crash ứng dụng khi gọi trong unit test hoặc script standalone)
 */
const emitRealtimeEvent = (eventName, payload, options = {}) => {
  if (!ioInstance) {
    return; // Socket.IO chưa khởi tạo, bỏ qua việc emit
  }

  const io = getIO();

  if (options.room) {
    // Phát sự kiện đến một Room cụ thể (vd: chỉ admins nhận thông báo booking)
    io.to(options.room).emit(eventName, payload);
    return;
  }

  // Phát sự kiện đến tất cả Client đang kết nối
  io.emit(eventName, payload);
};

/**
 * Phát thông báo hệ thống (system_notification) đến Client.
 * Dùng để hiển thị toast/banner thông báo tự động trên giao diện Admin.
 *
 * @param {string} message - Nội dung thông báo (vd: "Có lịch hẹn mới được đặt").
 * @param {string} [type='info'] - Loại thông báo: 'info', 'booking', 'warning', 'error'...
 *   Frontend dùng `type` để hiển thị màu sắc icon tương ứng.
 * @param {Object} [options] - Tùy chọn truyền cho emitRealtimeEvent (vd: { room: 'admins' }).
 *
 * Payload chuẩn của sự kiện 'system_notification':
 * {
 *   id: "1700000000000-abc123",  // ID duy nhất để React list key, chống duplicate
 *   type: "booking",
 *   message: "Lich vua duoc dat",
 *   createdAt: "2024-01-15T09:00:00.000Z"
 * }
 */
const broadcastSystemNotification = (message, type = 'info', options = {}) => {
  if (!ioInstance) {
    return;
  }

  emitRealtimeEvent(
    'system_notification',
    {
      // Tạo ID duy nhất từ timestamp + chuỗi ngẫu nhiên để React dùng làm key
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      type,
      message,
      createdAt: new Date().toISOString()
    },
    options
  );
};

module.exports = {
  initSocket,
  getIO,
  emitRealtimeEvent,
  broadcastSystemNotification
};
