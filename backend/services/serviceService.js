const Booking = require('../models/Booking');
const Service = require('../models/Service');
const ApiError = require('../utils/ApiError');

const listServices = async (filter = {}) => {
  const query = {};
  if (filter.category) {
    query.$or = [
      { categorySlug: filter.category },
      { category: filter.category }
    ];
  }
  return Service.find(query).sort({ categorySlug: 1, name: 1 });
};

const getServiceById = async (serviceId) => {
  const service = await Service.findById(serviceId);

  if (!service) {
    throw new ApiError(404, 'Khong tim thay dich vu');
  }

  return service;
};

const createService = async (payload) => Service.create(payload);

const updateService = async (serviceId, payload) => {
  const service = await Service.findByIdAndUpdate(serviceId, payload, {
    new: true,
    runValidators: true
  });

  if (!service) {
    throw new ApiError(404, 'Khong tim thay dich vu');
  }

  return service;
};

const deleteService = async (serviceId) => {
  const hasActiveBookings = await Booking.exists({
    serviceId,
    status: {
      $in: ['pending', 'confirmed']
    }
  });

  if (hasActiveBookings) {
    throw new ApiError(409, 'Khong the xoa dich vu dang co lich hen');
  }

  const service = await Service.findByIdAndDelete(serviceId);

  if (!service) {
    throw new ApiError(404, 'Khong tim thay dich vu');
  }

  return service;
};

module.exports = {
  listServices,
  getServiceById,
  createService,
  updateService,
  deleteService
};
