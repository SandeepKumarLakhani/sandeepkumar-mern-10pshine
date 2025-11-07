const request = require('supertest');
const app = require('../../app');
const { sequelize } = require('../../config/database');
const { User } = require('../../models/User');
const { Note } = require('../../models/Note');

let testUser;
let authToken;

beforeAll(async () => {
  // Sync database with { force: true } for clean test environment
  await sequelize.sync({ force: true });

  // Create test user
  testUser = await User.create({
    name: 'Test User',
    email: 'test@example.com',
    password: 'password123'
  });

  // Get auth token
  const loginResponse = await request(app)
    .post('/api/auth/login')
    .send({
      email: 'test@example.com',
      password: 'password123'
    });

  authToken = loginResponse.body.data.token;
});

afterAll(async () => {
  await sequelize.close();
});

describe('Notes API Integration Tests', () => {
  let noteId;

  test('POST /api/notes - Create note', async () => {
    const response = await request(app)
      .post('/api/notes')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        title: 'Test Note',
        content: 'Test Content',
        tags: ['test', 'integration']
      });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data.note).toHaveProperty('id');
    expect(response.body.data.note.title).toBe('Test Note');
    expect(response.body.data.note.tags).toEqual(['test', 'integration']);

    noteId = response.body.data.note.id;
  });

  test('GET /api/notes - List notes', async () => {
    const response = await request(app)
      .get('/api/notes')
      .set('Authorization', `Bearer ${authToken}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(Array.isArray(response.body.data.notes)).toBe(true);
    expect(response.body.data.notes.length).toBeGreaterThan(0);
    expect(response.body.data.pagination).toBeDefined();
  });

  test('GET /api/notes - Search by tag', async () => {
    const response = await request(app)
      .get('/api/notes?tags=test')
      .set('Authorization', `Bearer ${authToken}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(Array.isArray(response.body.data.notes)).toBe(true);
    expect(response.body.data.notes.length).toBeGreaterThan(0);
    expect(response.body.data.notes[0].tags).toContain('test');
  });

  test('PATCH /api/notes/:id/pin - Toggle pin', async () => {
    const response = await request(app)
      .patch(`/api/notes/${noteId}/pin`)
      .set('Authorization', `Bearer ${authToken}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.note.isPinned).toBe(true);
  });

  test('DELETE /api/notes/:id - Delete note', async () => {
    const response = await request(app)
      .delete(`/api/notes/${noteId}`)
      .set('Authorization', `Bearer ${authToken}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe('Note deleted successfully');

    // Verify note is deleted
    const getResponse = await request(app)
      .get(`/api/notes/${noteId}`)
      .set('Authorization', `Bearer ${authToken}`);

    expect(getResponse.status).toBe(404);
  });
});