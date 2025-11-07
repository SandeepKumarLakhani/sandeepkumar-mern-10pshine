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

describe('Authentication Tests', () => {
  beforeEach(async () => {
  // Clean up database before each test (destroy notes first because of FK constraint)
  await Note.destroy({ where: {} });
  await User.destroy({ where: {} });
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', (done) => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123'
      };

      request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201)
        .end((err, res) => {
          if (err) return done(err);
          expect(res.body).to.have.property('success').that.is.true;
          expect(res.body).to.have.property('data');
          expect(res.body.data).to.have.property('user');
          expect(res.body.data).to.have.property('token');
          expect(res.body.data.user.email).to.equal(userData.email);
          done();
        });
    });

    it('should not register user with invalid email', (done) => {
      const userData = {
        name: 'Test User',
        email: 'invalid-email',
        password: 'password123'
      };

      request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400)
        .end((err, res) => {
          if (err) return done(err);
          expect(res.body).to.have.property('success').that.is.false;
          done();
        });
    });

    it('should not register user with short password', (done) => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: '123'
      };

      request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400)
        .end((err, res) => {
          if (err) return done(err);
          expect(res.body).to.have.property('success').that.is.false;
          done();
        });
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      // Create a test user
      await User.create({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123'
      });
    });

    it('should login user with valid credentials', (done) => {
      const loginData = {
        email: 'test@example.com',
        password: 'password123'
      };

      request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(200)
        .end((err, res) => {
          if (err) return done(err);
          expect(res.body).to.have.property('success').that.is.true;
          expect(res.body).to.have.property('data');
          expect(res.body.data).to.have.property('user');
          expect(res.body.data).to.have.property('token');
          done();
        });
    });

    it('should not login user with invalid credentials', (done) => {
      const loginData = {
        email: 'test@example.com',
        password: 'wrongpassword'
      };

      request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(401)
        .end((err, res) => {
          if (err) return done(err);
          expect(res.body).to.have.property('success').that.is.false;
          done();
        });
    });
  });
});
