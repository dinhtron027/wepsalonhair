const express = require('express');
const crypto = require('crypto');
const router = express.Router();
const Order = require('../models/Order');
const { emitRealtimeEvent, broadcastSystemNotification } = require('../socket/io');
const env = require('../config/env');

const timingSafeEqual = (a, b) => {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
};

router.post('/bank-transfer', async (req, res) => {
  try {
    const signature = req.headers['x-webhook-signature'];
    const webhookToken = env.WEBHOOK_SECRET_TOKEN;

    if (!signature || !webhookToken || !timingSafeEqual(signature, webhookToken)) {
      return res.status(401).json({ success: false, message: 'Unauthorized webhook request' });
    }

    const { transactionId, amount, description } = req.body;
    if (!transactionId || !amount || !description) {
      return res.status(400).json({ success: false, message: 'Missing transaction details' });
    }

    // Regex to extract order code (e.g., DH123456)
    const orderCodeMatch = description.match(/DH\d{6}/);
    if (!orderCodeMatch) {
      return res.status(200).json({ success: true, message: 'Ignored: No order code found in description' });
    }

    const orderCode = orderCodeMatch[0];
    const order = await Order.findOne({ orderCode });

    if (!order) {
      return res.status(404).json({ success: false, message: `Order ${orderCode} not found` });
    }

    if (order.paymentStatus === 'paid') {
      return res.status(200).json({ success: true, message: 'Order already paid' });
    }

    if (order.paymentStatus === 'expired' || order.orderStatus === 'payment_expired' || order.orderStatus === 'cancelled') {
      return res.status(400).json({ success: false, message: 'Order is expired or cancelled' });
    }

    if (order.totalAmount !== Number(amount)) {
      return res.status(400).json({ success: false, message: 'Amount mismatch' });
    }

    // Valid transaction!
    order.paymentStatus = 'paid';
    order.orderStatus = 'confirmed';
    order.paidAt = new Date();
    order.bankTransactionId = transactionId;
    order.customerPaymentNote = 'webhook_confirmed';

    await order.save();

    emitRealtimeEvent('order_updated', order.toObject(), { room: 'admins' });
    broadcastSystemNotification(`Đơn hàng ${orderCode} đã tự động thanh toán qua VietQR`, 'order');

    return res.status(200).json({ success: true, message: 'Payment confirmed successfully' });
  } catch (error) {
    console.error('Webhook error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error in webhook' });
  }
});

module.exports = router;
