const Joi = require('joi');

const objectId = Joi.string().trim().length(24).hex();
const timePattern = /^([01]\d|2[0-3]):([0-5]\d)$/;

const addOnSchema = Joi.object({
  name: Joi.string().trim().required(),
  price: Joi.number().min(0).required(),
  description: Joi.string().trim().allow('').default('')
});

const pricingRuleSchema = Joi.object({
  label: Joi.string().trim().allow('').default(''),
  daysOfWeek: Joi.array()
    .items(Joi.number().integer().min(0).max(6))
    .unique()
    .default([]),
  startTime: Joi.string().pattern(timePattern).required(),
  endTime: Joi.string().pattern(timePattern).required(),
  discountPercent: Joi.number().min(0).max(100).required(),
  isActive: Joi.boolean().default(true)
});

const authSchemas = {
  register: Joi.object({
    name: Joi.string().trim().min(2).max(120).required(),
    phone: Joi.string().trim().min(8).max(20).required(),
    email: Joi.string().trim().email().required(),
    password: Joi.string().min(6).max(128).required()
  }),
  login: Joi.object({
    identifier: Joi.string().trim().required(),
    password: Joi.string().min(6).max(128).required()
  })
};

const bookingSchemas = {
  create: Joi.object({
    name: Joi.string().trim().min(2).max(120),
    customerName: Joi.string().trim().min(2).max(120),
    phone: Joi.string().trim().min(8).max(20).required(),
    email: Joi.string().trim().email().allow('', null),
    serviceId: objectId.required(),
    stylist: Joi.string().trim().allow('', null),
    date: Joi.date().iso().required(),
    time: Joi.string().pattern(timePattern).required(),
    note: Joi.string().trim().allow('', null),
    addOnIds: Joi.array().items(objectId).unique().default([])
  }).or('name', 'customerName'),
  update: Joi.object({
    status: Joi.string()
      .valid('pending', 'confirmed', 'in_service', 'completed', 'cancelled')
      .required(),
    stylist: Joi.string().trim().allow('', null),
    hairColorUsed: Joi.string().trim().allow('', null),
    note: Joi.string().trim().allow('', null)
  }),
  query: Joi.object({
    status: Joi.string().valid('pending', 'confirmed', 'in_service', 'completed', 'cancelled'),
    date: Joi.date().iso(),
    limit: Joi.number().integer().min(1).max(200).default(50)
  }),
  slotQuery: Joi.object({
    date: Joi.date().iso().required()
  })
};

const serviceSchemas = {
  create: Joi.object({
    name: Joi.string().trim().min(2).max(150).required(),
    category: Joi.string().trim().min(2).max(120).required(),
    price: Joi.number().min(0).required(),
    discount: Joi.number().min(0).max(100).default(0),
    description: Joi.string().trim().allow('').default(''),
    image: Joi.string().trim().uri().allow('').default(''),
    durationMinutes: Joi.number().integer().min(15).max(480).default(60),
    addons: Joi.array().items(addOnSchema).default([]),
    pricingRules: Joi.array().items(pricingRuleSchema).default([])
  }),
  update: Joi.object({
    name: Joi.string().trim().min(2).max(150),
    category: Joi.string().trim().min(2).max(120),
    price: Joi.number().min(0),
    discount: Joi.number().min(0).max(100),
    description: Joi.string().trim().allow(''),
    image: Joi.string().trim().uri().allow(''),
    durationMinutes: Joi.number().integer().min(15).max(480),
    addons: Joi.array().items(addOnSchema),
    pricingRules: Joi.array().items(pricingRuleSchema)
  }).min(1)
};

const productSchemas = {
  create: Joi.object({
    name: Joi.string().trim().min(2).max(150).required(),
    price: Joi.number().min(0).required(),
    description: Joi.string().trim().allow('').default(''),
    stock: Joi.number().integer().min(0).required(),
    lowStockThreshold: Joi.number().integer().min(0).default(5),
    image: Joi.string().trim().uri().allow('').default(''),
    category: Joi.string().trim().allow('').default(''),
    isActive: Joi.boolean().default(true)
  }),
  update: Joi.object({
    name: Joi.string().trim().min(2).max(150),
    price: Joi.number().min(0),
    description: Joi.string().trim().allow(''),
    stock: Joi.number().integer().min(0),
    lowStockThreshold: Joi.number().integer().min(0),
    image: Joi.string().trim().uri().allow(''),
    category: Joi.string().trim().allow(''),
    isActive: Joi.boolean()
  }).min(1)
};

const cartSchemas = {
  addItem: Joi.object({
    productId: objectId.required(),
    quantity: Joi.number().integer().min(1).default(1)
  }),
  updateItem: Joi.object({
    quantity: Joi.number().integer().min(1).required()
  })
};

const orderSchemas = {
  create: Joi.object({
    items: Joi.array()
      .items(
        Joi.object({
          productId: objectId.required(),
          quantity: Joi.number().integer().min(1).required()
        })
      )
      .default([]),
    paymentProvider: Joi.string().valid('cash', 'momo', 'vnpay').default('cash'),
    note: Joi.string().trim().allow('', null)
  })
};

const adminSchemas = {
  revenueQuery: Joi.object({
    from: Joi.date().iso(),
    to: Joi.date().iso()
  }),
  inventoryAdjust: Joi.object({
    productId: objectId.required(),
    type: Joi.string().valid('import', 'export').required(),
    quantity: Joi.number().integer().min(1).required(),
    note: Joi.string().trim().allow('', null)
  })
};

const paramSchemas = {
  mongoId: Joi.object({
    id: objectId.required()
  }),
  productId: Joi.object({
    productId: objectId.required()
  })
};

module.exports = {
  adminSchemas,
  authSchemas,
  bookingSchemas,
  serviceSchemas,
  productSchemas,
  cartSchemas,
  orderSchemas,
  paramSchemas
};
