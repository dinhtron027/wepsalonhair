const assert = require('node:assert/strict');
const test = require('node:test');
const { classifyCustomer } = require('../services/customerService');

const colorBooking = {
  status: 'completed',
  serviceId: {
    categorySlug: 'color'
  }
};

test('CRM segmentation marks new customers with zero or one appointment', () => {
  const result = classifyCustomer({
    totalAppointments: 1,
    totalSpent: 250000,
    lastVisitAt: new Date('2026-06-10T00:00:00.000Z'),
    bookings: [],
    notes: [],
    formulas: [],
    now: new Date('2026-06-21T00:00:00.000Z')
  });

  assert.ok(result.segments.includes('new'));
});

test('CRM segmentation can assign multiple actionable segments', () => {
  const result = classifyCustomer({
    totalAppointments: 5,
    totalSpent: 3500000,
    lastVisitAt: new Date('2026-01-01T00:00:00.000Z'),
    bookings: [colorBooking, colorBooking],
    notes: [{ note: 'Tóc khô xơ và yếu phần ngọn' }],
    formulas: [],
    now: new Date('2026-06-21T00:00:00.000Z')
  });

  assert.equal(result.customerSegment, 'vip');
  assert.ok(result.segments.includes('regular'));
  assert.ok(result.segments.includes('vip'));
  assert.ok(result.segments.includes('inactive'));
  assert.ok(result.segments.includes('color_customer'));
  assert.ok(result.segments.includes('treatment_needed'));
});

test('customer CRM query validation accepts pagination and sorting', () => {
  const { customerSchemas } = require('../utils/validationSchemas');
  const { error, value } = customerSchemas.query.validate({
    search: 'nguyen',
    segment: 'vip',
    sortBy: 'totalSpent',
    sortOrder: 'desc',
    page: 2,
    limit: 10
  });

  assert.equal(error, undefined);
  assert.equal(value.page, 2);
  assert.equal(value.limit, 10);
});
