const express = require('express');
const productController = require('../controllers/productController');
const validateRequest = require('../middleware/validateRequest');
const { paramSchemas } = require('../utils/validationSchemas');

const router = express.Router();

router.get('/', productController.getProducts);
router.get('/:id', validateRequest(paramSchemas.mongoId, 'params'), productController.getProductDetail);

module.exports = router;
