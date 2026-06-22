const multer = require('multer');
const ApiError = require('../utils/ApiError');

// Lưu trữ tạm trong bộ nhớ (memoryStorage) dưới dạng Buffer để đẩy trực tiếp lên Cloudinary
const storage = multer.memoryStorage();

// Bộ lọc định dạng file ảnh
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new ApiError(400, 'Chỉ cho phép ảnh định dạng jpg, jpeg, png hoặc webp'), false);
  }
};

// Cấu hình Multer
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // Giới hạn kích thước file 5MB
  },
  fileFilter: fileFilter
});

/**
 * Middleware bọc xử lý lỗi Multer
 */
const handleUploadMiddleware = (fieldName) => (req, res, next) => {
  upload.single(fieldName)(req, res, (err) => {
    if (err) {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return next(new ApiError(400, 'Kích thước hình ảnh vượt quá giới hạn cho phép (Tối đa 5MB)'));
        }
        return next(new ApiError(400, `Lỗi tải tệp: ${err.message}`));
      }
      return next(err);
    }
    next();
  });
};

module.exports = handleUploadMiddleware;
