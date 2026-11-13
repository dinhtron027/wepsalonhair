/**
 * asyncHandler.js: Hàm bọc (Wrapper) để xử lý lỗi tự động cho các hàm async trong Express.
 *
 * VẤN ĐỀ: Trong Express, nếu một hàm async ném lỗi (throw Error hoặc Promise.reject),
 * lỗi đó KHÔNG tự động được chuyển đến Express error middleware (errorHandler).
 * Lập trình viên phải viết try/catch thủ công trong mỗi handler:
 *
 *   router.get('/bookings', async (req, res, next) => {
 *     try {
 *       const data = await someAsyncFunction();
 *       res.json(data);
 *     } catch (err) {
 *       next(err); // Phải gọi next(err) để Express biết có lỗi
 *     }
 *   });
 *
 * GIẢI PHÁP: `asyncHandler` tự động bắt lỗi và chuyển đến `next(err)`:
 *
 *   router.get('/bookings', asyncHandler(async (req, res) => {
 *     const data = await someAsyncFunction(); // Lỗi ở đây sẽ tự động được xử lý
 *     res.json(data);
 *   }));
 *
 * @param {Function} handler - Hàm async Express handler (nhận req, res, next).
 * @returns {Function} Hàm Express handler mới có khả năng bắt lỗi tự động.
 *
 * Cơ chế hoạt động:
 * - `Promise.resolve(handler(req, res, next))`: Đảm bảo handler luôn được bọc trong Promise,
 *   kể cả khi handler không phải async (hàm thông thường).
 * - `.catch(next)`: Nếu Promise bị reject (có lỗi), chuyển lỗi đến Express error middleware
 *   thông qua `next(error)` — tương đương `catch(err) { next(err); }`.
 */
const asyncHandler = (handler) => (req, res, next) =>
  Promise.resolve(handler(req, res, next)).catch(next);

module.exports = asyncHandler;
