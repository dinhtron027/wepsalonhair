/**
 * bookingService.js: Tầng nghiệp vụ (Service Layer) xử lý đặt lịch làm tóc.
 * Chịu trách nhiệm:
 * - Kiểm tra trùng lặp lịch hẹn của thợ/khung giờ.
 * - Áp dụng quy tắc giảm giá Giờ Vàng (Happy Hour) theo ngày và giờ.
 * - Liên kết/tự động tạo hồ sơ khách hàng trong hệ thống CRM.
 * - Phát sự kiện thời gian thực (Socket.IO) thông báo cho Admin Dashboard.
 */
const Booking = require('../models/Booking');
const Customer = require('../models/Customer');
const Service = require('../models/Service');
const ApiError = require('../utils/ApiError');
const { normalizeDateOnly } = require('../utils/date');
const {
  broadcastSystemNotification,
  emitRealtimeEvent
} = require('../socket/io');
const notificationService = require('./notificationService');
const customerService = require('./customerService');

// Các trạng thái được tính là đang chiếm dụng khung giờ (không cho phép đặt đè)
const ACTIVE_BOOKING_STATUSES = ['pending', 'confirmed', 'in_service'];

const mapSelectedAddOns = (service, addOnIds = []) => {
  if (!addOnIds.length) {
    return [];
  }

  const normalizedIds = addOnIds.map((id) => id.toString());
  const matchedAddOns = service.addons.filter((addon) =>
    normalizedIds.includes(addon._id.toString())
  );

  if (matchedAddOns.length !== normalizedIds.length) {
    throw new ApiError(400, 'Add-on khong hop le cho dich vu da chon');
  }

  return matchedAddOns.map((addon) => ({
    addonId: addon._id,
    name: addon.name,
    price: addon.price
  }));
};

const calculateBookingTotal = (service, selectedAddOns, options = {}) => {
  const normalizedDate = options.date instanceof Date ? options.date : new Date();
  const normalizedTime = typeof options.time === 'string' ? options.time : '00:00';
  const snapshot = calculatePricingSnapshot(service, selectedAddOns, {
    date: normalizedDate,
    time: normalizedTime
  });

  return snapshot.totalPrice;
};

const isTimeWithinRange = (time, startTime, endTime) => {
  if (startTime === endTime) {
    return true;
  }

  if (startTime < endTime) {
    return time >= startTime && time < endTime;
  }

  return time >= startTime || time < endTime;
};

/**
 * Tính toán mức chiết khấu dịch vụ:
 * Kiểm tra xem ngày đặt (thứ trong tuần) và giờ đặt có rơi vào khung giờ vàng (Happy Hour) hay không.
 */
const resolveServiceDiscount = (service, date, time) => {
  const baseDiscount = Number(service.discount || 0);
  const rules = Array.isArray(service.pricingRules) ? service.pricingRules : [];
  const dayOfWeek = date.getUTCDay();

  let matchedRule = null;
  let matchedRuleDiscount = 0;

  rules.forEach((rule) => {
    if (!rule?.isActive) {
      return;
    }

    const hasDayFilter =
      Array.isArray(rule.daysOfWeek) && rule.daysOfWeek.length > 0
        ? rule.daysOfWeek.includes(dayOfWeek)
        : true;

    if (!hasDayFilter) {
      return;
    }

    if (!isTimeWithinRange(time, rule.startTime, rule.endTime)) {
      return;
    }

    if (rule.discountPercent > matchedRuleDiscount) {
      matchedRuleDiscount = rule.discountPercent;
      matchedRule = rule;
    }
  });

  const discountPercent = Math.max(baseDiscount, matchedRuleDiscount);

  return {
    discountPercent,
    pricingRuleLabel: matchedRule?.label || ''
  };
};

/**
 * Tạo bản chụp giá trị thanh toán (Pricing Snapshot):
 * Đảm bảo giá tiền được chốt tại thời điểm đặt lịch, không bị thay đổi nếu sau này salon cập nhật bảng giá.
 */
const calculatePricingSnapshot = (service, selectedAddOns, { date, time }) => {
  const { discountPercent, pricingRuleLabel } = resolveServiceDiscount(service, date, time);
  const baseServicePrice = Number(service.price || 0);
  const discountedServicePrice = Math.round(
    (baseServicePrice * (100 - discountPercent)) / 100
  );
  const addOnTotal = selectedAddOns.reduce((sum, addon) => sum + addon.price, 0);

  return {
    baseServicePrice,
    serviceDiscountPercent: discountPercent,
    pricingRuleLabel,
    totalPrice: discountedServicePrice + addOnTotal
  };
};

/**
 * Thuật toán kiểm tra xung đột khung giờ (Collision Detection):
 * Truy vấn MongoDB tìm xem đã có lịch hẹn nào ở ngày và giờ này có trạng thái hoạt động hay chưa.
 * Nếu đã có bản ghi tồn tại -> ném lỗi HTTP 409 Conflict.
 */
