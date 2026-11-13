const multer = require('multer');
const ApiError = require('../utils/ApiError');

// Lưu trữ tạm trong bộ nhớ (memoryStorage) dưới dạng Buffer để đẩy trực tiếp lên Cloudinary
const storage = multer.memoryStorage();

// Bộ lọc định dạng file ảnh
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/heic',
    'image/heif'
  ];
  
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new ApiError(
        400,
        `Định dạng ảnh không hỗ trợ (${file.mimetype}). Chỉ cho phép JPG, PNG, WEBP hoặc HEIC.`
      ),
      false
    );
  }
};

// Cấu hình Multer — tăng limit lên 10MB vì frontend nén trước khi upload
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // Giới hạn kích thước file 10MB
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
          return next(new ApiError(400, 'Kích thước hình ảnh vượt quá giới hạn cho phép (Tối đa 10MB). Hãy chọn ảnh nhỏ hơn hoặc thử chụp ở chế độ bình thường.'));
        }
        return next(new ApiError(400, `Lỗi tải tệp: ${err.message}`));
      }
      return next(err);
    }
    next();
  });
};

module.exports = handleUploadMiddleware;
