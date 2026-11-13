const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    name: {
      type: String,
      required: true
    },
    price: {
      type: Number,
      required: true,
      min: 0
    },
    image: {
      type: String,
      default: ''
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    }
  },
  {
    _id: false
  }
);

const orderSchema = new mongoose.Schema(
  {
    orderCode: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    customerName: {
      type: String,
      trim: true,
      default: ''
    },
    phone: {
      type: String,
      trim: true,
      default: ''
    },
    email: {
      type: String,
      trim: true,
      default: ''
    },
    address: {
      fullName: { type: String, default: '' },
      phone: { type: String, default: '' },
      province: { type: String, default: '' },
      district: { type: String, default: '' },
      ward: { type: String, default: '' },
      street: { type: String, default: '' },
      detail: { type: String, default: '' }
    },
    items: {
      type: [orderItemSchema],
      required: true
    },
    subtotal: {
      type: Number,
      required: true,
      min: 0,
      default: 0
    },
    shippingFee: {
      type: Number,
      default: 0
    },
    discount: {
      type: Number,
      default: 0
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0
    },
    shippingMethod: {
      type: String,
      enum: ['pickup', 'delivery'],
      default: 'delivery'
    },
    distanceKm: {
      type: Number,
      default: 0
    },
    deliveryStatus: {
      type: String,
      enum: ['pending', 'shipping', 'delivered', 'cancelled'],
      default: 'pending'
    },
    paymentMethod: {
      type: String,
      enum: ['bank_transfer', 'cash', 'cod'],
      default: 'cash'
    },
    paymentStatus: {
      type: String,
      enum: [
        'pending_payment', 'waiting_confirmation', 'pay_at_store', 'paid', 'cancelled',
        'unpaid', 'pending', 'failed', 'expired'
      ],
      default: 'pay_at_store'
    },
    orderStatus: {
      type: String,
      enum: [
        'pending', 'waiting_payment', 'confirmed', 'preparing', 'shipping', 'completed', 'cancelled',
        'payment_expired', 'processing'
      ],
      default: 'pending'
    },
    transferContent: {
      type: String,
      trim: true,
      default: ''
    },
    paymentExpiresAt: {
      type: Date,
      default: null
    },
    customerReportedPaidAt: {
      type: Date,
      default: null
    },
    customerPaymentNote: {
      type: String,
      trim: true,
      default: ''
    },
    paidAt: {
      type: Date,
      default: null
    },
    confirmedPaymentBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    bankTransactionId: {
      type: String,
      trim: true,
      default: ''
    },
    paymentFailureReason: {
      type: String,
      trim: true,
      default: ''
    },
    customerNote: {
      type: String,
      trim: true,
      default: ''
    },
    adminNote: {
      type: String,
      trim: true,
      default: ''
    },
    seedKey: {
      type: String,
      default: undefined
    }
  },
  {
    timestamps: true
  }
);

orderSchema.index({ userId: 1, createdAt: -1 });
orderSchema.index({ orderStatus: 1, createdAt: -1 });
orderSchema.index(
  { seedKey: 1 },
  {
    unique: true,
    sparse: true
  }
);

module.exports = mongoose.model('Order', orderSchema);

