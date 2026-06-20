const { randomUUID } = require('crypto');

const requestLogger = (req, res, next) => {
  const startedAt = Date.now();
  req.id = req.headers['x-request-id'] || randomUUID();
  res.locals.requestId = req.id;
  res.setHeader('X-Request-Id', req.id);

  res.on('finish', () => {
    const duration = Date.now() - startedAt;
    const logPayload = {
      requestId: req.id,
      method: req.method,
      path: req.originalUrl,
      statusCode: res.statusCode,
      durationMs: duration,
      ip: req.ip
    };

    if (process.env.NODE_ENV === 'production') {
      console.log(JSON.stringify(logPayload));
      return;
    }

    console.log(
      `[${new Date().toISOString()}] ${logPayload.requestId} ${req.method} ${req.originalUrl} ${res.statusCode} ${duration}ms`
    );
  });

  next();
};

module.exports = requestLogger;
