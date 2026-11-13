const shippingService = require('../services/shippingService');
const Address = require('../models/Address');
const cartService = require('../services/cartService');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/response');
const ApiError = require('../utils/ApiError');

const calculateShipping = asyncHandler(async (req, res) => {
  const { addressId } = req.body;

  if (!addressId) {
    throw new ApiError(400, 'Địa chỉ nhận hàng là bắt buộc');
  }

  // Retrieve address of this user
  const address = await Address.findOne({ _id: addressId, userId: req.user._id });
  if (!address) {
    throw new ApiError(404, 'Không tìm thấy địa chỉ giao hàng hợp lệ');
  }

  // Retrieve the cart of this user to compute the subtotal
  const cart = await cartService.getCart(req.user._id);
  const subtotal = cart.subtotal || 0;

  const shippingDetails = await shippingService.calculateShippingDetails(address, subtotal);

  return sendSuccess(res, {
    message: 'Tính phí vận chuyển thành công',
    data: shippingDetails
  });
});

module.exports = {
  calculateShipping
};