const ensureBookingSlotAvailable = async ({ date, time, excludedBookingId = null }) => {
  const query = {
    date,
    time,
    status: {
      $in: ACTIVE_BOOKING_STATUSES
    }
  };

  if (excludedBookingId) {
    query._id = { $ne: excludedBookingId };
  }

  const conflictingBooking = await Booking.findOne(query);

  if (conflictingBooking) {
    throw new ApiError(
      409,
      'Khung gio nay da co khach dat, vui long chon gio khac'
    );
  }
};

/**
 * Quy trình khởi tạo lịch hẹn (createBooking):
 * 1. Kiểm tra sự tồn tại của dịch vụ.
 * 2. Xác thực khung giờ còn trống (ensureBookingSlotAvailable).
 * 3. Tính toán giá tiền và khuyến mãi.
 * 4. Tự động đồng bộ hồ sơ khách hàng CRM (Customer Profile).
 * 5. Lưu bản ghi Booking vào MongoDB.
 * 6. Phát sự kiện Socket.IO thời gian thực đến phòng Admin.
 */
const createBooking = async (payload) => {
  const service = await Service.findById(payload.serviceId);

  if (!service) {
    throw new ApiError(404, 'Khong tim thay dich vu');
  }

  const normalizedDate = normalizeDateOnly(payload.date);
  await ensureBookingSlotAvailable({
    date: normalizedDate,
    time: payload.time
  });

  const selectedAddOns = mapSelectedAddOns(service, payload.addOnIds);
  const pricingSnapshot = calculatePricingSnapshot(service, selectedAddOns, {
    date: normalizedDate,
    time: payload.time
  });
  let customer = null;

  if (payload.customerId) {
    customer = await Customer.findById(payload.customerId);

    if (!customer) {
      throw new ApiError(404, 'Khong tim thay khach hang');
    }
  } else {
    // Tự động tạo hoặc cập nhật hồ sơ khách hàng trong CRM nếu chưa có
    customer = await customerService.ensureCustomerProfile({
      userId: payload.userId || null,
      fullName: payload.customerName || payload.name,
      phone: payload.phone,
      email: payload.email || ''
    });
  }

  const booking = await Booking.create({
    userId: payload.userId || customer.userId || null,
    customerId: customer._id,
    customerName: payload.customerName || payload.name || customer.fullName,
    phone: payload.phone || customer.phone,
    email: payload.email || customer.email || '',
    serviceId: service._id,
    serviceName: service.name,
    stylist: payload.stylist || '',
    date: normalizedDate,
    time: payload.time,
    addOns: selectedAddOns,
    totalPrice: pricingSnapshot.totalPrice,
    baseServicePrice: pricingSnapshot.baseServicePrice,
    serviceDiscountPercent: pricingSnapshot.serviceDiscountPercent,
    pricingRuleLabel: pricingSnapshot.pricingRuleLabel,
    note: payload.note || ''
  });

  // Cập nhật thống kê chi tiêu khách hàng, gửi email và phát sự kiện Realtime Socket.IO
  await customerService.refreshCustomerStats(customer._id);
  await notificationService.notifyBookingCreated(booking);
  emitRealtimeEvent('booking_created', booking.toObject(), { room: 'admins' });
  broadcastSystemNotification('Lich vua duoc dat', 'booking');

  return booking;
};

/**
 * Lấy danh sách lịch hẹn với bộ lọc tùy chọn.
 * Dùng cho Admin Dashboard hoặc Staff để xem tổng quan lịch hẹn.
 *
 * @param {Object} query - Tham số lọc từ query string của HTTP request.
 *   @param {string} [query.status]  - Lọc theo trạng thái (vd: 'pending', 'confirmed').
 *   @param {string} [query.date]    - Lọc theo ngày (chuỗi hoặc Date object).
 *   @param {number} [query.limit]   - Giới hạn số bản ghi trả về, mặc định 50.
 * @returns {Promise<Booking[]>} Mảng lịch hẹn được sắp xếp theo ngày và giờ tăng dần.
 *
 * `.populate('serviceId', 'name category price')`:
 *   Thay thế trường serviceId (ObjectId) bằng document thực của Service,
 *   chỉ lấy 3 trường: name, category, price (tránh lấy dữ liệu thừa).
 */
