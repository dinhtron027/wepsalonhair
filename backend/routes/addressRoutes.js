const express = require('express');
const addressController = require('../controllers/addressController');
const authMiddleware = require('../middleware/authMiddleware');
const validateRequest = require('../middleware/validateRequest');
const { addressSchemas, paramSchemas } = require('../utils/validationSchemas');

const router = express.Router();

router.use(authMiddleware);

router.get('/', addressController.getAddresses);
router.post('/', validateRequest(addressSchemas.create), addressController.createAddress);
router.put('/:id', validateRequest(paramSchemas.mongoId, 'params'), validateRequest(addressSchemas.update), addressController.updateAddress);
router.patch('/:id', validateRequest(paramSchemas.mongoId, 'params'), validateRequest(addressSchemas.update), addressController.updateAddress);
router.delete('/:id', validateRequest(paramSchemas.mongoId, 'params'), addressController.deleteAddress);
router.patch('/:id/default', validateRequest(paramSchemas.mongoId, 'params'), addressController.setDefaultAddress);

module.exports = router;
