import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import NoteCard from '../Notes/NoteCard';

const mockNote = {
  _id: '1',
  title: 'Test Note',
  content: 'This is a test note content',
  tags: ['test', 'example'],
  isPinned: false,
  color: '#ffffff',
  createdAt: '2023-01-01T00:00:00.000Z',
};

const mockHandlers = {
  onEdit: jest.fn(),
  onDelete: jest.fn(),
  onTogglePin: jest.fn(),
};

describe('NoteCard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders note title and content', () => {
    render(<NoteCard note={mockNote} {...mockHandlers} />);
    
    expect(screen.getByText('Test Note')).toBeInTheDocument();
    expect(screen.getByText('This is a test note content')).toBeInTheDocument();
  });

  it('renders tags when provided', () => {
    render(<NoteCard note={mockNote} {...mockHandlers} />);
    
    expect(screen.getByText('test')).toBeInTheDocument();
    expect(screen.getByText('example')).toBeInTheDocument();
  });

  it('shows pin icon when note is pinned', () => {
    const pinnedNote = { ...mockNote, isPinned: true };
    render(<NoteCard note={pinnedNote} {...mockHandlers} />);
    
    expect(screen.getByTestId('PushPinIcon')).toBeInTheDocument();
  });

  it('calls onEdit when edit button is clicked', () => {
    render(<NoteCard note={mockNote} {...mockHandlers} />);
    
    const editButton = screen.getByLabelText('Edit');
    fireEvent.click(editButton);
    
    expect(mockHandlers.onEdit).toHaveBeenCalledWith(mockNote);
  });

  it('calls onDelete when delete button is clicked', () => {
    render(<NoteCard note={mockNote} {...mockHandlers} />);
    
    const deleteButton = screen.getByLabelText('Delete');
    fireEvent.click(deleteButton);
    
    expect(mockHandlers.onDelete).toHaveBeenCalledWith('1');
  });

  it('calls onTogglePin when pin button is clicked', () => {
    render(<NoteCard note={mockNote} {...mockHandlers} />);
    
    const pinButton = screen.getByLabelText('Pin');
    fireEvent.click(pinButton);
    
    expect(mockHandlers.onTogglePin).toHaveBeenCalledWith('1');
  });
});
