const Cart = require('../models/Cart');
const Product = require('../models/Product');
const ApiError = require('../utils/ApiError');

const calculateCartTotals = (items) => ({
  totalItems: items.reduce((sum, item) => sum + item.quantity, 0),
  subtotal: items.reduce((sum, item) => sum + item.price * item.quantity, 0)
});

const getOrCreateCart = async (userId) => {
  let cart = await Cart.findOne({ userId });

  if (!cart) {
    cart = await Cart.create({
      userId,
      items: []
    });
  }

  return cart;
};

const saveCartTotals = async (cart) => {
  const totals = calculateCartTotals(cart.items);
  cart.totalItems = totals.totalItems;
  cart.subtotal = totals.subtotal;
  await cart.save();
  return cart;
};

const getCart = async (userId) => getOrCreateCart(userId);

const addItem = async (userId, { productId, quantity }) => {
  const product = await Product.findOne({
    _id: productId,
    isActive: true
  });

  if (!product) {
    throw new ApiError(404, 'Khong tim thay san pham');
  }

  if (product.stock < quantity) {
    throw new ApiError(400, 'So luong san pham trong kho khong du');
  }

  const cart = await getOrCreateCart(userId);
  const existingItem = cart.items.find((item) => item.productId.toString() === productId);

  if (existingItem) {
    const nextQuantity = existingItem.quantity + quantity;

    if (nextQuantity > product.stock) {
      throw new ApiError(400, 'So luong vuot qua ton kho hien tai');
    }

    existingItem.quantity = nextQuantity;
    existingItem.price = product.price;
    existingItem.name = product.name;
    existingItem.image = product.image;
  } else {
    cart.items.push({
      productId: product._id,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity
    });
  }

  return saveCartTotals(cart);
};

const updateItem = async (userId, productId, quantity) => {
  const product = await Product.findOne({
    _id: productId,
    isActive: true
  });

  if (!product) {
    throw new ApiError(404, 'Khong tim thay san pham');
  }

  if (quantity > product.stock) {
    throw new ApiError(400, 'So luong vuot qua ton kho hien tai');
  }

  const cart = await getOrCreateCart(userId);
  const item = cart.items.find((cartItem) => cartItem.productId.toString() === productId);

  if (!item) {
    throw new ApiError(404, 'San pham khong co trong gio hang');
  }

  item.quantity = quantity;
  item.price = product.price;
  item.name = product.name;
  item.image = product.image;

  return saveCartTotals(cart);
};

const removeItem = async (userId, productId) => {
  const cart = await getOrCreateCart(userId);
  const initialLength = cart.items.length;

  cart.items = cart.items.filter((item) => item.productId.toString() !== productId);

  if (cart.items.length === initialLength) {
    throw new ApiError(404, 'San pham khong co trong gio hang');
  }

  return saveCartTotals(cart);
};

const clearCart = async (userId) => {
  const cart = await getOrCreateCart(userId);
  cart.items = [];
  return saveCartTotals(cart);
};

module.exports = {
  addItem,
  calculateCartTotals,
  clearCart,
  getCart,
  getOrCreateCart,
  removeItem,
  updateItem
};
