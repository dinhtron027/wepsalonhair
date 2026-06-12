const productService = require('../services/productService');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/response');

const getProducts = asyncHandler(async (req, res) => {
  const products = await productService.listProducts();

  return sendSuccess(res, {
    message: 'Lay danh sach san pham thanh cong',
    data: products
  });
});

const getProductDetail = asyncHandler(async (req, res) => {
  const product = await productService.getProductById(req.params.id);

  return sendSuccess(res, {
    message: 'Lay chi tiet san pham thanh cong',
    data: product
  });
});

module.exports = {
  getProducts,
  getProductDetail
};
