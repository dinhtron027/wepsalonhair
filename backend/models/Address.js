const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    fullName: {
      type: String,
      required: true,
      trim: true
    },
    phone: {
      type: String,
      required: true,
      trim: true
    },
    province: {
      type: String,
      required: true,
      trim: true
    },
    district: {
      type: String,
      required: true,
      trim: true
    },
    ward: {
      type: String,
      required: true,
      trim: true
    },
    street: {
      type: String,
      required: true,
      trim: true
    },
    detail: {
      type: String,
      trim: true,
      default: ''
    },
    type: {
      type: String,
      enum: ['home', 'office'],
      default: 'home'
    },
    fullAddress: {
      type: String,
      trim: true,
      default: ''
    },
    lat: {
      type: Number,
      default: null
    },
    lng: {
      type: Number,
      default: null
    },
    isDefault: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

addressSchema.index({ userId: 1, isDefault: -1 });

module.exports = mongoose.model('Address', addressSchema);
