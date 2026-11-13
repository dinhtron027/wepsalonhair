const mongoose = require('mongoose');

const paymentTransactionSchema = new mongoose.Schema(
  {
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: true
    },
    orderCode: {
      type: String,
      required: true
    },
    amount: {
      type: Number,
      required: true
    },
    method: {
      type: String,
      enum: ['bank_transfer', 'momo', 'vnpay', 'cash', 'cod'],
      required: true
    },
    status: {
      type: String,
      enum: ['pending', 'success', 'failed'],
      default: 'pending'
    },
    transferContent: {
      type: String,
      default: ''
    },
    bankCode: {
      type: String,
      default: ''
    },
    bankAccountNumber: {
      type: String,
      default: ''
    },
    transactionId: {
      type: String,
      default: ''
    },
    rawWebhookData: {
      type: mongoose.Schema.Types.Mixed,
      default: null
    },
    confirmedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    paidAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

paymentTransactionSchema.index({ orderId: 1 });
paymentTransactionSchema.index({ transactionId: 1 });

module.exports = mongoose.model('PaymentTransaction', paymentTransactionSchema);
