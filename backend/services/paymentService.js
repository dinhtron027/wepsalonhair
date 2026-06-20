const env = require('../config/env');
const ApiError = require('../utils/ApiError');

const ensureConfiguredProvider = (provider) => {
  if (provider === 'cash') {
    return;
  }

  if (env.NODE_ENV === 'production' && !env.PAYMENT_MOCK_ENABLED) {
    throw new ApiError(
      501,
      'Nha cung cap thanh toan chua duoc cau hinh production'
    );
  }

  if (provider === 'vnpay') {
    const hasVnpayConfig = Boolean(env.VNPAY_TMN_CODE && env.VNPAY_HASH_SECRET);

    if (env.NODE_ENV === 'production' && !hasVnpayConfig) {
      throw new ApiError(503, 'Cau hinh VNPay production chua day du');
    }
  }

  if (provider === 'momo') {
    const hasMomoConfig = Boolean(
      env.MOMO_PARTNER_CODE && env.MOMO_ACCESS_KEY && env.MOMO_SECRET_KEY
    );

    if (env.NODE_ENV === 'production' && !hasMomoConfig) {
      throw new ApiError(503, 'Cau hinh Momo production chua day du');
    }
  }
};

const createMockPayment = ({ orderId, amount, provider = env.PAYMENT_PROVIDER }) => {
  ensureConfiguredProvider(provider);

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
  createMockPayment,
  ensureConfiguredProvider
};
