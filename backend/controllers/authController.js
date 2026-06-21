const authService = require('../services/authService');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/response');

const register = asyncHandler(async (req, res) => {
  const result = await authService.registerCustomer(req.body);

  return sendSuccess(res, {
    statusCode: 201,
    message: 'Dang ky tai khoan thanh cong',
    data: result
  });
});

const login = asyncHandler(async (req, res) => {
  const result = await authService.login(req.body);

  return sendSuccess(res, {
    message: 'Dang nhap thanh cong',
    data: result
  });
});

const loginGoogle = asyncHandler(async (req, res) => {
  const { idToken } = req.body;
  if (!idToken) throw new Error('Thieu idToken');
  const result = await authService.loginWithGoogle(idToken);
  return sendSuccess(res, { message: 'Dang nhap Google thanh cong', data: result });
});

const loginFacebook = asyncHandler(async (req, res) => {
  const { accessToken } = req.body;
  if (!accessToken) throw new Error('Thieu accessToken');
  const result = await authService.loginWithFacebook(accessToken);
  return sendSuccess(res, { message: 'Dang nhap Facebook thanh cong', data: result });
});

const getMe = asyncHandler(async (req, res) => {
  return sendSuccess(res, {
    message: 'Lay thong tin nguoi dung thanh cong',
    data: authService.sanitizeUser(req.user)
  });
});

module.exports = {
  register,
  login,
  loginGoogle,
  loginFacebook,
  getMe
};
