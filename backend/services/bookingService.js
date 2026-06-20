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

  await customerService.refreshCustomerStats(customer._id);
  await notificationService.notifyBookingCreated(booking);
  emitRealtimeEvent('booking_created', booking.toObject(), { room: 'admins' });
  broadcastSystemNotification('Lich vua duoc dat', 'booking');

  return booking;
};

const listBookings = async (query = {}) => {
  const filters = {};

  if (query.status) {
    filters.status = query.status;
  }

  if (query.date) {
    filters.date = normalizeDateOnly(query.date);
  }

  return Booking.find(filters)
    .populate('serviceId', 'name category price')
    .sort({ date: 1, time: 1 })
    .limit(query.limit || 50);
};

const getBookedSlotsByDate = async (dateInput) => {
  const date = normalizeDateOnly(dateInput);
  const rows = await Booking.find({
    date,
    status: {
      $in: ACTIVE_BOOKING_STATUSES
    }
  })
    .select('time')
    .sort({ time: 1 });

  return rows.map((row) => row.time);
};

const getBookingById = async (bookingId) => {
  const booking = await Booking.findById(bookingId).populate(
    'serviceId',
    'name category price'
  );

  if (!booking) {
    throw new ApiError(404, 'Khong tim thay lich hen');
  }

  return booking;
};

const updateBookingStatus = async (bookingId, payload) => {
  const booking = await Booking.findById(bookingId);

  if (!booking) {
    throw new ApiError(404, 'Khong tim thay lich hen');
  }

  booking.status = payload.status;
  booking.stylist = payload.stylist ?? booking.stylist;
  booking.hairColorUsed = payload.hairColorUsed ?? booking.hairColorUsed;
  booking.note = payload.note ?? booking.note;

  await booking.save();
  if (booking.customerId) {
    await customerService.refreshCustomerStats(booking.customerId);
  }
  emitRealtimeEvent('booking_updated', booking.toObject(), { room: 'admins' });
  broadcastSystemNotification('Co cap nhat lich hen moi', 'booking');

  return booking;
};

const cancelBooking = async (bookingId, user) => {
  const booking = await Booking.findById(bookingId);

  if (!booking) {
    throw new ApiError(404, 'Khong tim thay lich hen');
  }

  const isPrivilegedUser = ['admin', 'staff'].includes(user.role);
  const isOwner = booking.userId && booking.userId.toString() === user._id.toString();

  if (!isPrivilegedUser && !isOwner) {
    throw new ApiError(403, 'Ban khong co quyen huy lich hen nay');
  }

  booking.status = 'cancelled';
  await booking.save();
  if (booking.customerId) {
    await customerService.refreshCustomerStats(booking.customerId);
  }
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
