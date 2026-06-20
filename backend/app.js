const cors = require('cors');
const compression = require('compression');
const express = require('express');
const helmet = require('helmet');
const env = require('./config/env');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');
const { apiRateLimiter, authRateLimiter } = require('./middleware/rateLimiters');
const requestLogger = require('./middleware/requestLogger');
const adminRoutes = require('./routes/adminRoutes');
const authRoutes = require('./routes/authRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const cartRoutes = require('./routes/cartRoutes');
const orderRoutes = require('./routes/orderRoutes');
const productRoutes = require('./routes/productRoutes');
const serviceRoutes = require('./routes/serviceRoutes');

const app = express();

if (env.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
}

const normalizeOrigin = (origin) => origin.trim().replace(/\/$/, '');
const allowedOrigins = env.FRONTEND_URL.split(',')
  .map((origin) => normalizeOrigin(origin))
  .filter(Boolean);

const isLoopbackOrigin = (origin) => {
  try {
    const parsed = new URL(origin);
    return ['localhost', '127.0.0.1', '::1', '[::1]'].includes(parsed.hostname);
  } catch {
    return false;
  }
};

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) {
        callback(null, true);
        return;
      }

      const normalizedOrigin = normalizeOrigin(origin);

      if (allowedOrigins.includes(normalizedOrigin) || isLoopbackOrigin(normalizedOrigin)) {
        callback(null, true);
        return;
      }

      callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true
  })
);
app.use(helmet());
app.use(compression());
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(requestLogger);
app.use('/api', apiRateLimiter);

app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Salon Duong Chi API is running'
  });
});

app.use('/api/auth', authRateLimiter, authRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/products', productRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
