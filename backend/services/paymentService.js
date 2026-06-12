const env = require('../config/env');

const createMockPayment = ({ orderId, amount, provider = env.PAYMENT_PROVIDER }) => {
  if (provider === 'cash') {
    return {
      provider: 'cash',
      status: 'not_required',
      checkoutUrl: '',
      metadata: {
        message: 'Thanh toan tai cua hang'
      }
    };
  }

  if (provider === 'vnpay') {
    return {
      provider: 'vnpay',
      status: 'pending',
      checkoutUrl: `${env.FRONTEND_URL}/checkout/mock?vendor=vnpay&orderId=${orderId}`,
      metadata: {
        tmnCode: env.VNPAY_TMN_CODE || 'sandbox_tmn_code',
        hashSecretConfigured: Boolean(env.VNPAY_HASH_SECRET),
        amount
      }
    };
  }

  return {
    provider: 'momo',
    status: 'pending',
    checkoutUrl: `${env.FRONTEND_URL}/checkout/mock?vendor=momo&orderId=${orderId}`,
    metadata: {
      partnerCode: env.MOMO_PARTNER_CODE || 'sandbox_partner_code',
      accessKeyConfigured: Boolean(env.MOMO_ACCESS_KEY),
      secretKeyConfigured: Boolean(env.MOMO_SECRET_KEY),
      amount
    }
  };
};

module.exports = {
  createMockPayment
};
