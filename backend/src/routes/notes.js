const express = require('express');
const { body, param } = require('express-validator');
const auth = require('../middleware/auth');
const {
  getNotes,
  getNote,
  createNote,
  updateNote,
  deleteNote,
  togglePin,
} = require('../controllers/noteController');

const router = express.Router();

// All routes are protected
router.use(auth);

// Validation rules
const noteValidation = [
  body('title')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Title must be between 1 and 100 characters'),
  body('content')
    .trim()
    .isLength({ min: 1, max: 10000 })
    .withMessage('Content must be between 1 and 10000 characters'),
  body('tags').optional().isArray().withMessage('Tags must be an array'),
  body('tags.*')
    .optional()
    .trim()
    .isLength({ min: 1, max: 20 })
    .withMessage('Each tag must be between 1 and 20 characters'),
  body('color')
    .optional()
    .matches(/^#[0-9A-F]{6}$/i)
    .withMessage('Color must be a valid hex color'),
  body('isPinned').optional().isBoolean().withMessage('isPinned must be a boolean'),
];

const idParamValidation = [param('id').isInt({ min: 1 }).withMessage('Invalid note ID')];

// @route   GET /api/notes
// @desc    Get all notes for user
// @access  Private
router.get('/', getNotes);

// @route   GET /api/notes/:id
// @desc    Get single note
// @access  Private
router.get('/:id', idParamValidation, getNote);

// @route   POST /api/notes
// @desc    Create new note
// @access  Private
router.post('/', noteValidation, createNote);

// @route   PUT /api/notes/:id
// @desc    Update note
// @access  Private
router.put('/:id', [...idParamValidation, ...noteValidation], updateNote);

// @route   DELETE /api/notes/:id
// @desc    Delete note
// @access  Private
router.delete('/:id', idParamValidation, deleteNote);

// @route   PATCH /api/notes/:id/pin
// @desc    Toggle note pin status
// @access  Private
router.patch('/:id/pin', idParamValidation, togglePin);

module.exports = router;
