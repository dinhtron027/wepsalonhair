const bookingService = require('../services/bookingService');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/response');

const createBooking = asyncHandler(async (req, res) => {
  const payload = req.user
    ? {
        ...req.body,
        userId: req.user._id,
        email: req.body.email || req.user.email
      }
    : req.body;

  const booking = await bookingService.createBooking(payload);

  return sendSuccess(res, {
    statusCode: 201,
    message: 'Dat lich thanh cong',
    data: booking
  });
});

const getBookings = asyncHandler(async (req, res) => {
  const bookings = await bookingService.listBookings(req.query);

  return sendSuccess(res, {
    message: 'Lay danh sach lich hen thanh cong',
    data: bookings
  });
});

const getBookedSlots = asyncHandler(async (req, res) => {
  const slots = await bookingService.getBookedSlotsByDate(req.query.date);

  return sendSuccess(res, {
    message: 'Lay danh sach khung gio da dat thanh cong',
    data: slots
  });
});

const updateBookingStatus = asyncHandler(async (req, res) => {
  const booking = await bookingService.updateBookingStatus(req.params.id, req.body);

  return sendSuccess(res, {
    message: 'Cap nhat lich hen thanh cong',
    data: booking
  });
});

const cancelBooking = asyncHandler(async (req, res) => {
  const booking = await bookingService.cancelBooking(req.params.id, req.user);

  return sendSuccess(res, {
    message: 'Huy lich hen thanh cong',
    data: booking
  });
});

module.exports = {
  createBooking,
  getBookedSlots,
  getBookings,
  updateBookingStatus,
  cancelBooking
};
