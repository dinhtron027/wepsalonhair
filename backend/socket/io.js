const jwt = require('jsonwebtoken');
const { Server } = require('socket.io');
const env = require('../config/env');
const User = require('../models/User');

let ioInstance = null;

const normalizeOrigin = (origin) => origin.trim().replace(/\/$/, '');
const parseAllowedOrigins = () =>
  env.FRONTEND_URL.split(',')
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

const extractToken = (socket) => {
  const authToken = socket.handshake.auth?.token;
  if (typeof authToken === 'string' && authToken.trim()) {
    return authToken.replace(/^Bearer\s+/i, '').trim();
  }

  const headerAuth = socket.handshake.headers?.authorization;
  if (typeof headerAuth === 'string' && /^Bearer\s+/i.test(headerAuth)) {
    return headerAuth.replace(/^Bearer\s+/i, '').trim();
  }

  const queryToken = socket.handshake.query?.token;
  if (typeof queryToken === 'string' && queryToken.trim()) {
    return queryToken.replace(/^Bearer\s+/i, '').trim();
  }

  return '';
};

const socketAuthMiddleware = async (socket, next) => {
  const attachGuestIdentity = () => {
    socket.user = {
      id: null,
      name: 'Guest',
      role: 'guest'
    };
    socket.join('public');
  };

  try {
    const token = extractToken(socket);

    if (!token) {
      attachGuestIdentity();
      return next();
    }

    const decoded = jwt.verify(token, env.JWT_SECRET, {
      algorithms: ['HS256']
    });
    const user = await User.findById(decoded.sub).select('_id name role');

    if (!user) {
      attachGuestIdentity();
      return next();
    }

    socket.user = {
      id: user._id.toString(),
      name: user.name,
      role: user.role
    };

    socket.join('authenticated');
    socket.join(`role:${user.role}`);

    if (user.role === 'admin') {
      socket.join('admins');
    }

    return next();
  } catch (error) {
    attachGuestIdentity();
    return next();
  }
};

const initSocket = (httpServer) => {
  if (ioInstance) {
    return ioInstance;
  }

  ioInstance = new Server(httpServer, {
    cors: {
      origin: (origin, callback) => {
        const allowedOrigins = parseAllowedOrigins();

        if (!origin) {
          callback(null, true);
          return;
        }

        const normalizedOrigin = normalizeOrigin(origin);
        if (allowedOrigins.includes(normalizedOrigin) || isLoopbackOrigin(normalizedOrigin)) {
          callback(null, true);
          return;
        }

        callback(new Error(`Socket CORS blocked for origin: ${origin}`));
      },
      credentials: true
    }
  });

  ioInstance.use(socketAuthMiddleware);

  ioInstance.on('connection', (socket) => {
    socket.emit('socket_connected', {
      connected: true,
      role: socket.user?.role || 'customer',
      message: 'Ket noi realtime thanh cong'
    });

    socket.on('admin:broadcast', (payload = {}) => {
      if (socket.user?.role !== 'admin') {
        socket.emit('socket_error', {
          message: 'Ban khong co quyen phat su kien quan tri'
        });
        return;
      }

      const eventName = typeof payload.event === 'string' ? payload.event.trim() : '';
      if (!eventName.startsWith('admin_')) {
        socket.emit('socket_error', {
          message: 'Chi duoc phat su kien admin_*'
        });
        return;
      }

      ioInstance.emit(eventName, payload.data ?? null);
    });
  });

  return ioInstance;
};

const getIO = () => {
  if (!ioInstance) {
    throw new Error('Socket.io chua duoc khoi tao');
  }

  return ioInstance;
};

const emitRealtimeEvent = (eventName, payload, options = {}) => {
  if (!ioInstance) {
    return;
  }

  const io = getIO();

  if (options.room) {
    io.to(options.room).emit(eventName, payload);
    return;
  }

  io.emit(eventName, payload);
};

const broadcastSystemNotification = (message, type = 'info', options = {}) => {
  if (!ioInstance) {
    return;
  }

  emitRealtimeEvent(
    'system_notification',
    {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      type,
      message,
      createdAt: new Date().toISOString()
    },
    options
  );
};

module.exports = {
  initSocket,
  getIO,
  emitRealtimeEvent,
  broadcastSystemNotification
};
