const Product = require('../models/Product');
const ApiError = require('../utils/ApiError');

const listProducts = async ({ includeInactive = false } = {}) => {
  const query = includeInactive ? {} : { isActive: true };
  return Product.find(query).sort({ createdAt: -1 });
};

const getProductById = async (productId, { includeInactive = false } = {}) => {
  const query = includeInactive ? { _id: productId } : { _id: productId, isActive: true };
  const product = await Product.findOne(query);

  if (!product) {
    throw new ApiError(404, 'Khong tim thay san pham');
  }

  return product;
};

const createProduct = async (payload) => Product.create(payload);

const updateProduct = async (productId, payload) => {
  const product = await Product.findByIdAndUpdate(productId, payload, {
    new: true,
    runValidators: true
  });

  if (!product) {
    throw new ApiError(404, 'Khong tim thay san pham');
  }

  return product;
};

const deleteProduct = async (productId) => {
  const product = await Product.findByIdAndDelete(productId);

  if (!product) {
    throw new ApiError(404, 'Khong tim thay san pham');
  }

  return product;
};

module.exports = {
  listProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
};
