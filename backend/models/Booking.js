const mongoose = require('mongoose');

const bookingAddonSchema = new mongoose.Schema(
  {
    addonId: {
      type: mongoose.Schema.Types.ObjectId,
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
    }
  },
  {
    _id: false
  }
);

const bookingSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
      default: null
    },
    customerName: {
      type: String,
      required: true,
      trim: true
    },
    phone: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      default: ''
    },
    serviceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Service',
      required: true
    },
    serviceName: {
      type: String,
      required: true,
      trim: true
    },
    stylist: {
      type: String,
      trim: true,
      default: ''
    },
    date: {
      type: Date,
      required: true
    },
    time: {
      type: String,
      required: true,
      trim: true
    },
    addOns: {
      type: [bookingAddonSchema],
      default: []
    },
    totalPrice: {
      type: Number,
      required: true,
      min: 0
    },
    baseServicePrice: {
      type: Number,
      required: true,
      min: 0,
      default: 0
    },
    serviceDiscountPercent: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    pricingRuleLabel: {
      type: String,
      trim: true,
      default: ''
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'in_service', 'completed', 'cancelled'],
      default: 'pending'
    },
    hairColorUsed: {
      type: String,
      trim: true,
      default: ''
    },
    note: {
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

bookingSchema.index(
  { date: 1, time: 1 },
  {
    unique: true,
    partialFilterExpression: {
      status: {
        $in: ['pending', 'confirmed', 'in_service']
      }
    }
  }
);
bookingSchema.index({ status: 1, date: 1, time: 1 });
bookingSchema.index({ userId: 1, createdAt: -1 });
bookingSchema.index({ customerId: 1, date: -1, time: -1 });
bookingSchema.index(
  { seedKey: 1 },
  {
    unique: true,
    sparse: true
  }
);

module.exports = mongoose.model('Booking', bookingSchema);
