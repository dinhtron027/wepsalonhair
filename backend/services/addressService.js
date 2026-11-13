const Address = require('../models/Address');
const ApiError = require('../utils/ApiError');
const shippingService = require('./shippingService');

const getAddresses = async (userId) => {
  return Address.find({ userId }).sort({ isDefault: -1, createdAt: -1 });
};

const createAddress = async (userId, payload) => {
  if (payload.isDefault) {
    // Set all other user addresses to not default
    await Address.updateMany({ userId }, { isDefault: false });
  } else {
    // If this is the first address, make it default
    const count = await Address.countDocuments({ userId });
    if (count === 0) {
      payload.isDefault = true;
    }
  }

  const geocoded = await shippingService.geocodeAddress(payload);
  const address = await Address.create({
    userId,
    ...payload,
    fullAddress: geocoded.fullAddress,
    lat: geocoded.lat,
    lng: geocoded.lng
  });

  return address;
};

const updateAddress = async (userId, addressId, payload) => {
  const address = await Address.findOne({ _id: addressId, userId });
  if (!address) {
    throw new ApiError(404, 'Không tìm thấy địa chỉ');
  }

  if (payload.isDefault && !address.isDefault) {
    await Address.updateMany({ userId }, { isDefault: false });
  }

  const isChanged =
    payload.province !== undefined ||
    payload.district !== undefined ||
    payload.ward !== undefined ||
    payload.street !== undefined;

  if (isChanged) {
    const tempAddress = {
      province: payload.province !== undefined ? payload.province : address.province,
      district: payload.district !== undefined ? payload.district : address.district,
      ward: payload.ward !== undefined ? payload.ward : address.ward,
      street: payload.street !== undefined ? payload.street : address.street
    };
    const geocoded = await shippingService.geocodeAddress(tempAddress);
    payload.fullAddress = geocoded.fullAddress;
    payload.lat = geocoded.lat;
    payload.lng = geocoded.lng;
  }

  Object.assign(address, payload);
  await address.save();
  return address;
};

const deleteAddress = async (userId, addressId) => {
  const address = await Address.findOne({ _id: addressId, userId });
  if (!address) {
    throw new ApiError(404, 'Không tìm thấy địa chỉ');
  }

  await Address.deleteOne({ _id: addressId });

  // If we deleted the default address, set another one as default
  if (address.isDefault) {
    const nextAddress = await Address.findOne({ userId }).sort({ createdAt: -1 });
    if (nextAddress) {
      nextAddress.isDefault = true;
      await nextAddress.save();
    }
  }

  return { success: true };
};

const setDefaultAddress = async (userId, addressId) => {
  const address = await Address.findOne({ _id: addressId, userId });
  if (!address) {
    throw new ApiError(404, 'Không tìm thấy địa chỉ');
  }

  await Address.updateMany({ userId }, { isDefault: false });
  address.isDefault = true;
  await address.save();

  return address;
};

module.exports = {
  getAddresses,
  createAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress
};