const listBookings = async (query = {}) => {
  const filters = {};

  // Thêm điều kiện lọc theo trạng thái nếu được cung cấp
  if (query.status) {
    filters.status = query.status;
  }

  // Chuẩn hóa ngày về 00:00:00 UTC để khớp với cách lưu trong MongoDB
  if (query.date) {
    filters.date = normalizeDateOnly(query.date);
  }

  return Booking.find(filters)
    // Nối dữ liệu Service vào kết quả (JOIN dữ liệu giữa hai collection)
    .populate('serviceId', 'name category price')
    // Sắp xếp theo ngày tăng dần, cùng ngày thì theo giờ tăng dần
    .sort({ date: 1, time: 1 })
    // Giới hạn số bản ghi, mặc định 50 để tránh tải quá nhiều dữ liệu
    .limit(query.limit || 50);
};

/**
 * Lấy danh sách các khung giờ đã được đặt trong một ngày cụ thể.
 * Dùng cho giao diện đặt lịch ở phía Frontend: hiển thị và vô hiệu hóa
 * các slot giờ đã có người đặt để tránh xung đột lịch hẹn.
 *
 * @param {string|Date} dateInput - Ngày cần kiểm tra (chuỗi "YYYY-MM-DD" hoặc Date object).
 * @returns {Promise<string[]>} Mảng chuỗi giờ đã bị chiếm dụng (vd: ["09:00", "10:30", "14:00"]).
 *
 * Chỉ đếm các lịch hẹn có trạng thái thuộc ACTIVE_BOOKING_STATUSES
 * (pending, confirmed, in_service) — lịch đã hủy hoặc hoàn thành
 * không được tính vào danh sách slot bận.
 *
 * `.select('time')`: chỉ lấy trường `time` từ DB, bỏ qua các trường khác
 * để giảm băng thông và tăng hiệu suất truy vấn.
 */
const getBookedSlotsByDate = async (dateInput) => {
  // Chuẩn hóa ngày về 00:00:00 UTC để truy vấn chính xác trong MongoDB
  const date = normalizeDateOnly(dateInput);

  // Truy vấn các lịch hẹn còn hoạt động trong ngày đó
  const rows = await Booking.find({
    date,
    status: {
      // `$in`: MongoDB operator — tương đương WHERE status IN ('pending', 'confirmed', 'in_service')
      $in: ACTIVE_BOOKING_STATUSES
    }
  })
    .select('time')    // Chỉ lấy trường giờ, không lấy toàn bộ document
    .sort({ time: 1 }); // Sắp xếp theo thứ tự thời gian tăng dần

  // Chuyển mảng document MongoDB thành mảng chuỗi giờ đơn giản
  // Ví dụ: [{ time: "09:00" }, { time: "14:00" }] → ["09:00", "14:00"]
  return rows.map((row) => row.time);
};

/**
 * Lấy chi tiết một lịch hẹn theo ID.
 * Dùng khi cần xem đầy đủ thông tin lịch hẹn (trang chi tiết, xác nhận thanh toán...).
 *
 * @param {string} bookingId - ObjectId của lịch hẹn trong MongoDB.
 * @returns {Promise<Booking>} Document lịch hẹn kèm thông tin dịch vụ liên kết.
 * @throws {ApiError(404)} Nếu không tìm thấy lịch hẹn với ID đã cho.
 *
 * `.populate('serviceId', 'name category price')`:
 *   Nối dữ liệu từ collection Service để lấy tên, danh mục và giá dịch vụ,
 *   giúp hiển thị đầy đủ thông tin mà không cần gọi thêm API riêng.
 */
const getBookingById = async (bookingId) => {
  const booking = await Booking.findById(bookingId).populate(
    'serviceId',
    'name category price'
  );

  // Nếu không tìm thấy lịch hẹn, ném lỗi 404 để Controller trả về cho Client
  if (!booking) {
    throw new ApiError(404, 'Khong tim thay lich hen');
  }

  return booking;
};

/**
 * Cập nhật trạng thái và thông tin của một lịch hẹn (dành cho Admin/Staff).
 * Cho phép thay đổi: trạng thái xử lý, thợ phụ trách, màu tóc đã dùng, ghi chú.
 *
 * @param {string} bookingId - ObjectId của lịch hẹn cần cập nhật.
 * @param {Object} payload - Dữ liệu cập nhật từ request body.
 *   @param {string} payload.status       - Trạng thái mới (vd: 'confirmed', 'in_service', 'completed').
 *   @param {string} [payload.stylist]    - Tên hoặc ID thợ phụ trách (tùy chọn).
 *   @param {string} [payload.hairColorUsed] - Màu tóc đã sử dụng (ghi nhận sau khi làm).
 *   @param {string} [payload.note]       - Ghi chú bổ sung (tùy chọn).
 * @returns {Promise<Booking>} Document lịch hẹn sau khi đã cập nhật.
 * @throws {ApiError(404)} Nếu không tìm thấy lịch hẹn.
 *
 * Sau khi cập nhật:
 * 1. Đồng bộ lại thống kê chi tiêu của khách hàng (nếu trạng thái chuyển sang 'completed').
 * 2. Phát sự kiện 'booking_updated' qua Socket.IO để Admin Dashboard tự động cập nhật.
 * 3. Gửi thông báo toàn hệ thống qua broadcastSystemNotification.
 *
 * Toán tử `??` (Nullish Coalescing):
 *   `payload.stylist ?? booking.stylist` — nếu payload không gửi stylist (undefined/null),
 *   giữ nguyên giá trị cũ. Tránh ghi đè dữ liệu cũ bằng null khi chỉ muốn cập nhật một phần.
 */
