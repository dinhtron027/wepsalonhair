const express = require('express');
const orderController = require('../controllers/orderController');
const authMiddleware = require('../middleware/authMiddleware');
const validateRequest = require('../middleware/validateRequest');
const { orderSchemas, paramSchemas } = require('../utils/validationSchemas');

const router = express.Router();

router.use(authMiddleware);
router.post('/', validateRequest(orderSchemas.create), orderController.createOrder);
router.get('/', orderController.getOrders);
router.get('/:id', validateRequest(paramSchemas.mongoId, 'params'), orderController.getOrderDetail);
router.get('/:id/payment', validateRequest(paramSchemas.mongoId, 'params'), orderController.getOrderPaymentDetail);
router.patch('/:id/report-paid', validateRequest(paramSchemas.mongoId, 'params'), orderController.reportOrderPaid);

module.exports = router;
