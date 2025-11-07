import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { notesAPI } from '../services/api';

const NotesContext = createContext();

const initialState = {
  notes: [],
  currentNote: null,
  loading: false,
  error: null,
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalNotes: 0,
    hasNext: false,
    hasPrev: false,
  },
  filters: {
    search: '',
    tags: [],
    sortBy: 'createdAt',
    sortOrder: 'desc',
  },
};

const notesReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload,
      };
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        loading: false,
      };
    case 'SET_NOTES':
      return {
        ...state,
        notes: action.payload.notes,
        pagination: action.payload.pagination,
        loading: false,
        error: null,
      };
    case 'ADD_NOTE':
      return {
        ...state,
        notes: [action.payload, ...state.notes],
        pagination: {
          ...state.pagination,
          totalNotes: state.pagination.totalNotes + 1,
        },
      };
    case 'UPDATE_NOTE':
      return {
        ...state,
        notes: state.notes.map(note =>
          note.id === action.payload.id ? action.payload : note
        ),
        currentNote: state.currentNote?.id === action.payload.id ? action.payload : state.currentNote,
      };
    case 'DELETE_NOTE':
      return {
        ...state,
        notes: state.notes.filter(note => note.id !== action.payload),
        pagination: {
          ...state.pagination,
          totalNotes: state.pagination.totalNotes - 1,
        },
        currentNote: state.currentNote?.id === action.payload ? null : state.currentNote,
      };
    case 'SET_CURRENT_NOTE':
      return {
        ...state,
        currentNote: action.payload,
      };
    case 'CLEAR_CURRENT_NOTE':
      return {
        ...state,
        currentNote: null,
      };
    case 'SET_FILTERS':
      return {
        ...state,
        filters: { ...state.filters, ...action.payload },
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };
    default:
      return state;
  }
};

export const NotesProvider = ({ children }) => {
  const [state, dispatch] = useReducer(notesReducer, initialState);

  const fetchNotes = useCallback(async (page = 1, filters = {}) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const params = {
        page,
        ...state.filters,
        ...filters,
      };

      const response = await notesAPI.getNotes(params);
      const { notes, pagination } = response.data.data;

      dispatch({
        type: 'SET_NOTES',
        payload: { notes, pagination },
      });

      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to fetch notes';
      dispatch({ type: 'SET_ERROR', payload: message });
      return { success: false, error: message };
    }
  }, [state.filters]);

  const fetchNote = useCallback(async (id) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const response = await notesAPI.getNote(id);
      const note = response.data.data.note;

      dispatch({ type: 'SET_CURRENT_NOTE', payload: note });
      return { success: true, note };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to fetch note';
      dispatch({ type: 'SET_ERROR', payload: message });
      return { success: false, error: message };
    }
  }, []);

  const createNote = useCallback(async (noteData) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const response = await notesAPI.createNote(noteData);
      const note = response.data.data.note;

      dispatch({ type: 'ADD_NOTE', payload: note });
      return { success: true, note };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to create note';
      dispatch({ type: 'SET_ERROR', payload: message });
      return { success: false, error: message };
    }
  }, []);

  const updateNote = useCallback(async (id, noteData) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const response = await notesAPI.updateNote(id, noteData);
      const note = response.data.data.note;

      dispatch({ type: 'UPDATE_NOTE', payload: note });
      return { success: true, note };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update note';
      dispatch({ type: 'SET_ERROR', payload: message });
      return { success: false, error: message };
    }
  }, []);

  const deleteNote = useCallback(async (id) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      await notesAPI.deleteNote(id);

      dispatch({ type: 'DELETE_NOTE', payload: id });
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to delete note';
      dispatch({ type: 'SET_ERROR', payload: message });
      return { success: false, error: message };
    }
  }, []);

  const togglePin = useCallback(async (id) => {
    try {
      const response = await notesAPI.togglePin(id);
      const note = response.data.data.note;

      dispatch({ type: 'UPDATE_NOTE', payload: note });
      return { success: true, note };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to toggle pin';
      dispatch({ type: 'SET_ERROR', payload: message });
      return { success: false, error: message };
    }
  }, []);

  const setFilters = useCallback((filters) => {
    dispatch({ type: 'SET_FILTERS', payload: filters });
  }, []);

  const clearError = useCallback(() => {
    dispatch({ type: 'CLEAR_ERROR' });
  }, []);

  const clearCurrentNote = useCallback(() => {
    dispatch({ type: 'CLEAR_CURRENT_NOTE' });
  }, []);

  const value = {
    ...state,
    fetchNotes,
    fetchNote,
    createNote,
    updateNote,
    deleteNote,
    togglePin,
    setFilters,
    clearError,
    clearCurrentNote,
  };

  return <NotesContext.Provider value={value}>{children}</NotesContext.Provider>;
};

export const useNotes = () => {
  const context = useContext(NotesContext);
  if (!context) {
    throw new Error('useNotes must be used within a NotesProvider');
  }
  return context;
};
