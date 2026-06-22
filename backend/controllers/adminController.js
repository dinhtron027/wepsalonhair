const adminService = require('../services/adminService');
const bookingService = require('../services/bookingService');
const productService = require('../services/productService');
const serviceService = require('../services/serviceService');
const customerService = require('../services/customerService');
const Customer = require('../models/Customer');
const cloudinaryService = require('../services/cloudinaryService');
const {
  broadcastSystemNotification,
  emitRealtimeEvent
} = require('../socket/io');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const { sendSuccess } = require('../utils/response');

const getAdminBookings = asyncHandler(async (req, res) => {
  const bookings = await adminService.getAdminBookings();

  return sendSuccess(res, {
    message: 'Lay danh sach booking cho admin thanh cong',
    data: bookings
  });
});

const updateAdminBooking = asyncHandler(async (req, res) => {
  const booking = await bookingService.updateBookingStatus(req.params.id, req.body);

  return sendSuccess(res, {
    message: 'Cap nhat booking thanh cong',
    data: booking
  });
});

const getAdminServices = asyncHandler(async (req, res) => {
  const services = await adminService.getAdminServices();

  return sendSuccess(res, {
    message: 'Lay danh sach dich vu thanh cong',
    data: services
  });
});

const createAdminService = asyncHandler(async (req, res) => {
  const service = await serviceService.createService(req.body);
  emitRealtimeEvent('service_created', service.toObject());
  broadcastSystemNotification('Dich vu vua duoc tao moi', 'service');

  return sendSuccess(res, {
    statusCode: 201,
    message: 'Tao dich vu thanh cong',
    data: service
  });
});

const updateAdminService = asyncHandler(async (req, res) => {
  const service = await serviceService.updateService(req.params.id, req.body);
  emitRealtimeEvent('service_updated', service.toObject());
  broadcastSystemNotification('Dich vu vua duoc cap nhat', 'service');

  return sendSuccess(res, {
    message: 'Cap nhat dich vu thanh cong',
    data: service
  });
});

const deleteAdminService = asyncHandler(async (req, res) => {
  const service = await serviceService.deleteService(req.params.id);
  emitRealtimeEvent('service_deleted', {
    _id: service._id.toString()
  });
  broadcastSystemNotification('Dich vu vua bi xoa', 'service');

  return sendSuccess(res, {
    message: 'Xoa dich vu thanh cong',
    data: service
  });
});

const getAdminProducts = asyncHandler(async (req, res) => {
  const products = await adminService.getAdminProducts();

  return sendSuccess(res, {
    message: 'Lay danh sach san pham thanh cong',
    data: products
  });
});

const createAdminProduct = asyncHandler(async (req, res) => {
  const product = await productService.createProduct(req.body);
  emitRealtimeEvent('product_created', product.toObject());
  broadcastSystemNotification('San pham vua duoc tao moi', 'product');

  return sendSuccess(res, {
    statusCode: 201,
    message: 'Tao san pham thanh cong',
    data: product
  });
});

const updateAdminProduct = asyncHandler(async (req, res) => {
  const product = await productService.updateProduct(req.params.id, req.body);
  emitRealtimeEvent('product_updated', product.toObject());
  broadcastSystemNotification('San pham vua duoc cap nhat', 'product');

  return sendSuccess(res, {
    message: 'Cap nhat san pham thanh cong',
    data: product
  });
});

const deleteAdminProduct = asyncHandler(async (req, res) => {
  const product = await productService.deleteProduct(req.params.id);
  emitRealtimeEvent('product_deleted', {
    _id: product._id.toString()
  });
  broadcastSystemNotification('San pham vua bi xoa', 'product');

  return sendSuccess(res, {
    message: 'Xoa san pham thanh cong',
    data: product
  });
});

const getAdminOrders = asyncHandler(async (req, res) => {
  const orders = await adminService.getAdminOrders();

  return sendSuccess(res, {
    message: 'Lay danh sach don hang thanh cong',
    data: orders
  });
});

