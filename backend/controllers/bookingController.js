/**
 * bookingController.js: Tầng Controller xử lý HTTP Request/Response cho module Lịch hẹn.
 *
 * Controller không chứa logic nghiệp vụ — chỉ có nhiệm vụ:
 * 1. Trích xuất dữ liệu từ request (req.body, req.params, req.query, req.user).
 * 2. Gọi hàm tương ứng trong bookingService để xử lý nghiệp vụ.
 * 3. Trả về HTTP Response chuẩn hóa qua hàm `sendSuccess`.
 *
 * Mỗi handler được bọc trong `asyncHandler` để:
 * - Tự động bắt lỗi từ async/await (không cần viết try/catch thủ công).
 * - Chuyển lỗi về Express error middleware qua `next(error)`.
 */

const bookingService = require('../services/bookingService');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/response');

/**
 * Tạo lịch hẹn mới.
 * Route: POST /api/bookings
 * Quyền truy cập: Public (có thể đặt lịch khi chưa đăng nhập).
 *
 * Nếu người dùng đã đăng nhập (req.user tồn tại):
 *   - Tự động điền userId và email từ token đã xác thực.
 *   - Email trong form (req.body.email) có thể ghi đè email từ token (ưu tiên input người dùng).
 * Nếu chưa đăng nhập (Guest):
 *   - Chỉ dùng dữ liệu từ req.body (tên, số điện thoại tự nhập).
 *
 * Trả về: 201 Created + thông tin lịch hẹn vừa tạo.
 */
const createBooking = asyncHandler(async (req, res) => {
  // Nếu đã đăng nhập: gắn thêm userId và email vào payload để liên kết với tài khoản
  const payload = req.user
    ? {
        ...req.body,
        userId: req.user._id,
        email: req.body.email || req.user.email // Ưu tiên email người dùng nhập, fallback về email token
      }
    : req.body; // Khách vãng lai: dùng toàn bộ dữ liệu từ body

  // Gọi Service để thực hiện logic nghiệp vụ (kiểm tra slot, tính giá, tạo bản ghi...)
  const booking = await bookingService.createBooking(payload);

  // Trả về response 201 Created với dữ liệu lịch hẹn vừa tạo
  return sendSuccess(res, {
    statusCode: 201,
    message: 'Dat lich thanh cong',
    data: booking
  });
});

/**
 * Lấy danh sách lịch hẹn (dành cho Admin/Staff).
 * Route: GET /api/bookings?status=pending&date=2024-01-15&limit=20
 * Quyền truy cập: Admin, Staff.
 *
 * Truyền toàn bộ query string (req.query) vào Service để lọc theo:
 * - status: trạng thái lịch hẹn
 * - date: ngày cụ thể
 * - limit: số bản ghi tối đa
 *
 * Trả về: 200 OK + mảng lịch hẹn kèm thông tin dịch vụ liên kết.
 */
const getBookings = asyncHandler(async (req, res) => {
  const bookings = await bookingService.listBookings(req.query);

  return sendSuccess(res, {
    message: 'Lay danh sach lich hen thanh cong',
    data: bookings
  });
});

/**
 * Lấy danh sách khung giờ đã được đặt trong một ngày.
 * Route: GET /api/bookings/slots?date=2024-01-15
 * Quyền truy cập: Public (Frontend cần biết giờ nào còn trống để hiển thị).
 *
 * `req.query.date`: ngày cần kiểm tra, truyền từ query string URL.
 *
 * Trả về: 200 OK + mảng chuỗi giờ đã bị đặt (vd: ["09:00", "10:30", "14:00"]).
 * Frontend dùng mảng này để vô hiệu hóa (disabled) các nút giờ tương ứng.
 */
const getBookedSlots = asyncHandler(async (req, res) => {
  const slots = await bookingService.getBookedSlotsByDate(req.query.date);

  return sendSuccess(res, {
    message: 'Lay danh sach khung gio da dat thanh cong',
    data: slots
  });
});

/**
 * Cập nhật trạng thái và thông tin lịch hẹn (dành cho Admin/Staff).
 * Route: PATCH /api/bookings/:id/status
 * Quyền truy cập: Admin, Staff.
 *
 * `req.params.id`: ObjectId của lịch hẹn được lấy từ URL path (vd: /api/bookings/abc123/status).
 * `req.body`: dữ liệu cập nhật (status, stylist, hairColorUsed, note).
 *
 * Trả về: 200 OK + document lịch hẹn sau khi cập nhật.
 */
const updateBookingStatus = asyncHandler(async (req, res) => {
  const booking = await bookingService.updateBookingStatus(req.params.id, req.body);

  return sendSuccess(res, {
    message: 'Cap nhat lich hen thanh cong',
    data: booking
  });
});

/**
 * Hủy một lịch hẹn.
 * Route: PATCH /api/bookings/:id/cancel
 * Quyền truy cập: Người dùng đã đăng nhập (Customer hủy lịch của mình, Admin/Staff hủy bất kỳ lịch nào).
 *
 * `req.params.id`: ObjectId của lịch hẹn từ URL.
 * `req.user`: Object người dùng đang đăng nhập (được gắn bởi authMiddleware).
 *   Service sẽ dùng req.user để kiểm tra quyền hủy (chủ nhân hoặc admin/staff).
 *
 * Trả về: 200 OK + document lịch hẹn với status = 'cancelled'.
 */
const cancelBooking = asyncHandler(async (req, res) => {
  const booking = await bookingService.cancelBooking(req.params.id, req.user);

  return sendSuccess(res, {
    message: 'Huy lich hen thanh cong',
    data: booking
  });
});

// Xuất tất cả controller functions để Router sử dụng
module.exports = {
  createBooking,
  getBookedSlots,
  getBookings,
  updateBookingStatus,
  cancelBooking
};
