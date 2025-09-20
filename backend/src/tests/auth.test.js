const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../app');
const User = require('../models/User');

chai.use(chaiHttp);
const { expect } = chai;

describe('Authentication Tests', () => {
  beforeEach(async () => {
    // Clean up database before each test
    await User.deleteMany({});
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', (done) => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123'
      };

      chai.request(app)
        .post('/api/auth/register')
        .send(userData)
        .end((err, res) => {
          expect(res).to.have.status(201);
          expect(res.body).to.have.property('success').to.be.true;
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

      chai.request(app)
        .post('/api/auth/register')
        .send(userData)
        .end((err, res) => {
          expect(res).to.have.status(400);
          expect(res.body).to.have.property('success').to.be.false;
          done();
        });
    });

    it('should not register user with short password', (done) => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: '123'
      };

      chai.request(app)
        .post('/api/auth/register')
        .send(userData)
        .end((err, res) => {
          expect(res).to.have.status(400);
          expect(res.body).to.have.property('success').to.be.false;
          done();
        });
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      // Create a test user
      const user = new User({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123'
      });
      await user.save();
    });

    it('should login user with valid credentials', (done) => {
      const loginData = {
        email: 'test@example.com',
        password: 'password123'
      };

      chai.request(app)
        .post('/api/auth/login')
        .send(loginData)
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property('success').to.be.true;
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

      chai.request(app)
        .post('/api/auth/login')
        .send(loginData)
        .end((err, res) => {
          expect(res).to.have.status(401);
          expect(res.body).to.have.property('success').to.be.false;
          done();
        });
    });
  });
});
