const { validationResult } = require('express-validator');
const { Op } = require('sequelize');
const { sequelize } = require('../config/database');
const Note = require('../models/Note');
const User = require('../models/User');
const logger = require('../utils/logger');

// @desc    Get all notes for user
// @route   GET /api/notes
// @access  Private
const getNotes = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      tags,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = req.query;

    const where = { userId: req.user.id, isDeleted: false };

    // Simple search on title/content
    if (search) {
      where[Op.or] = [
        { title: { [Op.like]: `%${search}%` } },
        { content: { [Op.like]: `%${search}%` } },
      ];
    }

    // Tags filter (use JSON_CONTAINS for MySQL JSON column)
    if (tags) {
      const tagList = tags.split(',').map(t => t.trim()).filter(Boolean);
      if (tagList.length) {
        // build array of JSON_CONTAINS literals for each tag and use OR
        const tagConditions = tagList.map(t =>
          sequelize.where(
            sequelize.fn('JSON_CONTAINS', sequelize.col('tags'), JSON.stringify(t)),
            1
          )
        );
        where[Op.or] = tagConditions;
      }
    }

    const order = [[sortBy, sortOrder.toUpperCase()]];

    const { rows: notes, count: total } = await Note.findAndCountAll({
      where,
      include: [{ model: User, as: 'user', attributes: ['id', 'name', 'email'] }],
      order,
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit),
    });

    logger.info(
      { userId: req.user.id, totalNotes: total, page, limit },
      'Notes retrieved successfully'
    );

    // Map notes to plain objects and add `_id` for frontend compatibility (Mongo-like field)
    const notesPayload = notes.map(n => {
      const obj = n.toJSON();
      obj._id = obj.id;
      return obj;
    });

    res.json({
      success: true,
      data: {
        notes: notesPayload,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalNotes: total,
          hasNext: page < Math.ceil(total / limit),
          hasPrev: page > 1,
        },
      },
    });
  } catch (error) {
    logger.error({ error: error.message, stack: error.stack }, 'Get notes error');
    res.status(500).json({ success: false, message: 'Server error retrieving notes' });
  }
};

// @desc    Get single note
// @route   GET /api/notes/:id
// @access  Private
const getNote = async (req, res) => {
  try {
    const note = await Note.findOne({
      where: { id: req.params.id, userId: req.user.id, isDeleted: false },
      include: [{ model: User, as: 'user', attributes: ['id', 'name', 'email'] }],
    });

    if (!note) {
      logger.warn({ noteId: req.params.id, userId: req.user.id }, 'Note not found');
      return res.status(404).json({ success: false, message: 'Note not found' });
    }

    logger.info({ noteId: note.id, userId: req.user.id }, 'Note retrieved successfully');

    const notePayload = note.toJSON();
    notePayload._id = notePayload.id;
    res.json({ success: true, data: { note: notePayload } });
  } catch (error) {
    logger.error({ error: error.message, stack: error.stack }, 'Get note error');
    res.status(500).json({ success: false, message: 'Server error retrieving note' });
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
        errors: errors.array(),
      });
    }

    const noteData = { ...req.body, userId: req.user.id };
    let note = await Note.create(noteData);

    logger.info({ noteId: note.id, userId: req.user.id }, 'Note created successfully');

    const notePayload = note.toJSON();
    notePayload._id = notePayload.id;

    res.status(201).json({ success: true, message: 'Note created successfully', data: { note: notePayload } });
  } catch (error) {
    logger.error({ error: error.message, stack: error.stack }, 'Create note error');
    res.status(500).json({
      success: false,
      message: 'Server error creating note',
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
        errors: errors.array(),
      });
    }

    let note = await Note.findOne({
      where: { id: req.params.id, userId: req.user.id, isDeleted: false },
    });

    if (!note) {
      logger.warn({ noteId: req.params.id, userId: req.user.id }, 'Note not found for update');
      return res.status(404).json({ success: false, message: 'Note not found' });
    }

    await note.update(req.body);

    logger.info({ noteId: note.id, userId: req.user.id }, 'Note updated successfully');

    // Refresh and return updated note payload with `_id`
    note = await Note.findByPk(note.id, {
      include: [{ model: User, as: 'user', attributes: ['id', 'name', 'email'] }],
    });
    const updatedPayload = note.toJSON();
    updatedPayload._id = updatedPayload.id;
    res.json({ success: true, message: 'Note updated successfully', data: { note: updatedPayload } });
  } catch (error) {
    logger.error({ error: error.message, stack: error.stack }, 'Update note error');
    res.status(500).json({
      success: false,
      message: 'Server error updating note',
    });
  }
};

// @desc    Delete note (soft delete)
// @route   DELETE /api/notes/:id
// @access  Private
const deleteNote = async (req, res) => {
  try {
    const note = await Note.findOne({
      where: { id: req.params.id, userId: req.user.id, isDeleted: false },
    });

    if (!note) {
      logger.warn({ noteId: req.params.id, userId: req.user.id }, 'Note not found for deletion');
      return res.status(404).json({ success: false, message: 'Note not found' });
    }

    await note.update({ isDeleted: true });

    logger.info({ noteId: note.id, userId: req.user.id }, 'Note deleted successfully');

    res.json({ success: true, message: 'Note deleted successfully' });
  } catch (error) {
    logger.error({ error: error.message, stack: error.stack }, 'Delete note error');
    res.status(500).json({
      success: false,
      message: 'Server error deleting note',
    });
  }
};

// @desc    Toggle note pin status
// @route   PATCH /api/notes/:id/pin
// @access  Private
const togglePin = async (req, res) => {
  try {
    const note = await Note.findOne({
      where: { id: req.params.id, userId: req.user.id, isDeleted: false },
    });

    if (!note) {
      logger.warn({ noteId: req.params.id, userId: req.user.id }, 'Note not found for pin toggle');
      return res.status(404).json({ success: false, message: 'Note not found' });
    }

    await note.update({ isPinned: !note.isPinned });

    logger.info(
      { noteId: note.id, userId: req.user.id, isPinned: note.isPinned },
      'Note pin status toggled'
    );

    const updated = await Note.findByPk(note.id, {
      include: [{ model: User, as: 'user', attributes: ['id', 'name', 'email'] }],
    });
    const updatedPayload = updated.toJSON();
    updatedPayload._id = updatedPayload.id;
    res.json({
      success: true,
      message: `Note ${updatedPayload.isPinned ? 'pinned' : 'unpinned'} successfully`,
      data: { note: updatedPayload },
    });
  } catch (error) {
    logger.error({ error: error.message, stack: error.stack }, 'Toggle pin error');
    res.status(500).json({
      success: false,
      message: 'Server error toggling pin status',
    });
  }
};

module.exports = {
  getNotes,
  getNote,
  createNote,
  updateNote,
  deleteNote,
  togglePin,
};
