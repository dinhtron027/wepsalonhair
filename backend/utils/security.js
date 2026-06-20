const jwt = require('jsonwebtoken');
const env = require('../config/env');

const generateToken = (user) =>
  jwt.sign(
    {
      sub: user._id.toString(),
      role: user.role
    },
    env.JWT_SECRET,
    {
      algorithm: 'HS256',
      expiresIn: env.JWT_EXPIRES_IN
    }
  );

module.exports = {
  generateToken
};
