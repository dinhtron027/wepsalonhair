const sendSuccess = (res, { statusCode = 200, message = 'Success', data, meta } = {}) => {
  const payload = {
    success: true,
    message
  };

  if (data !== undefined) {
    payload.data = data;
  }

  const requestId = res.locals?.requestId;
  const responseMeta = {
    ...(meta || {}),
    ...(requestId ? { requestId } : {})
  };

  if (Object.keys(responseMeta).length) {
    payload.meta = responseMeta;
  }

  return res.status(statusCode).json(payload);
};

module.exports = { sendSuccess };
