const ApiError = require('../utils/ApiError');

const notFoundHandler = (req, res) => {
  res.status(404).json({
    success: false,
    message: `Khong tim thay ${req.originalUrl}`
  });
};

const errorHandler = (error, req, res, next) => {
  if (res.headersSent) {
    return next(error);
  }

  let normalizedError = error;

  if (error?.code === 11000) {
    const duplicatedFields = Object.keys(error.keyPattern || error.keyValue || {});

    if (duplicatedFields.includes('date') && duplicatedFields.includes('time')) {
      normalizedError = new ApiError(
        409,
        'Khung gio nay da co khach dat, vui long chon gio khac'
      );
    } else {
      const duplicatedField = duplicatedFields[0];
      normalizedError = new ApiError(
        409,
        `${duplicatedField || 'Du lieu'} da ton tai trong he thong`
      );
    }
  } else if (error?.name === 'CastError') {
    normalizedError = new ApiError(400, 'ID khong hop le');
  } else if (!(error instanceof ApiError)) {
    normalizedError = new ApiError(500, error.message || 'Internal server error');
  }

  const statusCode = normalizedError.statusCode || 500;
  const payload = {
    success: false,
    message: normalizedError.message || 'Internal server error',
    meta: {
      requestId: res.locals?.requestId || req.id || null
    }
  };

  if (normalizedError.details && process.env.NODE_ENV !== 'production') {
    payload.details = normalizedError.details;
  }

  res.status(statusCode).json(payload);
};

module.exports = {
  errorHandler,
  notFoundHandler
};
