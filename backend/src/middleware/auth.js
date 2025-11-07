const jwt = require('jsonwebtoken');
const User = require('../models/User');
const logger = require('../utils/logger');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      logger.warn({ ip: req.ip }, 'Access denied: No token provided');
      return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    // Sequelize: find by PK and exclude password field
    const user = await User.findByPk(decoded.id, { attributes: { exclude: ['password'] } });

    if (!user) {
      logger.warn({ userId: decoded.id }, 'Access denied: User not found');
      return res.status(401).json({ message: 'Access denied. User not found.' });
    }

    if (!user.isActive) {
      logger.warn({ userId: user.id }, 'Access denied: User account is inactive');
      return res.status(401).json({ message: 'Access denied. Account is inactive.' });
    }

    // attach minimal user info
    req.user = { id: user.id, email: user.email };
    logger.info({ userId: user.id, email: user.email }, 'User authenticated successfully');
    next();
  } catch (error) {
    logger.error({ error: error.message }, 'Authentication error');
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token.' });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired.' });
    }
    
    res.status(500).json({ message: 'Server error during authentication.' });
  }
};

module.exports = auth;
