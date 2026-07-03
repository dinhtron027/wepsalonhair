const express = require('express');
const cartController = require('../controllers/cartController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const validateRequest = require('../middleware/validateRequest');
const { cartSchemas, paramSchemas } = require('../utils/validationSchemas');

const router = express.Router();

router.use(authMiddleware, roleMiddleware('customer', 'admin'));

router.get('/', cartController.getCart);
router.post('/items', validateRequest(cartSchemas.addItem), cartController.addCartItem);
router.put(
  '/items/:productId',
  validateRequest(paramSchemas.productId, 'params'),
  validateRequest(cartSchemas.updateItem),
  cartController.updateCartItem
);
router.delete(
  '/items/:productId',
  validateRequest(paramSchemas.productId, 'params'),
  cartController.removeCartItem
);

module.exports = router;
