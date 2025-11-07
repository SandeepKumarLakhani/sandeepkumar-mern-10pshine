import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  TextField,
  Button,
  Typography,
  Card,
  CardContent,
  Fab,
  Alert,
  CircularProgress,
  Pagination,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  InputAdornment,
} from '@mui/material';
import {
  Add,
  Search,
  Sort,
  FilterList,
} from '@mui/icons-material';
import { useNotes } from '../contexts/NotesContext';
import { useAuth } from '../contexts/AuthContext';
import NoteCard from '../components/Notes/NoteCard';
import NoteEditor from '../components/Notes/NoteEditor';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const {
    notes,
    loading,
    error,
    pagination,
    filters,
    fetchNotes,
    createNote,
    updateNote,
    deleteNote,
    togglePin,
    setFilters,
    clearError,
  } = useNotes();

  const [editorOpen, setEditorOpen] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [searchTerm, setSearchTerm] = useState(filters.search || '');
  const [sortBy, setSortBy] = useState(filters.sortBy || 'createdAt');
  const [sortOrder, setSortOrder] = useState(filters.sortOrder || 'desc');

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchNotes(1);
  }, [user, navigate, fetchNotes]);

  const handleCreateNote = () => {
    setEditingNote(null);
    setEditorOpen(true);
  };

  const handleEditNote = (note) => {
    setEditingNote(note);
    setEditorOpen(true);
  };

  const handleSaveNote = async (noteData) => {
    try {
      if (editingNote) {
        await updateNote(editingNote._id, noteData);
      } else {
        await createNote(noteData);
      }
      setEditorOpen(false);
      setEditingNote(null);
    } catch (error) {
      console.error('Error saving note:', error);
    }
  };

  const handleDeleteNote = async (noteId) => {
    if (window.confirm('Are you sure you want to delete this note?')) {
      await deleteNote(noteId);
    }
  };

  const handleTogglePin = async (noteId) => {
    await togglePin(noteId);
  };

  const handleSearch = (event) => {
    const value = event.target.value;
    setSearchTerm(value);
  };

  // Debounced search effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setFilters({ search: searchTerm });
      fetchNotes(1, { search: searchTerm });
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, setFilters, fetchNotes]);

  const handleSortChange = (event) => {
    const value = event.target.value;
    setSortBy(value);
    setFilters({ sortBy: value });
    fetchNotes(1, { sortBy: value, sortOrder });
  };

  const handleSortOrderChange = (event) => {
    const value = event.target.value;
    setSortOrder(value);
    setFilters({ sortOrder: value });
    fetchNotes(1, { sortBy, sortOrder: value });
  };

  const handlePageChange = (event, page) => {
    fetchNotes(page);
  };

  const pinnedNotes = notes.filter(note => note.isPinned);
  const regularNotes = notes.filter(note => !note.isPinned);

  if (!user) {
    return null;
  }

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          Welcome back, {user.name}!
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage your notes and stay organized.
        </Typography>
      </Box>

      {/* Search and Filter Bar */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                placeholder="Search notes..."
                value={searchTerm}
                onChange={handleSearch}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Sort By</InputLabel>
                <Select value={sortBy} onChange={handleSortChange}>
                  <MenuItem value="createdAt">Date Created</MenuItem>
                  <MenuItem value="updatedAt">Date Modified</MenuItem>
                  <MenuItem value="title">Title</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Order</InputLabel>
                <Select value={sortOrder} onChange={handleSortOrderChange}>
                  <MenuItem value="desc">Newest First</MenuItem>
                  <MenuItem value="asc">Oldest First</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={clearError}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box display="flex" justifyContent="center" py={4}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {/* Pinned Notes */}
          {pinnedNotes.length > 0 && (
            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <FilterList />
                Pinned Notes
              </Typography>
              <Grid container spacing={2}>
                {pinnedNotes.map((note) => (
                  <Grid item xs={12} sm={6} md={4} lg={3} key={note._id}>
                    <NoteCard
                      note={note}
                      onEdit={handleEditNote}
                      onDelete={handleDeleteNote}
                      onTogglePin={handleTogglePin}
                    />
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}

          {/* Regular Notes */}
          {regularNotes.length > 0 && (
            <Box sx={{ mb: 4 }}>
              {pinnedNotes.length > 0 && (
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Sort />
                  All Notes
                </Typography>
              )}
              <Grid container spacing={2}>
                {regularNotes.map((note) => (
                  <Grid item xs={12} sm={6} md={4} lg={3} key={note._id}>
                    <NoteCard
                      note={note}
                      onEdit={handleEditNote}
                      onDelete={handleDeleteNote}
                      onTogglePin={handleTogglePin}
                    />
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}

          {/* Empty State */}
          {notes.length === 0 && !loading && (
            <Card>
              <CardContent sx={{ textAlign: 'center', py: 6 }}>
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  No notes found
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  {searchTerm ? 'Try adjusting your search terms' : 'Create your first note to get started'}
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<Add />}
                  onClick={handleCreateNote}
                >
                  Create Note
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <Box display="flex" justifyContent="center" mt={4}>
              <Pagination
                count={pagination.totalPages}
                page={pagination.currentPage}
                onChange={handlePageChange}
                color="primary"
              />
            </Box>
          )}
        </>
      )}

      {/* Floating Action Button */}
      <Fab
        color="primary"
        aria-label="add"
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
        onClick={handleCreateNote}
      >
        <Add />
      </Fab>

      {/* Note Editor Dialog */}
      <NoteEditor
        open={editorOpen}
        onClose={() => {
          setEditorOpen(false);
          setEditingNote(null);
        }}
        onSave={handleSaveNote}
        note={editingNote}
        loading={loading}
      />
    </Box>
  );
};

export default Dashboard;
