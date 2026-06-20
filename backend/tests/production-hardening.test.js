const assert = require('node:assert/strict');
const test = require('node:test');

const loadPaymentServiceWithEnv = (overrides = {}) => {
  const originalEnv = { ...process.env };
  Object.assign(process.env, overrides);

  delete require.cache[require.resolve('../config/env')];
  delete require.cache[require.resolve('../services/paymentService')];

  const paymentService = require('../services/paymentService');

  process.env = originalEnv;
  delete require.cache[require.resolve('../config/env')];
  delete require.cache[require.resolve('../services/paymentService')];

  return paymentService;
};

test('registration requires stronger passwords than legacy six-character minimum', () => {
  const { authSchemas } = require('../utils/validationSchemas');
  const { error } = authSchemas.register.validate({
    name: 'Test User',
    phone: '0900000000',
    email: 'test@example.com',
    password: '123456'
  });

  assert.ok(error);
});

test('booking total applies service discount and selected add-ons', () => {
  const { calculateBookingTotal } = require('../services/bookingService');
  const service = {
    price: 100000,
    discount: 10,
    pricingRules: [],
    addons: []
  };
  const selectedAddOns = [{ price: 25000 }];

  const total = calculateBookingTotal(service, selectedAddOns, {
    date: new Date('2026-01-01T00:00:00.000Z'),
    time: '10:00'
  });

  assert.equal(total, 115000);
});

test('production payment does not silently create mock checkout for non-cash provider', () => {
  const { ensureConfiguredProvider } = loadPaymentServiceWithEnv({
    NODE_ENV: 'production',
    JWT_SECRET: 'production-secret-value-with-more-than-32-chars',
    PAYMENT_MOCK_ENABLED: 'false',
    FRONTEND_URL: 'https://example.com'
  });

  assert.throws(() => ensureConfiguredProvider('momo'), /production/);
});

test('cash payment remains available in production without gateway credentials', () => {
  const { createMockPayment } = loadPaymentServiceWithEnv({
    NODE_ENV: 'production',
    JWT_SECRET: 'production-secret-value-with-more-than-32-chars',
    PAYMENT_MOCK_ENABLED: 'false',
    FRONTEND_URL: 'https://example.com'
  });

  const payment = createMockPayment({
    orderId: 'order-1',
    amount: 100000,
    provider: 'cash'
  });

  assert.equal(payment.provider, 'cash');
  assert.equal(payment.status, 'not_required');
});
