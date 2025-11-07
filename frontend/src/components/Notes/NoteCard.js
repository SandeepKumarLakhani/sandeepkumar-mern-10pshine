import React from 'react';
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  IconButton,
  Chip,
  Box,
  Tooltip,
} from '@mui/material';
import {
  Edit,
  Delete,
  PushPin,
  PushPinOutlined,
} from '@mui/icons-material';
import { format } from 'date-fns';

const NoteCard = ({ note, onEdit, onDelete, onTogglePin }) => {
  const handleEdit = () => {
    onEdit(note);
  };

  const handleDelete = () => {
    onDelete(note.id);
  };

  const handleTogglePin = () => {
    onTogglePin(note.id);
  };

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: note.color || '#ffffff',
        border: note.isPinned ? '2px solid #1976d2' : '1px solid #e0e0e0',
        '&:hover': {
          boxShadow: 3,
        },
      }}
    >
      <CardContent sx={{ flexGrow: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 1 }}>
          <Typography
            variant="h6"
            component="h2"
            sx={{
              fontWeight: 'bold',
              fontSize: '1.1rem',
              lineHeight: 1.2,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {note.title}
          </Typography>
          {note.isPinned && (
            <PushPin color="primary" sx={{ ml: 1, flexShrink: 0 }} />
          )}
        </Box>

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            mb: 2,
            lineHeight: 1.4,
          }}
        >
          {note.content}
        </Typography>

        {note.tags && note.tags.length > 0 && (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1 }}>
            {note.tags.slice(0, 3).map((tag, index) => (
              <Chip
                key={index}
                label={tag}
                size="small"
                variant="outlined"
                sx={{ fontSize: '0.75rem' }}
              />
            ))}
            {note.tags.length > 3 && (
              <Chip
                label={`+${note.tags.length - 3}`}
                size="small"
                variant="outlined"
                sx={{ fontSize: '0.75rem' }}
              />
            )}
          </Box>
        )}

        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ fontSize: '0.7rem' }}
        >
          {format(new Date(note.createdAt), 'MMM dd, yyyy')}
        </Typography>
      </CardContent>

      <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 1 }}>
        <Box>
          <Tooltip title={note.isPinned ? 'Unpin' : 'Pin'}>
            <IconButton
              size="small"
              onClick={handleTogglePin}
              color={note.isPinned ? 'primary' : 'default'}
            >
              {note.isPinned ? <PushPin /> : <PushPinOutlined />}
            </IconButton>
          </Tooltip>
        </Box>

        <Box>
          <Tooltip title="Edit">
            <IconButton size="small" onClick={handleEdit} color="primary">
              <Edit />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete">
            <IconButton size="small" onClick={handleDelete} color="error">
              <Delete />
            </IconButton>
          </Tooltip>
        </Box>
      </CardActions>
    </Card>
  );
};

export default NoteCard;
