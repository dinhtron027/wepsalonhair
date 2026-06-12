const express = require('express');
const adminController = require('../controllers/adminController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const validateRequest = require('../middleware/validateRequest');
const {
  bookingSchemas,
  adminSchemas,
  paramSchemas,
  productSchemas,
  serviceSchemas
} = require('../utils/validationSchemas');

const router = express.Router();

router.use(authMiddleware, roleMiddleware('admin'));

router.get('/bookings', adminController.getAdminBookings);
router.patch(
  '/bookings/:id',
  validateRequest(paramSchemas.mongoId, 'params'),
  validateRequest(bookingSchemas.update),
  adminController.updateAdminBooking
);

router.get('/services', adminController.getAdminServices);
router.post('/services', validateRequest(serviceSchemas.create), adminController.createAdminService);
router.put(
  '/services/:id',
  validateRequest(paramSchemas.mongoId, 'params'),
  validateRequest(serviceSchemas.update),
  adminController.updateAdminService
);
router.delete(
  '/services/:id',
  validateRequest(paramSchemas.mongoId, 'params'),
  adminController.deleteAdminService
);

router.get('/products', adminController.getAdminProducts);
router.post('/products', validateRequest(productSchemas.create), adminController.createAdminProduct);
router.put(
  '/products/:id',
  validateRequest(paramSchemas.mongoId, 'params'),
  validateRequest(productSchemas.update),
  adminController.updateAdminProduct
);
router.delete(
  '/products/:id',
  validateRequest(paramSchemas.mongoId, 'params'),
  adminController.deleteAdminProduct
);

router.get('/orders', adminController.getAdminOrders);
router.get('/customers', adminController.getAdminCustomers);
router.get('/inventory', adminController.getInventoryOverview);
router.post(
  '/inventory/adjust',
  validateRequest(adminSchemas.inventoryAdjust),
  adminController.adjustInventory
);

router.get(
  '/stats/revenue',
  validateRequest(adminSchemas.revenueQuery, 'query'),
  adminController.getRevenueStatistics
);

module.exports = router;
