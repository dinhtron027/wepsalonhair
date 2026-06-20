const Booking = require('../models/Booking');
const InventoryTransaction = require('../models/InventoryTransaction');
const Order = require('../models/Order');
const Product = require('../models/Product');
const Service = require('../models/Service');
const User = require('../models/User');
const CustomerNote = require('../models/CustomerNote');
const HairFormula = require('../models/HairFormula');
const ApiError = require('../utils/ApiError');
const customerService = require('./customerService');

const getAdminBookings = async () =>
  Booking.find()
    .populate('serviceId', 'name category price durationMinutes')
    .populate('userId', 'name phone email role')
    .populate('customerId', 'fullName phone email customerSegment segments')
    .sort({ date: 1, time: 1, createdAt: -1 });

const getAdminServices = async () => Service.find().sort({ createdAt: -1 });

const getAdminProducts = async () => Product.find().sort({ createdAt: -1 });

const getAdminOrders = async () =>
  Order.find()
    .populate('userId', 'name email phone role')
    .sort({ createdAt: -1 });

const getAdminCustomers = async (query = {}) => customerService.getAdminCustomers(query);

const getAdminCustomerDetail = async (customerId) => {
  return customerService.getCustomerDetail(customerId);
};

const addAdminCustomerNote = async (customerId, payload, adminUser) => {
  return customerService.addCustomerNote(customerId, payload, adminUser);
};

const addAdminCustomerHairFormula = async (customerId, payload, adminUser) => {
  return customerService.addHairFormula(customerId, payload, adminUser);
};

const rebookAdminCustomer = async (customerId, payload) => {
  const Customer = require('../models/Customer');
  const customer = await Customer.findById(customerId);
  if (!customer) {
    throw new ApiError(404, 'Không tìm thấy khách hàng');
  }

  const bookingService = require('./bookingService');
  const booking = await bookingService.createBooking({
    userId: customer.userId || null,
    customerName: customer.fullName,
    phone: customer.phone,
    email: customer.email || '',
    serviceId: payload.serviceId,
    date: payload.date,
    time: payload.time,
    stylist: payload.stylist || '',
    note: payload.note || 'Đặt lại lịch nhanh từ CRM admin'
  });

  await customerService.refreshCustomerStats(customerId);
  return booking;
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
  const quantity = Number(payload.quantity || 0);
  if (quantity <= 0) {
    throw new ApiError(400, 'So luong phai lon hon 0');
  }

  const delta = payload.type === 'import' ? quantity : -quantity;
  const updateQuery = {
    _id: payload.productId
  };

  if (payload.type === 'export') {
    updateQuery.stock = {
      $gte: quantity
    };
  }

  const previousProduct = await Product.findOneAndUpdate(
    updateQuery,
    {
      $inc: {
        stock: delta
      }
    },
    {
      new: false,
      runValidators: true
    }
  );

  if (!previousProduct) {
    const productExists = await Product.exists({ _id: payload.productId });
    throw new ApiError(
      productExists ? 400 : 404,
      productExists ? 'Khong du ton kho de xuat' : 'Khong tim thay san pham'
    );
  }

  const previousStock = previousProduct.stock;
  const newStock = previousStock + delta;
  const product = await Product.findById(payload.productId);

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
  getAdminCustomerDetail,
  addAdminCustomerNote,
  addAdminCustomerHairFormula,
  rebookAdminCustomer,
  getAdminProducts,
  getAdminServices,
  getInventoryOverview,
  adjustInventory,
  getRevenueStatistics
};
