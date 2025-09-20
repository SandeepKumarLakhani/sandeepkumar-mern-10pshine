const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../app');
const User = require('../models/User');
const Note = require('../models/Note');

chai.use(chaiHttp);
const { expect } = chai;

describe('Notes Tests', () => {
  let authToken;
  let userId;

  beforeEach(async () => {
    // Clean up database
    await User.deleteMany({});
    await Note.deleteMany({});

    // Create a test user and get auth token
    const user = new User({
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123'
    });
    await user.save();
    userId = user._id;
    authToken = user.generateAuthToken();
  });

  describe('POST /api/notes', () => {
    it('should create a new note', (done) => {
      const noteData = {
        title: 'Test Note',
        content: 'This is a test note content',
        tags: ['test', 'example']
      };

      chai.request(app)
        .post('/api/notes')
        .set('Authorization', `Bearer ${authToken}`)
        .send(noteData)
        .end((err, res) => {
          expect(res).to.have.status(201);
          expect(res.body).to.have.property('success').to.be.true;
          expect(res.body.data.note.title).to.equal(noteData.title);
          expect(res.body.data.note.content).to.equal(noteData.content);
          done();
        });
    });

    it('should not create note without authentication', (done) => {
      const noteData = {
        title: 'Test Note',
        content: 'This is a test note content'
      };

      chai.request(app)
        .post('/api/notes')
        .send(noteData)
        .end((err, res) => {
          expect(res).to.have.status(401);
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
          user: userId
        },
        {
          title: 'Note 2',
          content: 'Content 2',
          user: userId
        }
      ];
      await Note.insertMany(notes);
    });

    it('should get all notes for authenticated user', (done) => {
      chai.request(app)
        .get('/api/notes')
        .set('Authorization', `Bearer ${authToken}`)
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property('success').to.be.true;
          expect(res.body.data.notes).to.be.an('array');
          expect(res.body.data.notes).to.have.length(2);
          done();
        });
    });
  });

  describe('PUT /api/notes/:id', () => {
    let noteId;

    beforeEach(async () => {
      const note = new Note({
        title: 'Original Title',
        content: 'Original content',
        user: userId
      });
      await note.save();
      noteId = note._id;
    });

    it('should update a note', (done) => {
      const updateData = {
        title: 'Updated Title',
        content: 'Updated content'
      };

      chai.request(app)
        .put(`/api/notes/${noteId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property('success').to.be.true;
          expect(res.body.data.note.title).to.equal(updateData.title);
          done();
        });
    });
  });

  describe('DELETE /api/notes/:id', () => {
    let noteId;

    beforeEach(async () => {
      const note = new Note({
        title: 'Note to Delete',
        content: 'This note will be deleted',
        user: userId
      });
      await note.save();
      noteId = note._id;
    });

    it('should delete a note', (done) => {
      chai.request(app)
        .delete(`/api/notes/${noteId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property('success').to.be.true;
          done();
        });
    });
  });
});
