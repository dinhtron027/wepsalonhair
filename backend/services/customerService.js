const mongoose = require('mongoose');
const Booking = require('../models/Booking');
const Customer = require('../models/Customer');
const CustomerNote = require('../models/CustomerNote');
const HairFormula = require('../models/HairFormula');
const Order = require('../models/Order');
const Service = require('../models/Service');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');

const VIP_SPEND_THRESHOLD = 3000000;
const HIGH_VALUE_SPEND_THRESHOLD = 1500000;
const INACTIVE_DAYS = 90;
const COLOR_CATEGORY_SLUGS = ['color'];
const CHEMICAL_CATEGORY_SLUGS = ['color', 'perm', 'straightening'];
const DAMAGE_KEYWORDS = [
  'hu ton',
  'hư tổn',
  'kho xo',
  'khô xơ',
  'gay rung',
  'gãy rụng',
  'chay toc',
  'cháy tóc',
  'yeu',
  'yếu'
];

const normalizeIdentity = (value = '') => String(value).trim();
const normalizeEmail = (value = '') => normalizeIdentity(value).toLowerCase();
const normalizeSearchText = (value = '') =>
  String(value)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd');

const toVisitDate = (date, time = '00:00') => {
  const datePart = new Date(date).toISOString().slice(0, 10);
  return new Date(`${datePart}T${time}:00.000Z`);
};

const daysSince = (date, now = new Date()) => {
  if (!date) return null;
  return Math.floor((now.getTime() - new Date(date).getTime()) / (24 * 60 * 60 * 1000));
};

const getServiceCategory = (booking) => {
  const service = booking.serviceId;
  if (service && typeof service === 'object') {
    return service.categorySlug || service.category || '';
  }
  return '';
};

const getMostFrequent = (values) => {
  const counts = new Map();
  values.filter(Boolean).forEach((value) => {
    const key = value.toString();
    counts.set(key, (counts.get(key) || 0) + 1);
  });

  return Array.from(counts.entries()).sort((a, b) => b[1] - a[1])[0]?.[0] || '';
};

const classifyCustomer = ({
  totalAppointments,
  totalSpent,
  lastVisitAt,
  bookings = [],
  notes = [],
  formulas = [],
  now = new Date()
}) => {
  const segments = [];
  const inactiveForDays = daysSince(lastVisitAt, now);
  const colorServiceCount = bookings.filter((booking) =>
    COLOR_CATEGORY_SLUGS.includes(getServiceCategory(booking))
  ).length;
  const hasChemicalService = bookings.some((booking) =>
    CHEMICAL_CATEGORY_SLUGS.includes(getServiceCategory(booking))
  );
  const noteText = notes.map((note) => note.note || '').join(' ');
  const normalizedNoteText = normalizeSearchText(noteText);
  const hasDamageNote = DAMAGE_KEYWORDS.some((keyword) =>
    normalizedNoteText.includes(normalizeSearchText(keyword))
  );

  if (totalAppointments <= 1) segments.push('new');
  if (totalAppointments >= 2) segments.push('regular');
  if (totalSpent >= VIP_SPEND_THRESHOLD) segments.push('vip');
  if (totalSpent >= HIGH_VALUE_SPEND_THRESHOLD) segments.push('high_value');
  if (inactiveForDays !== null && inactiveForDays >= INACTIVE_DAYS) {
    segments.push('inactive');
  }
  if (colorServiceCount >= 2 || formulas.length >= 2) {
    segments.push('color_customer');
  }
  if (hasChemicalService || hasDamageNote) {
    segments.push('treatment_needed');
  }

  if (!segments.length) {
    segments.push('new');
  }

  const priority = [
    'vip',
    'inactive',
    'treatment_needed',
    'color_customer',
    'high_value',
    'regular',
    'new'
  ];

  return {
    customerSegment: priority.find((segment) => segments.includes(segment)) || 'new',
    segments,
    inactiveForDays
  };
};

const buildCareSuggestions = (snapshot) => {
  const suggestions = [];

  if (snapshot.segments.includes('inactive')) {
    suggestions.push('Liên hệ chăm sóc lại và tặng ưu đãi quay lại salon.');
  }
  if (snapshot.segments.includes('treatment_needed')) {
    suggestions.push('Tư vấn liệu trình phục hồi Keratin/Collagen trước lần làm hóa chất tiếp theo.');
  }
  if (snapshot.segments.includes('color_customer')) {
    suggestions.push('Nhắc lịch dặm chân tóc hoặc làm mới màu sau 6–8 tuần.');
  }
  if (snapshot.segments.includes('new')) {
    suggestions.push('Gọi hỏi thăm trải nghiệm sau lần đầu và giới thiệu lịch chăm sóc định kỳ.');
  }
  if (!suggestions.length) {
    suggestions.push('Duy trì lịch chăm sóc định kỳ theo dịch vụ khách thường sử dụng.');
  }

  return suggestions;
};

