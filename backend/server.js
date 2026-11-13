/**
 * Tệp server.js: Điểm khởi đầu (Entrypoint) của ứng dụng Backend Node.js.
 * Chịu trách nhiệm kết nối Cơ sở dữ liệu, khởi tạo máy chủ HTTP, thiết lập kết nối thời gian thực Socket.IO
 * và lắng nghe cổng mạng đã cấu hình.
 */
const mongoose = require('mongoose');
const http = require('http');
const env = require('./config/env');
const { connectDB } = require('./config/db');
const app = require('./app');
const { initSocket } = require('./socket/io');

/**
 * Hàm khởi động server chính (startServer):
 * Sử dụng async/await để đảm bảo kết nối cơ sở dữ liệu thành công trước khi mở cổng nhận request.
 */
const startServer = async () => {
  try {
    // 1. Kết nối cơ sở dữ liệu MongoDB thông qua Mongoose
    await connectDB();

    // 2. Tạo máy chủ HTTP thuần từ Node.js bọc lấy ứng dụng Express
    // Điều này là bắt buộc để Socket.IO và Express có thể chia sẻ chung một cổng mạng (Port)
    const httpServer = http.createServer(app);

    // 3. Khởi tạo dịch vụ Socket.IO thời gian thực gắn vào HTTP Server
    initSocket(httpServer);

    // 4. Bắt đầu lắng nghe các kết nối từ Client trên cổng PORT (mặc định: 5000)
    const server = httpServer.listen(env.PORT, () => {
      console.log(`Salon Duong Chi API listening on port ${env.PORT}`);
    });

    /**
     * Cơ chế Graceful Shutdown (Tắt ứng dụng an toàn):
     * Khi nhận tín hiệu dừng từ hệ điều hành (Ctrl+C hoặc Docker stop), server sẽ:
     * - Dừng tiếp nhận request mới.
     * - Chờ hoàn tất các request đang xử lý dở dang.
     * - Ngắt kết nối MongoDB sạch sẽ để tránh hỏng dữ liệu hoặc rò rỉ socket.
     */
    const gracefulShutdown = async (signal) => {
      console.log(`${signal} received. Shutting down gracefully...`);
      server.close(async () => {
        await mongoose.connection.close();
        process.exit(0);
      });
    };

    // Lắng nghe tín hiệu SIGINT (Ctrl + C trong terminal) và SIGTERM (lệnh kill từ Docker/OS)
    process.on('SIGINT', gracefulShutdown);
    process.on('SIGTERM', gracefulShutdown);
  } catch (error) {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }
};

// Thực thi khởi động server
startServer();
