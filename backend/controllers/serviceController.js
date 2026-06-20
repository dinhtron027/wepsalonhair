const serviceService = require('../services/serviceService');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/response');

const getServices = asyncHandler(async (req, res) => {
  const services = await serviceService.listServices(req.query);

  return sendSuccess(res, {
    message: 'Lay danh sach dich vu thanh cong',
    data: services
  });
});

const getServiceDetail = asyncHandler(async (req, res) => {
  const service = await serviceService.getServiceById(req.params.id);

  return sendSuccess(res, {
    message: 'Lay chi tiet dich vu thanh cong',
    data: service
  });
});

module.exports = {
  getServices,
  getServiceDetail
};