const ensureCustomerProfile = async ({
  userId = null,
  fullName = '',
  phone = '',
  email = ''
}) => {
  const normalizedPhone = normalizeIdentity(phone);
  const normalizedEmail = normalizeEmail(email);
  const queries = [];

  if (userId && mongoose.isValidObjectId(userId)) queries.push({ userId });
  if (normalizedPhone) queries.push({ phone: normalizedPhone });
  if (normalizedEmail) queries.push({ email: normalizedEmail });

  let customer = queries.length ? await Customer.findOne({ $or: queries }) : null;

  if (!customer) {
    customer = new Customer({
      userId: userId || null,
      fullName: fullName || 'Khách hàng',
      phone: normalizedPhone,
      email: normalizedEmail
    });
  } else {
    customer.userId = customer.userId || userId || null;
    customer.fullName = fullName || customer.fullName;
    customer.phone = normalizedPhone || customer.phone;
    customer.email = normalizedEmail || customer.email;
  }

  await customer.save();
  return customer;
};

const syncLegacyCustomerProfiles = async () => {
  const [users, unlinkedBookings] = await Promise.all([
    User.find({ role: 'customer' }).select('_id name phone email').lean(),
    Booking.find({ customerId: null })
      .select('_id userId customerName phone email')
      .sort({ createdAt: 1 })
      .lean()
  ]);

  for (const user of users) {
    await ensureCustomerProfile({
      userId: user._id,
      fullName: user.name,
      phone: user.phone,
      email: user.email
    });
  }

  for (const booking of unlinkedBookings) {
    const customer = await ensureCustomerProfile({
      userId: booking.userId,
      fullName: booking.customerName,
      phone: booking.phone,
      email: booking.email
    });

    await Booking.updateOne(
      { _id: booking._id, customerId: null },
      { $set: { customerId: customer._id } }
    );
  }
};

