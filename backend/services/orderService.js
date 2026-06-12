const Order = require('../models/Order');
const Product = require('../models/Product');
const ApiError = require('../utils/ApiError');
const {
  broadcastSystemNotification,
  emitRealtimeEvent
} = require('../socket/io');
const { createMockPayment } = require('./paymentService');
const cartService = require('./cartService');

const mergeItems = (items) => {
  const merged = new Map();

  items.forEach((item) => {
    const key = item.productId.toString();
    const currentQuantity = merged.get(key)?.quantity || 0;

    merged.set(key, {
      productId: key,
      quantity: currentQuantity + item.quantity
    });
  });

  return Array.from(merged.values());
};

const resolveOrderItems = async (userId, requestedItems = []) => {
  let items = requestedItems;

  if (!items.length) {
    const cart = await cartService.getCart(userId);
    items = cart.items.map((item) => ({
      productId: item.productId.toString(),
      quantity: item.quantity
    }));
  }

  if (!items.length) {
    throw new ApiError(400, 'Khong co san pham nao de tao don hang');
  }

  const mergedItems = mergeItems(items);
  const products = await Product.find({
    _id: {
      $in: mergedItems.map((item) => item.productId)
    },
    isActive: true
  });

  const productMap = new Map(products.map((product) => [product._id.toString(), product]));

  return mergedItems.map((item) => {
    const product = productMap.get(item.productId);

    if (!product) {
      throw new ApiError(404, `Khong tim thay san pham ${item.productId}`);
    }

    if (product.stock < item.quantity) {
      throw new ApiError(400, `San pham ${product.name} khong du ton kho`);
    }

    return {
      product,
      quantity: item.quantity,
      orderItem: {
        productId: product._id,
        name: product.name,
        price: product.price,
        image: product.image,
        quantity: item.quantity
      }
    };
  });
};

const createOrder = async (user, payload) => {
  const normalizedPayload = {
    items: [],
    paymentProvider: 'cash',
    note: '',
    ...(payload || {})
  };
  const shouldClearCart = !normalizedPayload.items.length;
  const resolvedItems = await resolveOrderItems(user._id, normalizedPayload.items);
  const products = resolvedItems.map((item) => item.orderItem);
  const totalPrice = products.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const order = new Order({
    userId: user._id,
    products,
    totalPrice,
    note: normalizedPayload.note || ''
  });

  order.payment = createMockPayment({
    orderId: order._id.toString(),
    amount: totalPrice,
    provider: normalizedPayload.paymentProvider
  });

  if (order.payment.status === 'pending') {
    order.status = 'pending';
  }

  await order.save();

  const updatedProducts = [];

  for (const item of resolvedItems) {
    const updatedProduct = await Product.findByIdAndUpdate(
      item.product._id,
      {
        $inc: {
          stock: -item.quantity
        }
      },
      { new: true }
    );

    if (updatedProduct) {
      updatedProducts.push(updatedProduct);
    }
  }

  if (shouldClearCart) {
    await cartService.clearCart(user._id);
  }

  emitRealtimeEvent('order_created', order.toObject());
  emitRealtimeEvent('product_updated', {
    products: updatedProducts
  });
  broadcastSystemNotification('Co don hang moi vua duoc tao', 'order');

  const lowStockProducts = updatedProducts.filter(
    (product) => product.stock <= (product.lowStockThreshold || 0)
  );

  if (lowStockProducts.length) {
    broadcastSystemNotification('Mot so san pham sap het hang', 'inventory', {
      room: 'admins'
    });
  }

  return order;
};

const getOrders = async (user) => {
  const query =
    user.role === 'admin'
      ? {}
      : {
          userId: user._id
        };

  return Order.find(query).populate('userId', 'name email phone role').sort({ createdAt: -1 });
};

const getOrderById = async (orderId, user) => {
  const order = await Order.findById(orderId).populate('userId', 'name email phone role');

  if (!order) {
    throw new ApiError(404, 'Khong tim thay don hang');
  }

  const canAccess = user.role === 'admin' || order.userId._id.toString() === user._id.toString();

  if (!canAccess) {
    throw new ApiError(403, 'Ban khong co quyen xem don hang nay');
  }

  return order;
};

module.exports = {
  createOrder,
  getOrderById,
  getOrders
};
