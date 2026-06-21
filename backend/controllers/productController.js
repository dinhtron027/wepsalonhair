const productService = require('../services/productService');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/response');

const getProducts = asyncHandler(async (req, res) => {
  const { category = '', page, limit } = req.query;

  const pageNum = page ? parseInt(page, 10) : 1;
  const limitNum = limit ? parseInt(limit, 10) : 0;

  const result = await productService.listProducts({
    includeInactive: false,
    category,
    page: pageNum,
    limit: limitNum
  });

  // Nếu có phân trang, result là { items, pagination }
  const isPaginated = result && !Array.isArray(result);

  return sendSuccess(res, {
    message: 'Lấy danh sách sản phẩm thành công',
    data: isPaginated ? result.items : result,
    ...(isPaginated && { pagination: result.pagination })
  });
});

const getProductDetail = asyncHandler(async (req, res) => {
  const product = await productService.getProductById(req.params.id);

  return sendSuccess(res, {
    message: 'Lấy chi tiết sản phẩm thành công',
    data: product
  });
});

module.exports = {
  getProducts,
  getProductDetail
};
