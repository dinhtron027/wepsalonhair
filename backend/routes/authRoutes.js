const express = require('express');
const authController = require('../controllers/authController');
const validateRequest = require('../middleware/validateRequest');
const { authSchemas } = require('../utils/validationSchemas');

const router = express.Router();

router.post('/register', validateRequest(authSchemas.register), authController.register);
router.post('/login', validateRequest(authSchemas.login), authController.login);
router.post('/google', authController.loginGoogle);
router.post('/facebook', authController.loginFacebook);

module.exports = router;
