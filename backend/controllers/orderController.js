const orderService = require('../services/orderService');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/response');
const env = require('../config/env');
const Order = require('../models/Order');
const ApiError = require('../utils/ApiError');
const { emitRealtimeEvent, broadcastSystemNotification } = require('../socket/io');

const createOrder = asyncHandler(async (req, res) => {
  const order = await orderService.createOrder(req.user, req.body);

  return sendSuccess(res, {
    statusCode: 201,
    message: 'Tao don hang thanh cong',
    data: order
  });
});

const getOrders = asyncHandler(async (req, res) => {
  const orders = await orderService.getOrders(req.user);

  return sendSuccess(res, {
    message: 'Lay danh sach don hang thanh cong',
    data: orders
  });
});

const getOrderDetail = asyncHandler(async (req, res) => {
  const order = await orderService.getOrderById(req.params.id, req.user);

  return sendSuccess(res, {
    message: 'Lay chi tiet don hang thanh cong',
    data: order
  });
});

const getOrderPaymentDetail = asyncHandler(async (req, res) => {
  const order = await orderService.getOrderById(req.params.id, req.user);
  
  const qrUrl = order.paymentMethod === 'bank_transfer'
    ? `https://img.vietqr.io/image/${env.BANK_CODE}-${env.BANK_ACCOUNT_NUMBER}-compact2.jpg?amount=${order.totalAmount}&addInfo=${encodeURIComponent(order.transferContent)}&accountName=${encodeURIComponent(env.BANK_ACCOUNT_NAME)}`
    : '';

  return sendSuccess(res, {
    message: 'Lấy thông tin thanh toán đơn hàng thành công',
    data: {
      orderId: order._id,
      orderCode: order.orderCode,
      amount: order.totalAmount,
      paymentMethod: order.paymentMethod,
      paymentStatus: order.paymentStatus,
      orderStatus: order.orderStatus,
      bankInfo: {
        bankCode: env.BANK_CODE,
        accountNumber: env.BANK_ACCOUNT_NUMBER,
        accountName: env.BANK_ACCOUNT_NAME
      },
      transferContent: order.transferContent,
      qrUrl,
      paymentExpiresAt: order.paymentExpiresAt,
      customerPaymentNote: order.customerPaymentNote,
      customerReportedPaidAt: order.customerReportedPaidAt
    }
  });
});

const reportOrderPaid = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) {
    throw new ApiError(404, 'Không tìm thấy đơn hàng');
  }

  // Verify access: only the owner of the order can report
  if (order.userId && order.userId.toString() !== req.user._id.toString()) {
    throw new ApiError(403, 'Bạn không có quyền báo cáo thanh toán cho đơn hàng này');
  }

  if (order.paymentMethod !== 'bank_transfer') {
    throw new ApiError(400, 'Chỉ hỗ trợ báo cáo thanh toán cho đơn hàng chuyển khoản');
  }

  if (order.paymentStatus === 'paid') {
    throw new ApiError(400, 'Đơn hàng đã được thanh toán');
  }

  if (order.paymentStatus === 'expired' || order.orderStatus === 'payment_expired') {
    throw new ApiError(400, 'Đơn hàng đã hết hạn thanh toán');
  }

  if (order.paymentStatus === 'cancelled' || order.orderStatus === 'cancelled') {
    throw new ApiError(400, 'Đơn hàng đã bị hủy');
  }

  order.customerPaymentNote = 'customer_reported_paid';
  order.customerReportedPaidAt = new Date();
  await order.save();

  const populated = await Order.findById(order._id).populate('userId', 'name email phone role');
  emitRealtimeEvent('order_updated', populated.toObject(), { room: 'admins' });
  broadcastSystemNotification(`Khách hàng đã báo thanh toán cho đơn hàng ${order.orderCode}`, 'order');

  return sendSuccess(res, {
    message: 'Đã gửi thông báo xác nhận thanh toán chuyển khoản thành công',
    data: populated
  });
});

module.exports = {
  createOrder,
  getOrders,
  getOrderDetail,
  getOrderPaymentDetail,
  reportOrderPaid
};