const createCustomerSnapshot = (customer, bookings, notes, formulas) => {
  const validBookings = bookings.filter((booking) => booking.status !== 'cancelled');
  const completedBookings = validBookings.filter((booking) => booking.status === 'completed');
  const totalAppointments = validBookings.length;
  const totalSpent = completedBookings.reduce(
    (sum, booking) => sum + Number(booking.totalPrice || 0),
    0
  );
  const lastVisitBooking = [...completedBookings].sort(
    (a, b) => toVisitDate(b.date, b.time) - toVisitDate(a.date, a.time)
  )[0];
  const lastVisitAt = lastVisitBooking
    ? toVisitDate(lastVisitBooking.date, lastVisitBooking.time)
    : null;
  const preferredStaff = getMostFrequent(
    completedBookings.map((booking) => booking.stylist)
  );
  const preferredServiceIds = [];
  const serviceFrequency = new Map();

  completedBookings.forEach((booking) => {
    const serviceId =
      typeof booking.serviceId === 'object'
        ? booking.serviceId?._id?.toString()
        : booking.serviceId?.toString();
    if (serviceId) {
      serviceFrequency.set(serviceId, (serviceFrequency.get(serviceId) || 0) + 1);
    }
  });

  Array.from(serviceFrequency.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .forEach(([serviceId]) => preferredServiceIds.push(serviceId));

  const hairColorHistory = Array.from(
    new Set([
      ...bookings.map((booking) => booking.hairColorUsed).filter(Boolean),
      ...formulas.map((formula) => formula.colorName).filter(Boolean)
    ])
  );
  const segmentation = classifyCustomer({
    totalAppointments,
    totalSpent,
    lastVisitAt,
    bookings: validBookings,
    notes,
    formulas
  });
  const latestNote = notes[0] || null;
  const latestFormula = formulas[0] || null;
  const latestBooking = [...validBookings].sort(
    (a, b) => toVisitDate(b.date, b.time) - toVisitDate(a.date, a.time)
  )[0];

  const snapshot = {
    id: customer._id.toString(),
    userId: customer.userId?.toString() || null,
    fullName: customer.fullName,
    phone: customer.phone || '',
    email: customer.email || '',
    totalAppointments,
    totalSpent,
    lastVisitAt: lastVisitAt?.toISOString() || null,
    customerSegment: segmentation.customerSegment,
    segments: segmentation.segments,
    inactiveForDays: segmentation.inactiveForDays,
    preferredStaff,
    preferredServices: preferredServiceIds,
    hairColorHistory,
    noteCount: notes.length,
    lastNote: latestNote?.note || '',
    latestNote,
    latestHairFormula: latestFormula,
    latestService: latestBooking
      ? {
          bookingId: latestBooking._id.toString(),
          serviceId:
            typeof latestBooking.serviceId === 'object'
              ? latestBooking.serviceId?._id?.toString() || null
              : latestBooking.serviceId?.toString() || null,
          serviceName: latestBooking.serviceName,
          serviceCategory: getServiceCategory(latestBooking),
          date: latestBooking.date,
          time: latestBooking.time,
          stylist: latestBooking.stylist || ''
        }
      : null,
    createdAt: customer.createdAt,
    updatedAt: customer.updatedAt
  };

  snapshot.careSuggestions = buildCareSuggestions(snapshot);
  return snapshot;
};

const persistSnapshot = async (snapshot) => {
  await Customer.updateOne(
    { _id: snapshot.id },
    {
      $set: {
        totalAppointments: snapshot.totalAppointments,
        totalSpent: snapshot.totalSpent,
        lastVisitAt: snapshot.lastVisitAt,
        customerSegment: snapshot.customerSegment,
        segments: snapshot.segments,
        preferredStaff: snapshot.preferredStaff,
        preferredServices: snapshot.preferredServices,
        hairColorHistory: snapshot.hairColorHistory,
        noteCount: snapshot.noteCount,
        lastNote: snapshot.lastNote
      }
    },
    {
      timestamps: false
    }
  );
};

const loadCustomerRelations = async (customerIds) => {
  const [bookings, notes, formulas] = await Promise.all([
    Booking.find({ customerId: { $in: customerIds } })
      .populate('serviceId', 'name category categorySlug price durationMinutes')
      .sort({ date: -1, time: -1, createdAt: -1 })
      .lean(),
    CustomerNote.find({ customerId: { $in: customerIds } })
      .populate('createdBy', 'name role')
      .sort({ createdAt: -1 })
      .lean(),
    HairFormula.find({ customerId: { $in: customerIds } })
      .populate('appointmentId', 'date time serviceName stylist status totalPrice')
      .populate('createdBy', 'name role')
      .sort({ createdAt: -1 })
      .lean()
  ]);

  const groupByCustomer = (rows) => {
    const grouped = new Map();
    rows.forEach((row) => {
      const key = row.customerId?.toString();
      if (!key) return;
      if (!grouped.has(key)) grouped.set(key, []);
      grouped.get(key).push(row);
    });
    return grouped;
  };

  return {
    bookingMap: groupByCustomer(bookings),
    noteMap: groupByCustomer(notes),
    formulaMap: groupByCustomer(formulas)
  };
};

const refreshCustomerStats = async (customerId) => {
  const customer = await Customer.findById(customerId).lean();
  if (!customer) {
    throw new ApiError(404, 'Không tìm thấy khách hàng');
  }

  const relations = await loadCustomerRelations([customer._id]);
  const id = customer._id.toString();
  const snapshot = createCustomerSnapshot(
    customer,
    relations.bookingMap.get(id) || [],
    relations.noteMap.get(id) || [],
    relations.formulaMap.get(id) || []
  );
  await persistSnapshot(snapshot);
  return snapshot;
};

const resolveStaffFilter = async (staffId) => {
  if (!staffId) return '';
  if (!mongoose.isValidObjectId(staffId)) return staffId;
  const staff = await User.findOne({ _id: staffId, role: 'staff' }).select('name').lean();
  return staff?.name || staffId;
};

const getCustomerFilterOptions = async () => {
  const [services, staffUsers, stylistNames] = await Promise.all([
    Service.find().select('_id name category categorySlug').sort({ category: 1, name: 1 }).lean(),
    User.find({ role: 'staff' }).select('_id name').sort({ name: 1 }).lean(),
    Booking.distinct('stylist', { stylist: { $ne: '' } })
  ]);

  const staff = [
    ...staffUsers.map((user) => ({
      id: user._id.toString(),
      name: user.name
    })),
    ...stylistNames
      .filter((name) => !staffUsers.some((user) => user.name === name))
      .map((name) => ({ id: name, name }))
  ];

  return {
    services,
    serviceCategories: Array.from(
      new Map(
        services.map((service) => [
          service.categorySlug || service.category,
          {
            value: service.categorySlug || service.category,
            label: service.category
          }
        ])
      ).values()
    ),
    staff
  };
};

const getAdminCustomers = async (query = {}) => {
  await syncLegacyCustomerProfiles();

  const customers = await Customer.find().sort({ createdAt: -1 }).lean();
  const customerIds = customers.map((customer) => customer._id);
  const relations = await loadCustomerRelations(customerIds);
  const staffFilter = await resolveStaffFilter(query.staffId);
  const dateFrom = query.dateFrom ? new Date(query.dateFrom) : null;
  const dateTo = query.dateTo ? new Date(query.dateTo) : null;
  if (dateFrom) dateFrom.setUTCHours(0, 0, 0, 0);
  if (dateTo) dateTo.setUTCHours(23, 59, 59, 999);

  const snapshots = customers.map((customer) => {
    const id = customer._id.toString();
    return createCustomerSnapshot(
      customer,
      relations.bookingMap.get(id) || [],
      relations.noteMap.get(id) || [],
      relations.formulaMap.get(id) || []
    );
  });

  await Promise.all(snapshots.map((snapshot) => persistSnapshot(snapshot)));

  const summary = {
    totalCustomers: snapshots.length,
    newCustomers: snapshots.filter((item) => item.segments.includes('new')).length,
    vipCustomers: snapshots.filter((item) => item.segments.includes('vip')).length,
    inactiveCustomers: snapshots.filter((item) => item.segments.includes('inactive')).length,
    totalRevenue: snapshots.reduce((sum, item) => sum + item.totalSpent, 0),
    followUpCustomers: snapshots.filter(
      (item) =>
        item.segments.includes('inactive') || item.segments.includes('treatment_needed')
    ).length
  };

  const filtered = snapshots.filter((snapshot) => {
    const bookings = relations.bookingMap.get(snapshot.id) || [];
    const searchText = normalizeSearchText(
      `${snapshot.fullName} ${snapshot.phone} ${snapshot.email}`
    );

    if (query.search && !searchText.includes(normalizeSearchText(query.search))) {
      return false;
    }
    if (query.segment && !snapshot.segments.includes(query.segment)) {
      return false;
    }
    if (
      query.serviceCategory &&
      !bookings.some((booking) => getServiceCategory(booking) === query.serviceCategory)
    ) {
      return false;
    }
    if (staffFilter && !bookings.some((booking) => booking.stylist === staffFilter)) {
      return false;
    }
    if (query.status && !bookings.some((booking) => booking.status === query.status)) {
      return false;
    }
    if (
      dateFrom &&
      !bookings.some((booking) => toVisitDate(booking.date, booking.time) >= dateFrom)
    ) {
      return false;
    }
    if (
      dateTo &&
      !bookings.some((booking) => toVisitDate(booking.date, booking.time) <= dateTo)
    ) {
      return false;
    }
    return true;
  });

  const sortBy = query.sortBy || 'lastVisitAt';
  const direction = query.sortOrder === 'asc' ? 1 : -1;
  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 'fullName') {
      return a.fullName.localeCompare(b.fullName, 'vi') * direction;
    }
    const left = sortBy === 'lastVisitAt' ? new Date(a.lastVisitAt || 0).getTime() : a[sortBy] || 0;
    const right = sortBy === 'lastVisitAt' ? new Date(b.lastVisitAt || 0).getTime() : b[sortBy] || 0;
    return (left - right) * direction;
  });

  const page = Math.max(Number(query.page || 1), 1);
  const limit = Math.min(Math.max(Number(query.limit || 10), 1), 100);
  const total = sorted.length;
  const totalPages = Math.max(Math.ceil(total / limit), 1);
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * limit;

  return {
    items: sorted.slice(start, start + limit),
    pagination: {
      page: safePage,
      limit,
      total,
      totalPages
    },
    summary,
    filterOptions: await getCustomerFilterOptions()
  };
};

