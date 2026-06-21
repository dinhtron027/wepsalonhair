const express = require('express');
const authController = require('../controllers/authController');
const validateRequest = require('../middleware/validateRequest');
const authMiddleware = require('../middleware/authMiddleware');
const { authSchemas } = require('../utils/validationSchemas');

const router = express.Router();

router.post('/register', validateRequest(authSchemas.register), authController.register);
router.post('/login', validateRequest(authSchemas.login), authController.login);
router.post('/google', authController.loginGoogle);
router.post('/facebook', authController.loginFacebook);
router.get('/me', authMiddleware, authController.getMe);

module.exports = router;
