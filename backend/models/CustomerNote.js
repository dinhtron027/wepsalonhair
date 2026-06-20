const mongoose = require('mongoose');

const CUSTOMER_NOTE_TYPES = [
  'consultation',
  'service',
  'complaint',
  'follow_up',
  'internal'
];

const customerNoteSchema = new mongoose.Schema(
  {
    customerId: {
      type: String, // Hỗ trợ cả User ID và Số điện thoại khách lẻ
      required: true,
      index: true
    },
    note: {
      type: String,
      required: true,
      trim: true
    },
    type: {
      type: String,
      enum: CUSTOMER_NOTE_TYPES,
      default: 'consultation'
    },
    createdBy: {
      type: String,
      default: 'Admin'
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

customerNoteSchema.index({ customerId: 1, createdAt: -1 });
customerNoteSchema.index(
  { seedKey: 1 },
  {
    unique: true,
    sparse: true
  }
);

module.exports = mongoose.model('CustomerNote', customerNoteSchema);
module.exports.CUSTOMER_NOTE_TYPES = CUSTOMER_NOTE_TYPES;
