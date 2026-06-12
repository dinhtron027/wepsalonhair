const Booking = require('../models/Booking');
const InventoryTransaction = require('../models/InventoryTransaction');
const Order = require('../models/Order');
const Product = require('../models/Product');
const Service = require('../models/Service');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');

const getAdminBookings = async () =>
  Booking.find()
    .populate('serviceId', 'name category price durationMinutes')
    .populate('userId', 'name phone email role')
    .sort({ date: 1, time: 1, createdAt: -1 });

const getAdminServices = async () => Service.find().sort({ createdAt: -1 });

const getAdminProducts = async () => Product.find().sort({ createdAt: -1 });

const getAdminOrders = async () =>
  Order.find()
    .populate('userId', 'name email phone role')
    .sort({ createdAt: -1 });

const toVisitTimestamp = (date, time = '00:00') => {
  const datePart = new Date(date).toISOString().slice(0, 10);
  return new Date(`${datePart}T${time}:00.000Z`).toISOString();
};

const mapCustomerHistory = (booking) => ({
  bookingId: booking._id.toString(),
  date: booking.date,
  time: booking.time,
  status: booking.status,
  serviceName: booking.serviceName,
  stylist: booking.stylist || '',
  hairColorUsed: booking.hairColorUsed || '',
  totalPrice: booking.totalPrice,
  note: booking.note || ''
});

const getAdminCustomers = async () => {
  const [customers, bookings] = await Promise.all([
    User.find({ role: 'customer' }).select('_id name phone email createdAt').lean(),
    Booking.find()
      .select(
        '_id userId customerName phone email date time status serviceName stylist hairColorUsed totalPrice note'
      )
      .sort({ date: -1, time: -1, createdAt: -1 })
      .lean()
  ]);

  const customerMap = new Map();

  customers.forEach((customer) => {
    customerMap.set(customer._id.toString(), {
      id: customer._id.toString(),
      name: customer.name,
      phone: customer.phone,
      email: customer.email,
      totalBookings: 0,
      totalSpent: 0,
      lastVisit: null,
      stylists: [],
      hairColors: [],
      history: []
    });
  });

  bookings.forEach((booking) => {
    const userId = booking.userId?.toString();
    const fallbackKey = booking.phone || booking.email || booking._id.toString();
    const customerKey = userId || fallbackKey;
    const previous = customerMap.get(customerKey) || {
      id: customerKey,
      name: booking.customerName || 'Khach le',
      phone: booking.phone || '',
      email: booking.email || '',
      totalBookings: 0,
      totalSpent: 0,
      lastVisit: null,
      stylists: [],
      hairColors: [],
      history: []
    };

    const historyItem = mapCustomerHistory(booking);
    const visitTimestamp = toVisitTimestamp(booking.date, booking.time);

    if (historyItem.stylist && !previous.stylists.includes(historyItem.stylist)) {
      previous.stylists.push(historyItem.stylist);
    }

    if (
      historyItem.hairColorUsed &&
      !previous.hairColors.includes(historyItem.hairColorUsed)
    ) {
      previous.hairColors.push(historyItem.hairColorUsed);
    }

    previous.totalBookings += 1;
    previous.totalSpent += historyItem.totalPrice || 0;
    previous.history.push(historyItem);

    if (!previous.lastVisit || visitTimestamp > previous.lastVisit) {
      previous.lastVisit = visitTimestamp;
    }

    customerMap.set(customerKey, previous);
  });

  return Array.from(customerMap.values()).sort((a, b) => {
    if (!a.lastVisit && !b.lastVisit) {
      return 0;
    }
    if (!a.lastVisit) {
      return 1;
    }
    if (!b.lastVisit) {
      return -1;
    }
    return b.lastVisit.localeCompare(a.lastVisit);
  });
};

const getInventoryOverview = async () => {
  const [products, transactions] = await Promise.all([
    Product.find().sort({ stock: 1, name: 1 }).lean(),
    InventoryTransaction.find()
      .populate('productId', 'name category')
      .populate('createdBy', 'name role')
      .sort({ createdAt: -1 })
      .limit(100)
      .lean()
  ]);

  const lowStockProducts = products.filter(
    (product) => product.stock <= (product.lowStockThreshold || 0)
  );

  return {
    products,
    lowStockProducts,
    transactions,
    lowStockCount: lowStockProducts.length
  };
};

const adjustInventory = async (payload, performedBy) => {
  const product = await Product.findById(payload.productId);

  if (!product) {
    throw new ApiError(404, 'Khong tim thay san pham');
  }

  const quantity = Number(payload.quantity || 0);
  if (quantity <= 0) {
    throw new ApiError(400, 'So luong phai lon hon 0');
  }

  const previousStock = product.stock;
  const delta = payload.type === 'import' ? quantity : -quantity;
  const newStock = previousStock + delta;

  if (newStock < 0) {
    throw new ApiError(400, 'Khong du ton kho de xuat');
  }

  product.stock = newStock;
  await product.save();

  const transaction = await InventoryTransaction.create({
    productId: product._id,
    type: payload.type,
    quantity,
    previousStock,
    newStock,
    note: payload.note || '',
    createdBy: performedBy?._id || null
  });

  return {
    product,
    transaction,
    lowStock: product.stock <= (product.lowStockThreshold || 0)
  };
};

const getRevenueStatistics = async ({ from, to } = {}) => {
  const orderMatch = {
    status: {
      $in: ['paid', 'completed']
    }
  };

  if (from || to) {
    orderMatch.createdAt = {};
  }

  if (from) {
    orderMatch.createdAt.$gte = new Date(from);
  }

  if (to) {
    orderMatch.createdAt.$lte = new Date(to);
  }

  const [summaryRows, monthlyRevenue = [], bookingStatusSummary = [], counts = []] =
    await Promise.all([
      Order.aggregate([
        { $match: orderMatch },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: '$totalPrice' },
            totalOrders: { $sum: 1 },
            averageOrderValue: { $avg: '$totalPrice' }
          }
        }
      ]),
      Order.aggregate([
        { $match: orderMatch },
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' }
            },
            revenue: { $sum: '$totalPrice' },
            orders: { $sum: 1 }
          }
        },
        {
          $project: {
            _id: 0,
            year: '$_id.year',
            month: '$_id.month',
            revenue: 1,
            orders: 1
          }
        },
        { $sort: { year: 1, month: 1 } }
      ]),
      Booking.aggregate([
        {
          $group: {
            _id: '$status',
            total: { $sum: 1 }
          }
        },
        {
          $project: {
            _id: 0,
            status: '$_id',
            total: 1
          }
        }
      ]),
      Promise.all([
        Booking.countDocuments(),
        Service.countDocuments(),
        Product.countDocuments(),
        Order.countDocuments()
      ])
    ]);

  const summary = summaryRows[0] || {};

  const [totalBookings, totalServices, totalProducts, totalOrdersInSystem] = counts;

  return {
    totalRevenue: summary.totalRevenue || 0,
    totalOrders: summary.totalOrders || 0,
    averageOrderValue: summary.averageOrderValue || 0,
    totalBookings,
    totalServices,
    totalProducts,
    totalOrdersInSystem,
    monthlyRevenue,
    bookingStatusSummary
  };
};

module.exports = {
  getAdminBookings,
  getAdminOrders,
  getAdminCustomers,
  getAdminProducts,
  getAdminServices,
  getInventoryOverview,
  adjustInventory,
  getRevenueStatistics
};
