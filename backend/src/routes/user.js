const express = require('express');
const { body } = require('express-validator');
const auth = require('../middleware/auth');
const {
  getProfile,
  updateProfile,
  changePassword,
  deleteAccount,
} = require('../controllers/userController');

const router = express.Router();

// All routes are protected
router.use(auth);

// Validation rules
const profileUpdateValidation = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  body('avatar').optional().isURL().withMessage('Avatar must be a valid URL'),
];

const passwordChangeValidation = [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters long'),
];

const accountDeletionValidation = [
  body('password').notEmpty().withMessage('Password is required to delete account'),
];

// @route   GET /api/user/profile
// @desc    Get user profile
// @access  Private
router.get('/profile', getProfile);

// @route   PUT /api/user/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', profileUpdateValidation, updateProfile);

// @route   PUT /api/user/change-password
// @desc    Change user password
// @access  Private
router.put('/change-password', passwordChangeValidation, changePassword);

// @route   DELETE /api/user/account
// @desc    Delete user account
// @access  Private
router.delete('/account', accountDeletionValidation, deleteAccount);

module.exports = router;
