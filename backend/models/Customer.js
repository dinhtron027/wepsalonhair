const mongoose = require('mongoose');

const CUSTOMER_SEGMENTS = [
  'new',
  'regular',
  'vip',
  'inactive',
  'high_value',
  'color_customer',
  'treatment_needed'
];

const customerSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    fullName: {
      type: String,
      required: true,
      trim: true
    },
    phone: {
      type: String,
      trim: true,
      default: ''
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      default: ''
    },
    totalAppointments: {
      type: Number,
      min: 0,
      default: 0
    },
    totalSpent: {
      type: Number,
      min: 0,
      default: 0
    },
    lastVisitAt: {
      type: Date,
      default: null
    },
    customerSegment: {
      type: String,
      enum: CUSTOMER_SEGMENTS,
      default: 'new'
    },
    segments: {
      type: [
        {
          type: String,
          enum: CUSTOMER_SEGMENTS
        }
      ],
      default: ['new']
    },
    preferredStaff: {
      type: String,
      trim: true,
      default: ''
    },
    preferredServices: {
      type: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Service'
        }
      ],
      default: []
    },
    hairColorHistory: {
      type: [String],
      default: []
    },
    noteCount: {
      type: Number,
      min: 0,
      default: 0
    },
    lastNote: {
      type: String,
      trim: true,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

customerSchema.index(
  { userId: 1 },
  {
    unique: true,
    partialFilterExpression: {
      userId: { $type: 'objectId' }
    }
  }
);
customerSchema.index(
  { phone: 1 },
  {
    unique: true,
    partialFilterExpression: {
      phone: { $type: 'string', $gt: '' }
    }
  }
);
customerSchema.index({ email: 1 });
customerSchema.index({ customerSegment: 1, lastVisitAt: -1 });
customerSchema.index({ segments: 1, totalSpent: -1 });

module.exports = mongoose.model('Customer', customerSchema);
module.exports.CUSTOMER_SEGMENTS = CUSTOMER_SEGMENTS;
