const mongoose = require('mongoose');
const http = require('http');
const env = require('./config/env');
const { connectDB } = require('./config/db');
const app = require('./app');
const { initSocket } = require('./socket/io');

const startServer = async () => {
  try {
    await connectDB();

    const httpServer = http.createServer(app);
    initSocket(httpServer);

    const server = httpServer.listen(env.PORT, () => {
      console.log(`Salon Duong Chi API listening on port ${env.PORT}`);
    });

    const gracefulShutdown = async (signal) => {
      console.log(`${signal} received. Shutting down gracefully...`);
      server.close(async () => {
        await mongoose.connection.close();
        process.exit(0);
      });
    };

    process.on('SIGINT', gracefulShutdown);
    process.on('SIGTERM', gracefulShutdown);
  } catch (error) {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }
};

startServer();
