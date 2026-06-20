const mongoose = require('mongoose');

const orderProductSchema = new mongoose.Schema(
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
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    products: {
      type: [orderProductSchema],
      required: true
    },
    totalPrice: {
      type: Number,
      required: true,
      min: 0
    },
    status: {
      type: String,
      enum: ['pending', 'paid', 'processing', 'completed', 'cancelled'],
      default: 'pending'
    },
    note: {
      type: String,
      trim: true,
      default: ''
    },
    payment: {
      provider: {
        type: String,
        enum: ['cash', 'momo', 'vnpay'],
        default: 'cash'
      },
      status: {
        type: String,
        enum: ['pending', 'paid', 'failed', 'not_required'],
        default: 'not_required'
      },
      checkoutUrl: {
        type: String,
        default: ''
      },
      metadata: {
        type: Object,
        default: {}
      }
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
orderSchema.index({ status: 1, createdAt: -1 });
orderSchema.index(
  { seedKey: 1 },
  {
    unique: true,
    sparse: true
  }
);

module.exports = mongoose.model('Order', orderSchema);
