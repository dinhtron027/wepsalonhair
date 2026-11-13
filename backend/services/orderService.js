const Order = require('../models/Order');
const Product = require('../models/Product');
const Address = require('../models/Address');
const ApiError = require('../utils/ApiError');
const {
  broadcastSystemNotification,
  emitRealtimeEvent
} = require('../socket/io');
const { createMockPayment } = require('./paymentService');
const cartService = require('./cartService');
const crypto = require('crypto');
const shippingService = require('./shippingService');
const env = require('../config/env');

const generateOrderCode = async () => {
  let code;
  let isUnique = false;
  while (!isUnique) {
    code = 'DH' + Math.floor(100000 + Math.random() * 900000);
    const existing = await Order.findOne({ orderCode: code });
    if (!existing) {
      isUnique = true;
    }
  }
  return code;
};

const restoreStockForOrder = async (order) => {
  const updatedProducts = [];
  for (const item of order.items) {
    await Product.updateOne(
      { _id: item.productId },
      {
        $inc: {
          stock: item.quantity
        }
      }
    );
    const updated = await Product.findById(item.productId);
    if (updated) {
      updatedProducts.push(updated);
    }
  }
  if (updatedProducts.length) {
    emitRealtimeEvent('product_updated', {
      products: updatedProducts
    });
  }
};

const checkAndExpireOrders = async () => {
  const now = new Date();
  const expiredOrders = await Order.find({
    paymentMethod: 'bank_transfer',
    paymentStatus: 'pending',
    paymentExpiresAt: { $lt: now }
  });
  
  for (const order of expiredOrders) {
    order.paymentStatus = 'expired';
    order.orderStatus = 'payment_expired';
    await order.save();
    await restoreStockForOrder(order);
    emitRealtimeEvent('order_updated', order.toObject(), { room: 'admins' });
  }
};

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

const decrementStockForOrder = async (resolvedItems) => {
  const decrementedItems = [];
  const updatedProducts = [];

  try {
    for (const item of resolvedItems) {
      const updateResult = await Product.updateOne(
        {
          _id: item.product._id,
          isActive: true,
          stock: {
            $gte: item.quantity
          }
        },
        {
          $inc: {
            stock: -item.quantity
          }
        }
      );

      if (!updateResult.modifiedCount) {
        throw new ApiError(409, `San pham ${item.product.name} khong du ton kho`);
      }

      decrementedItems.push(item);
      const updatedProduct = await Product.findById(item.product._id);

      if (updatedProduct) {
        updatedProducts.push(updatedProduct);
      }
    }

    return updatedProducts;
  } catch (error) {
    for (const item of decrementedItems.reverse()) {
      await Product.updateOne(
        { _id: item.product._id },
        {
          $inc: {
            stock: item.quantity
          }
        }
      );
    }

    throw error;
  }
};

const createOrder = async (user, payload) => {
  const { addressId, shippingMethod = 'delivery', paymentMethod: inputPaymentMethod, paymentProvider, note = '' } = payload || {};

  let address = null;
  let shippingFee = 0;
  let distanceKm = 0;

  if (shippingMethod === 'delivery') {
    if (!addressId) {
      throw new ApiError(400, 'Địa chỉ nhận hàng là bắt buộc khi chọn phương thức giao tận nơi');
    }
    address = await Address.findOne({ _id: addressId, userId: user._id });
    if (!address) {
      throw new ApiError(404, 'Không tìm thấy địa chỉ giao hàng hợp lệ');
    }
  }

  const resolvedItems = await resolveOrderItems(user._id, []);
  const items = resolvedItems.map((item) => item.orderItem);
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  if (shippingMethod === 'delivery') {
    const shippingDetails = await shippingService.calculateShippingDetails(address, subtotal);
    if (!shippingDetails.isDeliverable) {
      throw new ApiError(400, shippingDetails.message || 'Địa chỉ nằm ngoài vùng giao hàng');
    }
    shippingFee = shippingDetails.shippingFee;
    distanceKm = shippingDetails.distanceKm;
  }
  const totalAmount = subtotal + shippingFee;

  const rawMethod = inputPaymentMethod || paymentProvider || 'bank_transfer';
  let paymentMethod = 'bank_transfer';
  if (rawMethod === 'cash') {
    paymentMethod = 'cash';
  } else if (rawMethod === 'cod') {
    paymentMethod = 'cod';
  } else {
    paymentMethod = 'bank_transfer';
  }

  let paymentStatus = 'pending';
  let orderStatus = 'pending';
  let paymentExpiresAt = undefined;

  if (paymentMethod === 'bank_transfer') {
    paymentStatus = 'pending';
    orderStatus = 'waiting_payment';
    paymentExpiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 mins
  } else if (paymentMethod === 'cod') {
    paymentStatus = 'unpaid';
    orderStatus = 'confirmed';
  } else if (paymentMethod === 'cash') {
    paymentStatus = 'pay_at_store';
    orderStatus = 'pending';
  }

  const orderCode = await generateOrderCode();

  const order = new Order({
    orderCode,
    userId: user._id,
    customerName: address ? address.fullName : user.name,
    phone: address ? address.phone : user.phone,
    email: user.email || '',
    address: address ? {
      fullName: address.fullName,
      phone: address.phone,
      province: address.province,
      district: address.district,
      ward: address.ward,
      street: address.street,
      detail: address.detail || ''
    } : undefined,
    items,
    subtotal,
    shippingFee,
    totalAmount,
    shippingMethod,
    distanceKm,
    deliveryStatus: 'pending',
    paymentMethod,
    paymentStatus,
    orderStatus,
    customerNote: note,
    adminNote: '',
    paymentExpiresAt
  });

  // Tạo nội dung chuyển khoản nếu thanh toán qua Ngân hàng
  if (paymentMethod === 'bank_transfer') {
    order.transferContent = `${env.BANK_TRANSFER_PREFIX || 'SDC'} ${orderCode}`;
  }

  await order.save();

  let updatedProducts = [];
  try {
    updatedProducts = await decrementStockForOrder(resolvedItems);
  } catch (error) {
    await Order.deleteOne({ _id: order._id });
    throw error;
  }

  // Clear giỏ hàng của user sau khi đặt hàng thành công
  await cartService.clearCart(user._id);

  emitRealtimeEvent('order_created', order.toObject(), { room: 'admins' });
  emitRealtimeEvent('product_updated', {
    products: updatedProducts
  });
  broadcastSystemNotification('Có đơn hàng mới vừa được tạo', 'order');

  const lowStockProducts = updatedProducts.filter(
    (product) => product.stock <= (product.lowStockThreshold || 0)
  );

  if (lowStockProducts.length) {
    broadcastSystemNotification('Một số sản phẩm sắp hết hàng', 'inventory', {
      room: 'admins'
    });
  }

  return order;
};

