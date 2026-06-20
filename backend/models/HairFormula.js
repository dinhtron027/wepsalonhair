const mongoose = require('mongoose');

const hairFormulaSchema = new mongoose.Schema(
  {
    customerId: {
      type: String, // Hỗ trợ cả User ID và Số điện thoại khách lẻ
      required: true,
      index: true
    },
    appointmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      default: null
    },
    serviceName: {
      type: String,
      required: true,
      trim: true
    },
    colorName: {
      type: String,
      required: true,
      trim: true
    },
    formula: {
      type: String,
      required: true,
      trim: true
    },
    oxidant: {
      type: String,
      trim: true,
      default: ''
    },
    hairBaseLevel: {
      type: String,
      trim: true,
      default: ''
    },
    hairConditionBefore: {
      type: String,
      trim: true,
      default: ''
    },
    hairConditionAfter: {
      type: String,
      trim: true,
      default: ''
    },
    aftercareAdvice: {
      type: String,
      trim: true,
      default: ''
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

hairFormulaSchema.index({ customerId: 1, createdAt: -1 });
hairFormulaSchema.index({ appointmentId: 1 });
hairFormulaSchema.index(
  { seedKey: 1 },
  {
    unique: true,
    sparse: true
  }
);

module.exports = mongoose.model('HairFormula', hairFormulaSchema);