const updateBookingStatus = async (bookingId, payload) => {
  const booking = await Booking.findById(bookingId);

  if (!booking) {
    throw new ApiError(404, 'Khong tim thay lich hen');
  }

  // Cập nhật các trường — dùng ?? để giữ nguyên giá trị cũ nếu payload không cung cấp
  booking.status = payload.status;
  booking.stylist = payload.stylist ?? booking.stylist;
  booking.hairColorUsed = payload.hairColorUsed ?? booking.hairColorUsed;
  booking.note = payload.note ?? booking.note;

  // Lưu thay đổi vào MongoDB và kích hoạt các validator của Mongoose Schema
  await booking.save();

  // Đồng bộ lại thống kê khách hàng (tổng chi tiêu, số lần đặt...) nếu có liên kết
  if (booking.customerId) {
    await customerService.refreshCustomerStats(booking.customerId);
  }

  // Phát sự kiện realtime đến tất cả client đang join room 'admins'
  emitRealtimeEvent('booking_updated', booking.toObject(), { room: 'admins' });
  broadcastSystemNotification('Co cap nhat lich hen moi', 'booking');

  return booking;
};

/**
 * Hủy một lịch hẹn — có thể được thực hiện bởi chủ lịch hẹn hoặc Admin/Staff.
 * Thực hiện kiểm tra quyền truy cập trước khi cho phép hủy.
 *
 * @param {string} bookingId - ObjectId của lịch hẹn cần hủy.
 * @param {Object} user - Object đại diện người dùng đang đăng nhập (từ req.user).
 *   @param {string} user._id  - ID của người dùng.
 *   @param {string} user.role - Vai trò: 'admin', 'staff', hoặc 'customer'.
 * @returns {Promise<Booking>} Document lịch hẹn sau khi đã đặt status = 'cancelled'.
 * @throws {ApiError(404)} Nếu không tìm thấy lịch hẹn.
 * @throws {ApiError(403)} Nếu người dùng không có quyền hủy (không phải chủ nhân hoặc admin/staff).
 *
 * Quy tắc phân quyền:
 * - Admin và Staff: có thể hủy bất kỳ lịch hẹn nào (isPrivilegedUser = true).
 * - Customer: chỉ có thể hủy lịch hẹn của chính mình (isOwner = true).
 * - Nếu không thuộc hai trường hợp trên → ném lỗi 403 Forbidden.
 *
 * `.toString()`: ObjectId trong MongoDB là object, cần chuyển sang chuỗi để so sánh bằng `===`.
 */
const cancelBooking = async (bookingId, user) => {
  const booking = await Booking.findById(bookingId);

  if (!booking) {
    throw new ApiError(404, 'Khong tim thay lich hen');
  }

  // Kiểm tra xem người dùng có phải Admin hoặc Staff không
  const isPrivilegedUser = ['admin', 'staff'].includes(user.role);

  // Kiểm tra xem người dùng có phải chủ nhân của lịch hẹn không
  // `booking.userId.toString()` chuyển ObjectId sang chuỗi để so sánh với `user._id`
  const isOwner = booking.userId && booking.userId.toString() === user._id.toString();

  // Nếu không có quyền hủy, trả về lỗi 403 Forbidden (đã xác thực nhưng không đủ quyền)
  if (!isPrivilegedUser && !isOwner) {
    throw new ApiError(403, 'Ban khong co quyen huy lich hen nay');
  }

  // Đặt trạng thái thành 'cancelled' và lưu vào DB
  booking.status = 'cancelled';
  await booking.save();

  // Đồng bộ lại thống kê khách hàng sau khi hủy (giảm số lần đặt, tổng chi tiêu...)
  if (booking.customerId) {
    await customerService.refreshCustomerStats(booking.customerId);
  }

  // Thông báo realtime cho Admin Dashboard biết có lịch hẹn bị hủy
  emitRealtimeEvent('booking_updated', booking.toObject(), { room: 'admins' });
  broadcastSystemNotification('Lich hen vua bi huy', 'booking');

  return booking;
};

module.exports = {
  ACTIVE_BOOKING_STATUSES,
  calculateBookingTotal,
  createBooking,
  getBookingById,
  getBookedSlotsByDate,
  listBookings,
  updateBookingStatus,
  cancelBooking
};