const mapHistory = (bookings, formulas) => {
  const formulaMap = new Map();
  formulas.forEach((formula) => {
    const appointmentId = formula.appointmentId?._id?.toString() || formula.appointmentId?.toString();
    if (appointmentId && !formulaMap.has(appointmentId)) {
      formulaMap.set(appointmentId, formula);
    }
  });

  return bookings.map((booking) => {
    const formula = formulaMap.get(booking._id.toString()) || null;
    return {
      bookingId: booking._id.toString(),
      date: booking.date,
      time: booking.time,
      status: booking.status,
      serviceId:
        typeof booking.serviceId === 'object'
          ? booking.serviceId?._id?.toString() || null
          : booking.serviceId?.toString() || null,
      serviceName: booking.serviceName,
      serviceCategory: getServiceCategory(booking),
      stylist: booking.stylist || '',
      hairColorUsed: booking.hairColorUsed || formula?.colorName || '',
      formula: formula?.formula || '',
      oxidant: formula?.oxidant || '',
      hairBaseLevel: formula?.hairBaseLevel || '',
      hairConditionBefore: formula?.hairConditionBefore || '',
      hairConditionAfter: formula?.hairConditionAfter || '',
      aftercareAdvice: formula?.aftercareAdvice || '',
      totalPrice: booking.totalPrice,
      note: booking.note || ''
    };
  });
};

