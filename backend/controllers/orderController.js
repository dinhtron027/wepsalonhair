const orderService = require('../services/orderService');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/response');

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

module.exports = {
  createOrder,
  getOrders,
  getOrderDetail
};
