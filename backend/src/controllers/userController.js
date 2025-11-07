const { validationResult } = require('express-validator');
const User = require('../models/User');
const logger = require('../utils/logger');

// @desc    Get user profile
// @route   GET /api/user/profile
// @access  Private
const getProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);

    logger.info({ userId: user.id }, 'User profile retrieved');

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          avatar: user.avatar,
          lastLogin: user.lastLogin,
          createdAt: user.createdAt,
          isActive: user.isActive,
        },
      },
    });
  } catch (error) {
    logger.error({ error: error.message, stack: error.stack }, 'Get profile error');
    res.status(500).json({
      success: false,
      message: 'Server error retrieving profile',
    });
  }
};

// @desc    Update user profile
// @route   PUT /api/user/profile
// @access  Private
const updateProfile = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      logger.warn({ errors: errors.array() }, 'Validation errors in profile update');
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array(),
      });
    }

    const { name, avatar } = req.body;
    const updateData = {};

    if (name) updateData.name = name;
    if (avatar) updateData.avatar = avatar;

    const user = await User.findByPk(req.user.id);
    await user.update(updateData, { hooks: true });

    logger.info({ userId: user.id }, 'User profile updated successfully');

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          avatar: user.avatar,
          lastLogin: user.lastLogin,
          createdAt: user.createdAt,
        },
      },
    });
  } catch (error) {
    logger.error({ error: error.message, stack: error.stack }, 'Update profile error');
    res.status(500).json({
      success: false,
      message: 'Server error updating profile',
    });
  }
};

// @desc    Change password
// @route   PUT /api/user/change-password
// @access  Private
const changePassword = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      logger.warn({ errors: errors.array() }, 'Validation errors in password change');
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array(),
      });
    }

    const { currentPassword, newPassword } = req.body;

    // Get user with password
    const user = await User.findByPk(req.user.id);

    // Check current password
    const isCurrentPasswordValid = await user.matchPassword(currentPassword);
    if (!isCurrentPasswordValid) {
      logger.warn({ userId: user.id }, 'Invalid current password provided');
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect',
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    logger.info({ userId: user.id }, 'Password changed successfully');

    res.json({
      success: true,
      message: 'Password changed successfully',
    });
  } catch (error) {
    logger.error({ error: error.message, stack: error.stack }, 'Change password error');
    res.status(500).json({
      success: false,
      message: 'Server error changing password',
    });
  }
};

// @desc    Delete user account
// @route   DELETE /api/user/account
// @access  Private
const deleteAccount = async (req, res) => {
  try {
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({
        success: false,
        message: 'Password is required to delete account',
      });
    }

    // Get user with password
    const user = await User.findByPk(req.user.id);

    // Verify password
    const isPasswordValid = await user.matchPassword(password);
    if (!isPasswordValid) {
      logger.warn({ userId: user.id }, 'Invalid password provided for account deletion');
      return res.status(400).json({
        success: false,
        message: 'Password is incorrect',
      });
    }

    // Deactivate account instead of deleting
    user.isActive = false;
    await user.save();

    logger.info({ userId: user.id }, 'User account deactivated');

    res.json({
      success: true,
      message: 'Account deleted successfully',
    });
  } catch (error) {
    logger.error({ error: error.message, stack: error.stack }, 'Delete account error');
    res.status(500).json({
      success: false,
      message: 'Server error deleting account',
    });
  }
};

module.exports = {
  getProfile,
  updateProfile,
  changePassword,
  deleteAccount,
};