const getAdminCustomers = asyncHandler(async (req, res) => {
  const customers = await adminService.getAdminCustomers(req.query);

  return sendSuccess(res, {
    message: 'Lay danh sach khach hang thanh cong',
    data: customers
  });
});

const getAdminCustomerDetail = asyncHandler(async (req, res) => {
  const detail = await adminService.getAdminCustomerDetail(req.params.id);

  return sendSuccess(res, {
    message: 'Lay chi tiet khach hang thanh cong',
    data: detail
  });
});

const addAdminCustomerNote = asyncHandler(async (req, res) => {
  const note = await adminService.addAdminCustomerNote(req.params.id, req.body, req.user);
  emitRealtimeEvent('customer_updated', { customerId: req.params.id }, { room: 'admins' });

  return sendSuccess(res, {
    statusCode: 201,
    message: 'Them ghi chu CRM thanh cong',
    data: note
  });
});

const addAdminCustomerHairFormula = asyncHandler(async (req, res) => {
  const formula = await adminService.addAdminCustomerHairFormula(req.params.id, req.body, req.user);
  emitRealtimeEvent('customer_updated', { customerId: req.params.id }, { room: 'admins' });

  return sendSuccess(res, {
    statusCode: 201,
    message: 'Them cong thuc mau thanh cong',
    data: formula
  });
});

const rebookAdminCustomer = asyncHandler(async (req, res) => {
  const booking = await adminService.rebookAdminCustomer(req.params.id, req.body);
  emitRealtimeEvent('customer_updated', { customerId: req.params.id }, { room: 'admins' });

  return sendSuccess(res, {
    statusCode: 201,
    message: 'Dat lai lich hen thanh cong',
    data: booking
  });
});

const getInventoryOverview = asyncHandler(async (req, res) => {
  const inventory = await adminService.getInventoryOverview();

  return sendSuccess(res, {
    message: 'Lay du lieu ton kho thanh cong',
    data: inventory
  });
});

const adjustInventory = asyncHandler(async (req, res) => {
  const result = await adminService.adjustInventory(req.body, req.user);
  emitRealtimeEvent('inventory_updated', result, { room: 'admins' });
  emitRealtimeEvent('product_updated', result.product.toObject());

  if (result.lowStock) {
    broadcastSystemNotification('San pham sap het hang', 'inventory', { room: 'admins' });
  } else {
    broadcastSystemNotification('Ton kho vua duoc cap nhat', 'inventory');
  }

  return sendSuccess(res, {
    message: 'Cap nhat ton kho thanh cong',
    data: result
  });
});

const getRevenueStatistics = asyncHandler(async (req, res) => {
  const stats = await adminService.getRevenueStatistics(req.query);

  return sendSuccess(res, {
    message: 'Lay thong ke doanh thu thanh cong',
    data: stats
  });
});
const uploadImage = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new ApiError(400, 'Vui lòng chọn hình ảnh để tải lên');
  }

  const folderType = req.body.folder || req.query.folder || 'general';
  const folderName = ['services', 'products'].includes(folderType)
    ? `salon/${folderType}`
    : 'salon/general';

  const uploadResult = await cloudinaryService.uploadBuffer(req.file.buffer, folderName);

  return sendSuccess(res, {
    message: 'Upload ảnh thành công',
    data: {
      imageUrl: uploadResult.imageUrl,
      publicId: uploadResult.publicId
    }
  });
});

module.exports = {
  uploadImage,
  getAdminBookings,
  updateAdminBooking,
  getAdminServices,
  createAdminService,
  updateAdminService,
  deleteAdminService,
  getAdminProducts,
  createAdminProduct,
  updateAdminProduct,
  deleteAdminProduct,
  getAdminOrders,
  getAdminCustomers,
  getAdminCustomerDetail,
  addAdminCustomerNote,
  addAdminCustomerHairFormula,
  rebookAdminCustomer,
  getInventoryOverview,
  adjustInventory,
  getRevenueStatistics
};
