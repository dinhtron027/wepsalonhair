const express = require('express');
const bookingController = require('../controllers/bookingController');
const authMiddleware = require('../middleware/authMiddleware');
const optionalAuthMiddleware = require('../middleware/optionalAuthMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const validateRequest = require('../middleware/validateRequest');
const { bookingSchemas, paramSchemas } = require('../utils/validationSchemas');

const router = express.Router();

router.post(
  '/',
  optionalAuthMiddleware,
  validateRequest(bookingSchemas.create),
  bookingController.createBooking
);
router.get(
  '/slots',
  validateRequest(bookingSchemas.slotQuery, 'query'),
  bookingController.getBookedSlots
);
router.get(
  '/',
  authMiddleware,
  roleMiddleware('admin', 'staff'),
  validateRequest(bookingSchemas.query, 'query'),
  bookingController.getBookings
);
router.put(
  '/:id',
  authMiddleware,
  roleMiddleware('admin', 'staff'),
  validateRequest(paramSchemas.mongoId, 'params'),
  validateRequest(bookingSchemas.update),
  bookingController.updateBookingStatus
);
router.delete(
  '/:id',
  authMiddleware,
  validateRequest(paramSchemas.mongoId, 'params'),
  bookingController.cancelBooking
);

module.exports = router;
