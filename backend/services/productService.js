const Product = require('../models/Product');
const ApiError = require('../utils/ApiError');

/**
 * Lấy danh sách sản phẩm công khai (chỉ isActive = true).
 * Hỗ trợ lọc theo danh mục và phân trang.
 */
const listProducts = async ({
  includeInactive = false,
  category = '',
  page = 1,
  limit = 0 // 0 = không giới hạn
} = {}) => {
  const query = includeInactive ? {} : { isActive: true };
  if (category) {
    query.category = category;
  }

  const baseQuery = Product.find(query).sort({ createdAt: -1 });

  if (limit > 0) {
    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      baseQuery.skip(skip).limit(limit),
      Product.countDocuments(query)
    ]);
    return {
      items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  return baseQuery;
};

const getProductById = async (productId, { includeInactive = false } = {}) => {
  const query = includeInactive ? { _id: productId } : { _id: productId, isActive: true };
  const product = await Product.findOne(query);

  if (!product) {
    throw new ApiError(404, 'Không tìm thấy sản phẩm');
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
    throw new ApiError(404, 'Không tìm thấy sản phẩm');
  }

  return product;
};

/**
 * Soft delete: đặt isActive = false thay vì xóa khỏi DB.
 */
const deleteProduct = async (productId) => {
  const product = await Product.findByIdAndUpdate(
    productId,
    { isActive: false },
    { new: true }
  );

  if (!product) {
    throw new ApiError(404, 'Không tìm thấy sản phẩm');
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
