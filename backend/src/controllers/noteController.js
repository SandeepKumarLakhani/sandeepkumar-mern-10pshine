const { validationResult } = require('express-validator');
const Note = require('../models/Note');
const logger = require('../utils/logger');

// @desc    Get all notes for user
// @route   GET /api/notes
// @access  Private
const getNotes = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, tags, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
    
    const query = {
      user: req.user.id,
      isDeleted: false
    };

    // Add search functionality
    if (search) {
      query.$text = { $search: search };
    }

    // Add tag filter
    if (tags) {
      query.tags = { $in: tags.split(',') };
    }

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const notes = await Note.find(query)
      .sort(sortOptions)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('user', 'name email');

    const total = await Note.countDocuments(query);

    logger.info({ 
      userId: req.user.id, 
      totalNotes: total,
      page,
      limit 
    }, 'Notes retrieved successfully');

    res.json({
      success: true,
      data: {
        notes,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalNotes: total,
          hasNext: page < Math.ceil(total / limit),
          hasPrev: page > 1
        }
      }
    });
  } catch (error) {
    logger.error({ error: error.message, stack: error.stack }, 'Get notes error');
    res.status(500).json({
      success: false,
      message: 'Server error retrieving notes'
    });
  }
};

// @desc    Get single note
// @route   GET /api/notes/:id
// @access  Private
const getNote = async (req, res) => {
  try {
    const note = await Note.findOne({
      _id: req.params.id,
      user: req.user.id,
      isDeleted: false
    }).populate('user', 'name email');

    if (!note) {
      logger.warn({ noteId: req.params.id, userId: req.user.id }, 'Note not found');
      return res.status(404).json({
        success: false,
        message: 'Note not found'
      });
    }

    logger.info({ noteId: note._id, userId: req.user.id }, 'Note retrieved successfully');

    res.json({
      success: true,
      data: { note }
    });
  } catch (error) {
    logger.error({ error: error.message, stack: error.stack }, 'Get note error');
    res.status(500).json({
      success: false,
      message: 'Server error retrieving note'
    });
  }
};

// @desc    Create new note
// @route   POST /api/notes
// @access  Private
const createNote = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      logger.warn({ errors: errors.array() }, 'Validation errors in note creation');
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const noteData = {
      ...req.body,
      user: req.user.id
    };

    const note = await Note.create(noteData);

    logger.info({ noteId: note._id, userId: req.user.id }, 'Note created successfully');

    res.status(201).json({
      success: true,
      message: 'Note created successfully',
      data: { note }
    });
  } catch (error) {
    logger.error({ error: error.message, stack: error.stack }, 'Create note error');
    res.status(500).json({
      success: false,
      message: 'Server error creating note'
    });
  }
};

// @desc    Update note
// @route   PUT /api/notes/:id
// @access  Private
const updateNote = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      logger.warn({ errors: errors.array() }, 'Validation errors in note update');
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    let note = await Note.findOne({
      _id: req.params.id,
      user: req.user.id,
      isDeleted: false
    });

    if (!note) {
      logger.warn({ noteId: req.params.id, userId: req.user.id }, 'Note not found for update');
      return res.status(404).json({
        success: false,
        message: 'Note not found'
      });
    }

    note = await Note.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    logger.info({ noteId: note._id, userId: req.user.id }, 'Note updated successfully');

    res.json({
      success: true,
      message: 'Note updated successfully',
      data: { note }
    });
  } catch (error) {
    logger.error({ error: error.message, stack: error.stack }, 'Update note error');
    res.status(500).json({
      success: false,
      message: 'Server error updating note'
    });
  }
};

// @desc    Delete note (soft delete)
// @route   DELETE /api/notes/:id
// @access  Private
const deleteNote = async (req, res) => {
  try {
    const note = await Note.findOne({
      _id: req.params.id,
      user: req.user.id,
      isDeleted: false
    });

    if (!note) {
      logger.warn({ noteId: req.params.id, userId: req.user.id }, 'Note not found for deletion');
      return res.status(404).json({
        success: false,
        message: 'Note not found'
      });
    }

    note.isDeleted = true;
    await note.save();

    logger.info({ noteId: note._id, userId: req.user.id }, 'Note deleted successfully');

    res.json({
      success: true,
      message: 'Note deleted successfully'
    });
  } catch (error) {
    logger.error({ error: error.message, stack: error.stack }, 'Delete note error');
    res.status(500).json({
      success: false,
      message: 'Server error deleting note'
    });
  }
};

// @desc    Toggle note pin status
// @route   PATCH /api/notes/:id/pin
// @access  Private
const togglePin = async (req, res) => {
  try {
    const note = await Note.findOne({
      _id: req.params.id,
      user: req.user.id,
      isDeleted: false
    });

    if (!note) {
      logger.warn({ noteId: req.params.id, userId: req.user.id }, 'Note not found for pin toggle');
      return res.status(404).json({
        success: false,
        message: 'Note not found'
      });
    }

    note.isPinned = !note.isPinned;
    await note.save();

    logger.info({ 
      noteId: note._id, 
      userId: req.user.id, 
      isPinned: note.isPinned 
    }, 'Note pin status toggled');

    res.json({
      success: true,
      message: `Note ${note.isPinned ? 'pinned' : 'unpinned'} successfully`,
      data: { note }
    });
  } catch (error) {
    logger.error({ error: error.message, stack: error.stack }, 'Toggle pin error');
    res.status(500).json({
      success: false,
      message: 'Server error toggling pin status'
    });
  }
};

module.exports = {
  getNotes,
  getNote,
  createNote,
  updateNote,
  deleteNote,
  togglePin
};
