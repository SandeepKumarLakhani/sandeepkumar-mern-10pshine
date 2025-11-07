const { Model, DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

class Note extends Model {
  getFormattedDate() {
    return this.createdAt.toLocaleDateString();
  }
}

Note.init(
  {
    title: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Title is required' },
        len: [1, 100],
      },
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Content is required' },
        len: [1, 10000],
      },
    },
    tags: {
      type: DataTypes.JSON,
      defaultValue: [],
      validate: {
        isValidTags(value) {
          if (!Array.isArray(value)) throw new Error('Tags must be an array');
          if (value.some(tag => tag.length > 20))
            throw new Error('Tag cannot exceed 20 characters');
        },
      },
    },
    isPinned: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    color: {
      type: DataTypes.STRING(7),
      defaultValue: '#ffffff',
      validate: {
        is: /^#[0-9A-F]{6}$/i,
      },
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'user_id',
      references: {
        model: 'users', // This is the table name (pluralized), not the model name
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL', // Allow notes to remain when user is deleted
    },
    isArchived: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    isDeleted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'created_at',
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'updated_at',
    },
  },
  {
    sequelize,
    modelName: 'Note',
    tableName: 'notes',
    underscored: true, // This ensures column names use snake_case
    timestamps: true,
    indexes: [
      {
        fields: ['user_id', 'created_at'],
      },
      {
        fields: ['user_id', 'is_pinned', 'created_at'],
      },
      {
        type: 'FULLTEXT',
        fields: ['title', 'content'],
      },
    ],
  }
);
module.exports = Note;
