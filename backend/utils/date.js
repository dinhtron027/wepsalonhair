const ApiError = require('./ApiError');

const normalizeDateOnly = (input) => {
  if (!input) {
    throw new ApiError(400, 'Ngay dat lich khong hop le');
  }

  let datePart = '';

  if (input instanceof Date && !Number.isNaN(input.getTime())) {
    datePart = input.toISOString().slice(0, 10);
  } else if (typeof input === 'string') {
    datePart = input.trim().slice(0, 10);
  }

  const normalized = new Date(`${datePart}T00:00:00.000Z`);

  if (Number.isNaN(normalized.getTime())) {
    throw new ApiError(400, 'Ngay dat lich khong hop le');
  }

  return normalized;
};

const formatDateForDisplay = (date, time) => {
  const normalizedDate = date instanceof Date ? date : new Date(date);

  return `${normalizedDate.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    timeZone: 'UTC'
  })}${time ? ` ${time}` : ''}`;
};

module.exports = {
  normalizeDateOnly,
  formatDateForDisplay
};
