const app = require('./app');
const logger = require('./utils/logger');
const { initializeDatabase, sequelize } = require('./config/database');

const PORT = process.env.PORT || 5000;

// Initialize database and start server
(async () => {
  try {
    await initializeDatabase();

    const server = app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
    });

    // Graceful shutdown handlers
    const shutdown = async () => {
      logger.info('Shutdown signal received, closing server and database connections');
      try {
        await server.close();
        await sequelize.close();
        logger.info('Server and database connections closed');
        process.exit(0);
      } catch (err) {
        logger.error({ error: err.message, stack: err.stack }, 'Error during shutdown');
        process.exit(1);
      }
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);

    // Global handlers
    process.on('unhandledRejection', (err) => {
      logger.error({ error: err.message, stack: err.stack }, 'Unhandled Promise Rejection');
      process.exit(1);
    });

    process.on('uncaughtException', (err) => {
      logger.error({ error: err.message, stack: err.stack }, 'Uncaught Exception');
      process.exit(1);
    });
  } catch (error) {
    logger.error({ error: error.message, stack: error.stack }, 'Server initialization failed');
    process.exit(1);
  }
})();

module.exports = app;
