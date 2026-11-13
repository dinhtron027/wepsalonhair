const express = require('express');
const shippingController = require('../controllers/shippingController');
const authMiddleware = require('../middleware/authMiddleware');
const validateRequest = require('../middleware/validateRequest');
const Joi = require('joi');

const router = express.Router();

const calculateSchema = Joi.object({
  addressId: Joi.string().trim().length(24).hex().required()
});

router.use(authMiddleware);
router.post('/calculate', validateRequest(calculateSchema), shippingController.calculateShipping);

module.exports = router;
