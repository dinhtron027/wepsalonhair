const express = require('express');
const serviceController = require('../controllers/serviceController');
const validateRequest = require('../middleware/validateRequest');
const { paramSchemas } = require('../utils/validationSchemas');

const router = express.Router();

router.get('/', serviceController.getServices);
router.get('/:id', validateRequest(paramSchemas.mongoId, 'params'), serviceController.getServiceDetail);

module.exports = router;
