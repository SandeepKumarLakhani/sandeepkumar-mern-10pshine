const chai = require('chai');
const request = require('supertest');
const app = require('../app');
const User = require('../models/User');
const Note = require('../models/Note');

const { expect } = chai;
const { initializeDatabase } = require('../config/database');

before(async function () {
  // Ensure DB/tables are initialized before running tests
  this.timeout(20000);
  await initializeDatabase();
});

describe('Notes Tests', () => {
  let authToken;
  let userId;

  beforeEach(async () => {
    // Clean up database (destroy notes first because of FK constraint)
    await Note.destroy({ where: {} });
    await User.destroy({ where: {} });

    // Create a test user and get auth token
    const user = await User.create({
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
    });
    userId = user.id;
    authToken = user.generateToken();
  });

  describe('POST /api/notes', () => {
    it('should create a new note', done => {
      const noteData = {
        title: 'Test Note',
        content: 'This is a test note content',
        tags: ['test', 'example'],
      };

      request(app)
        .post('/api/notes')
        .set('Authorization', `Bearer ${authToken}`)
        .send(noteData)
        .expect(201)
        .end((err, res) => {
          if (err) return done(err);
          expect(res.body).to.have.property('success').that.is.true;
          expect(res.body.data.note.title).to.equal(noteData.title);
          expect(res.body.data.note.content).to.equal(noteData.content);
          done();
        });
    });

    it('should not create note without authentication', done => {
      const noteData = {
        title: 'Test Note',
        content: 'This is a test note content',
      };

      request(app)
        .post('/api/notes')
        .send(noteData)
        .expect(401)
        .end((err, res) => {
          if (err) return done(err);
          done();
        });
    });
  });

  describe('GET /api/notes', () => {
    beforeEach(async () => {
      // Create test notes
      const notes = [
        {
          title: 'Note 1',
          content: 'Content 1',
          userId: userId,
        },
        {
          title: 'Note 2',
          content: 'Content 2',
          userId: userId,
        },
      ];
      await Note.bulkCreate(notes);
    });

    it('should get all notes for authenticated user', done => {
      request(app)
        .get('/api/notes')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .end((err, res) => {
          if (err) return done(err);
          expect(res.body).to.have.property('success').that.is.true;
          expect(res.body.data.notes).to.be.an('array');
          expect(res.body.data.notes).to.have.length(2);
          done();
        });
    });
  });

  describe('PUT /api/notes/:id', () => {
    let noteId;

    beforeEach(async () => {
      const note = await Note.create({
        title: 'Original Title',
        content: 'Original content',
        userId: userId,
      });
      noteId = note.id;
    });

    it('should update a note', done => {
      const updateData = {
        title: 'Updated Title',
        content: 'Updated content',
      };

      request(app)
        .put(`/api/notes/${noteId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200)
        .end((err, res) => {
          if (err) return done(err);
          expect(res.body).to.have.property('success').that.is.true;
          expect(res.body.data.note.title).to.equal(updateData.title);
          done();
        });
    });
  });

  describe('DELETE /api/notes/:id', () => {
    let noteId;

    beforeEach(async () => {
      const note = await Note.create({
        title: 'Note to Delete',
        content: 'This note will be deleted',
        userId: userId,
      });
      noteId = note.id;
    });

    it('should delete a note', done => {
      request(app)
        .delete(`/api/notes/${noteId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .end((err, res) => {
          if (err) return done(err);
          expect(res.body).to.have.property('success').that.is.true;
          done();
        });
    });
  });
});
