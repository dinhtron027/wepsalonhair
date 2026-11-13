const addressService = require('../services/addressService');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/response');

const getAddresses = asyncHandler(async (req, res) => {
  const addresses = await addressService.getAddresses(req.user._id);
  return sendSuccess(res, {
    message: 'Lấy danh sách địa chỉ thành công',
    data: addresses
  });
});

const createAddress = asyncHandler(async (req, res) => {
  const address = await addressService.createAddress(req.user._id, req.body);
  return sendSuccess(res, {
    message: 'Thêm địa chỉ thành công',
    data: address
  });
});

const updateAddress = asyncHandler(async (req, res) => {
  const address = await addressService.updateAddress(req.user._id, req.params.id, req.body);
  return sendSuccess(res, {
    message: 'Cập nhật địa chỉ thành công',
    data: address
  });
});

const deleteAddress = asyncHandler(async (req, res) => {
  const result = await addressService.deleteAddress(req.user._id, req.params.id);
  return sendSuccess(res, {
    message: 'Xóa địa chỉ thành công',
    data: result
  });
});

const setDefaultAddress = asyncHandler(async (req, res) => {
  const address = await addressService.setDefaultAddress(req.user._id, req.params.id);
  return sendSuccess(res, {
    message: 'Đặt địa chỉ mặc định thành công',
    data: address
  });
});

module.exports = {
  getAddresses,
  createAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress
};