const getCustomerDetail = async (customerId) => {
  await syncLegacyCustomerProfiles();

  const customer = await Customer.findById(customerId).lean();
  if (!customer) {
    throw new ApiError(404, 'Không tìm thấy khách hàng');
  }

  const relations = await loadCustomerRelations([customer._id]);
  const id = customer._id.toString();
  const bookings = relations.bookingMap.get(id) || [];
  const notes = relations.noteMap.get(id) || [];
  const formulas = relations.formulaMap.get(id) || [];
  const snapshot = createCustomerSnapshot(customer, bookings, notes, formulas);
  await persistSnapshot(snapshot);

  const orders = customer.userId
    ? await Order.find({ userId: customer.userId })
        .select('products totalPrice status createdAt note payment')
        .sort({ createdAt: -1 })
        .lean()
    : [];

  const purchasedProducts = orders.flatMap((order) =>
    order.products.map((product) => ({
      orderId: order._id.toString(),
      productId: product.productId?.toString() || '',
      name: product.name,
      quantity: product.quantity,
      price: product.price,
      orderStatus: order.status,
      purchasedAt: order.createdAt
    }))
  );

  return {
    ...snapshot,
    history: mapHistory(bookings, formulas),
    notes,
    hairFormulas: formulas,
    orders,
    purchasedProducts,
    careSuggestions: snapshot.careSuggestions,
    filterOptions: await getCustomerFilterOptions()
  };
};

const addCustomerNote = async (customerId, payload, createdBy) => {
  const customer = await Customer.findById(customerId);
  if (!customer) {
    throw new ApiError(404, 'Không tìm thấy khách hàng');
  }

  const note = await CustomerNote.create({
    customerId,
    note: payload.note,
    type: payload.type,
    createdBy: createdBy?._id || null
  });

  await refreshCustomerStats(customerId);
  return CustomerNote.findById(note._id).populate('createdBy', 'name role').lean();
};

const addHairFormula = async (customerId, payload, createdBy) => {
  const customer = await Customer.findById(customerId);
  if (!customer) {
    throw new ApiError(404, 'Không tìm thấy khách hàng');
  }

  let appointment = null;
  if (payload.appointmentId) {
    appointment = await Booking.findOne({
      _id: payload.appointmentId,
      customerId
    });
    if (!appointment) {
      throw new ApiError(400, 'Lịch hẹn không thuộc khách hàng này');
    }
  }

  const formula = await HairFormula.create({
    customerId,
    appointmentId: appointment?._id || null,
    serviceName: payload.serviceName || appointment?.serviceName || 'Nhuộm tóc',
    colorName: payload.colorName,
    formula: payload.formula,
    oxidant: payload.oxidant || '',
    hairBaseLevel: payload.hairBaseLevel || '',
    hairConditionBefore: payload.hairConditionBefore || '',
    hairConditionAfter: payload.hairConditionAfter || '',
    aftercareAdvice: payload.aftercareAdvice || '',
    createdBy: createdBy?._id || null
  });

  if (appointment && !appointment.hairColorUsed) {
    appointment.hairColorUsed = payload.colorName;
    await appointment.save();
  }

  await refreshCustomerStats(customerId);
  return HairFormula.findById(formula._id)
    .populate('appointmentId', 'date time serviceName stylist status totalPrice')
    .populate('createdBy', 'name role')
    .lean();
};

module.exports = {
  HIGH_VALUE_SPEND_THRESHOLD,
  INACTIVE_DAYS,
  VIP_SPEND_THRESHOLD,
  addCustomerNote,
  addHairFormula,
  classifyCustomer,
  ensureCustomerProfile,
  getAdminCustomers,
  getCustomerDetail,
  refreshCustomerStats,
  syncLegacyCustomerProfiles
};
