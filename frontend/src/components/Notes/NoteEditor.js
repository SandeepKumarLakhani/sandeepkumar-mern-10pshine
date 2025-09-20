import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Chip,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
} from '@mui/material';
import { Add, Close } from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

const schema = yup.object({
  title: yup.string().required('Title is required').max(100, 'Title must be less than 100 characters'),
  content: yup.string().required('Content is required').max(10000, 'Content must be less than 10000 characters'),
  tags: yup.array().of(yup.string().max(20, 'Tag must be less than 20 characters')),
  color: yup.string().matches(/^#[0-9A-F]{6}$/i, 'Invalid color format'),
});

const NoteEditor = ({ open, onClose, onSave, note = null, loading = false }) => {
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState([]);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      title: '',
      content: '',
      tags: [],
      color: '#ffffff',
    },
  });

  useEffect(() => {
    if (note) {
      reset({
        title: note.title || '',
        content: note.content || '',
        tags: note.tags || [],
        color: note.color || '#ffffff',
      });
      setTags(note.tags || []);
    } else {
      reset({
        title: '',
        content: '',
        tags: [],
        color: '#ffffff',
      });
      setTags([]);
    }
  }, [note, reset]);

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim()) && tags.length < 10) {
      const newTags = [...tags, tagInput.trim()];
      setTags(newTags);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      handleAddTag();
    }
  };

  const onSubmit = (data) => {
    onSave({
      ...data,
      tags,
    });
  };

  const handleClose = () => {
    reset();
    setTags([]);
    setTagInput('');
    onClose();
  };

  const colorOptions = [
    '#ffffff', '#f8f9fa', '#e3f2fd', '#f3e5f5', '#e8f5e8',
    '#fff3e0', '#fce4ec', '#f1f8e9', '#e0f2f1', '#fff8e1',
  ];

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { minHeight: '70vh' }
      }}
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {note ? 'Edit Note' : 'Create New Note'}
          <IconButton onClick={handleClose} size="small">
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>

      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent>
          <Grid container spacing={2}>
            <Grid item xs={12} md={8}>
              <Controller
                name="title"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Title"
                    error={!!errors.title}
                    helperText={errors.title?.message}
                    sx={{ mb: 2 }}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <Controller
                name="color"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth error={!!errors.color}>
                    <InputLabel>Color</InputLabel>
                    <Select {...field} label="Color">
                      {colorOptions.map((color) => (
                        <MenuItem key={color} value={color}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Box
                              sx={{
                                width: 20,
                                height: 20,
                                backgroundColor: color,
                                border: '1px solid #ccc',
                                borderRadius: 1,
                              }}
                            />
                            {color}
                          </Box>
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}
              />
            </Grid>
          </Grid>

          <Controller
            name="content"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                multiline
                rows={8}
                label="Content"
                error={!!errors.content}
                helperText={errors.content?.message}
                sx={{ mb: 2 }}
              />
            )}
          />

          <Box sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
              <TextField
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={handleKeyPress}
                label="Add Tag"
                size="small"
                sx={{ flexGrow: 1 }}
                helperText="Press Enter to add tag"
              />
              <Button
                variant="outlined"
                startIcon={<Add />}
                onClick={handleAddTag}
                disabled={!tagInput.trim() || tags.includes(tagInput.trim()) || tags.length >= 10}
              >
                Add
              </Button>
            </Box>
            {tags.length > 0 && (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {tags.map((tag, index) => (
                  <Chip
                    key={index}
                    label={tag}
                    onDelete={() => handleRemoveTag(tag)}
                    size="small"
                    color="primary"
                    variant="outlined"
                  />
                ))}
              </Box>
            )}
          </Box>
        </DialogContent>

        <DialogActions>
          <Button onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={loading}
          >
            {loading ? 'Saving...' : note ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default NoteEditor;