const getOrders = async (user) => {
  await checkAndExpireOrders();

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
    throw new ApiError(404, 'Không tìm thấy đơn hàng');
  }

  // Reactive expiration check
  if (order.paymentMethod === 'bank_transfer' && order.paymentStatus === 'pending') {
    if (order.paymentExpiresAt && new Date() > order.paymentExpiresAt) {
      order.paymentStatus = 'expired';
      order.orderStatus = 'payment_expired';
      await order.save();
      await restoreStockForOrder(order);
      emitRealtimeEvent('order_updated', order.toObject(), { room: 'admins' });
    }
  }

  if (user) {
    const canAccess = user.role === 'admin' || (order.userId && order.userId._id.toString() === user._id.toString());

    if (!canAccess) {
      throw new ApiError(403, 'Bạn không có quyền xem đơn hàng này');
    }
  }

  return order;
};

const createGuestOrder = async (payload, user = null) => {
  const { customerName, phone, email = '', products, totalPrice, note = '', paymentMethod = 'bank_transfer', shippingMethod = 'delivery', address: inputAddress } = payload;

  if (!products || !products.length) {
    throw new ApiError(400, 'Khong co san pham nao de tao don hang');
  }

  const items = products.map((item) => ({
    productId: item.productId,
    name: item.name,
    price: item.price,
    image: item.image || '',
    quantity: item.quantity
  }));

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  
  let shippingFee = 0;
  let distanceKm = 0;

  if (shippingMethod === 'delivery' && inputAddress) {
    try {
      const shippingDetails = await shippingService.calculateShippingDetails(inputAddress, subtotal);
      if (shippingDetails.isDeliverable) {
        shippingFee = shippingDetails.shippingFee;
        distanceKm = shippingDetails.distanceKm;
      }
    } catch (e) {
      console.error('Guest order shipping calculation failed:', e.message);
    }
  }

  const totalAmount = totalPrice || (subtotal + shippingFee);

  const orderCode = await generateOrderCode();

  const finalPaymentMethod = paymentMethod === 'cash' ? 'cash' : 'bank_transfer';
  const finalPaymentStatus = finalPaymentMethod === 'bank_transfer' ? 'waiting_confirmation' : 'pay_at_store';

  const order = new Order({
    orderCode,
    userId: user?._id || null,
    customerName,
    phone,
    email,
    items,
    subtotal,
    shippingFee,
    totalAmount,
    shippingMethod,
    distanceKm,
    deliveryStatus: 'pending',
    address: inputAddress ? {
      fullName: inputAddress.fullName || customerName,
      phone: inputAddress.phone || phone,
      province: inputAddress.province || '',
      district: inputAddress.district || '',
      ward: inputAddress.ward || '',
      street: inputAddress.street || '',
      detail: inputAddress.detail || ''
    } : undefined,
    paymentMethod: finalPaymentMethod,
    paymentStatus: finalPaymentStatus,
    orderStatus: 'pending',
    transferContent: '',
    customerNote: note,
    adminNote: ''
  });

  // Tạo nội dung chuyển khoản
  if (finalPaymentMethod === 'bank_transfer') {
    const sanitizedPhone = phone.replace(/\D/g, '').slice(-4);
    order.transferContent = `DC-${orderCode}-${sanitizedPhone}`;
  }

  await order.save();

  emitRealtimeEvent('order_created', order.toObject(), { room: 'admins' });
  broadcastSystemNotification('Co don hang moi', 'order');

  return order;
};

module.exports = {
  createOrder,
  createGuestOrder,
  getOrderById,
  getOrders,
  restoreStockForOrder,
  checkAndExpireOrders
};
