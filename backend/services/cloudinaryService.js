const cloudinary = require('cloudinary').v2;
const env = require('../config/env');
const ApiError = require('../utils/ApiError');

// Cấu hình Cloudinary từ file config env
cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET
});

/**
 * Upload tệp từ buffer lên Cloudinary
 * @param {Buffer} fileBuffer Buffer dữ liệu file tải lên
 * @param {string} folder Thư mục đích trên Cloudinary (ví dụ: 'salon/services')
 * @returns {Promise<{imageUrl: string, publicId: string}>}
 */
const uploadBuffer = (fileBuffer, folder = 'salon') => {
  if (!env.CLOUDINARY_CLOUD_NAME || !env.CLOUDINARY_API_KEY || !env.CLOUDINARY_API_SECRET) {
    throw new ApiError(
      500,
      'Chưa cấu hình tài khoản Cloudinary. Vui lòng kiểm tra các biến môi trường: CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET'
    );
  }

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder
      },
      (error, result) => {
        if (error) {
          return reject(new ApiError(500, `Lỗi upload ảnh lên Cloudinary: ${error.message}`));
        }
        resolve({
          imageUrl: result.secure_url,
          publicId: result.public_id
        });
      }
    );

    stream.end(fileBuffer);
  });
};

module.exports = {
  uploadBuffer
};
