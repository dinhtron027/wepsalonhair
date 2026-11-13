const mongoose = require('mongoose');
const env = require('./env');

/**
 * Hàm kết nối ứng dụng với MongoDB qua Mongoose.
 * Được gọi một lần duy nhất khi Server khởi động (trong server.js).
 * Nếu kết nối thất bại, hàm ném lỗi → server.js bắt lỗi và dừng process.
 *
 * @returns {Promise<void>} Promise hoàn thành khi kết nối thành công.
 * @throws {Error} Nếu không thể kết nối đến MongoDB (sai URI, MongoDB chưa chạy...).
 */
const connectDB = async () => {
  /**
   * strictQuery: Khi là true, Mongoose sẽ bỏ qua các trường không được khai báo
   * trong Schema khi thực hiện query (find, findOne...).
   * Giúp tránh lỗi logic do vô tình query với trường sai tên.
   * Đây là hành vi mặc định trong Mongoose 7+, nhưng cần khai báo rõ để
   * tránh cảnh báo DeprecationWarning trong các phiên bản cũ hơn.
   */
  mongoose.set('strictQuery', true);

  /**
   * mongoose.connect(): Tạo kết nối đến MongoDB.
   * env.MONGODB_URI được đọc từ file .env (vd: "mongodb://127.0.0.1:27017/salon-duong-chi").
   * Từ Mongoose 6+, không cần truyền các option như useNewUrlParser hay useUnifiedTopology
   * vì chúng đã được bật mặc định.
   */
  await mongoose.connect(env.MONGODB_URI);

  // Log tên database đã kết nối để xác nhận kết nối đúng môi trường
  console.log(`MongoDB connected: ${mongoose.connection.name}`);
};

module.exports = { connectDB };
