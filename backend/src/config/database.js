const { Sequelize } = require('sequelize');
const logger = require('../utils/logger');

const DB_NAME = process.env.DB_NAME || 'notes_app';
const DB_USER = process.env.DB_USER || 'root';
const DB_PASSWORD = process.env.DB_PASSWORD || '';
const DB_HOST = process.env.DB_HOST || 'localhost';

const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASSWORD, {
  host: DB_HOST,
  dialect: 'mysql',
  logging: (msg) => logger.debug(msg),
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  },
  define: {
    timestamps: true,
    underscored: true
  }
});

let _dbInitialized = false;

async function initializeDatabase() {
  if (_dbInitialized) return;
  try {
    // Test the connection
    await sequelize.authenticate();
    logger.info('Connected to MySQL successfully');

    // Import models
    const User = require('../models/User');
    const Note = require('../models/Note');

    // Define associations (Sequelize needs associations defined before sync)
    if (typeof User.associate !== 'function') {
      // define simple associations
      // Use the model attribute name 'userId' as the foreignKey so Sequelize associations resolve correctly
      User.hasMany(Note, { foreignKey: 'userId', as: 'notes' });
      Note.belongsTo(User, { foreignKey: 'userId', as: 'user' });
    }

    // Sync all models
    // NOTE: using { force: true } during initial setup will DROP and recreate tables.
    // This is acceptable in development but will erase existing data. Change back to { alter: true } once stable.
    await sequelize.sync({ force: true });
    logger.info('Database synced successfully (force: true)');
    _dbInitialized = true;
  } catch (error) {
    logger.error({ error: error.message }, 'Database initialization failed');
    process.exit(1);
  }
}

module.exports = {
  sequelize,
  initializeDatabase
};