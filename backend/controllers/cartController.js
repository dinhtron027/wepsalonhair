const cartService = require('../services/cartService');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/response');

const getCart = asyncHandler(async (req, res) => {
  const cart = await cartService.getCart(req.user._id);

  return sendSuccess(res, {
    message: 'Lay gio hang thanh cong',
    data: cart
  });
});

const addCartItem = asyncHandler(async (req, res) => {
  const cart = await cartService.addItem(req.user._id, req.body);

  return sendSuccess(res, {
    message: 'Them san pham vao gio hang thanh cong',
    data: cart
  });
});

const updateCartItem = asyncHandler(async (req, res) => {
  const cart = await cartService.updateItem(req.user._id, req.params.productId, req.body.quantity);

  return sendSuccess(res, {
    message: 'Cap nhat gio hang thanh cong',
    data: cart
  });
});

const removeCartItem = asyncHandler(async (req, res) => {
  const cart = await cartService.removeItem(req.user._id, req.params.productId);

  return sendSuccess(res, {
    message: 'Xoa san pham khoi gio hang thanh cong',
    data: cart
  });
});

module.exports = {
  getCart,
  addCartItem,
  updateCartItem,
  removeCartItem
};
