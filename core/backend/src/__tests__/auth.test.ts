import request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import app from '../app';
import { User } from '../models/User';

describe('Auth Endpoints', () => {
  let mongoServer: MongoMemoryServer;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  beforeEach(async () => {
    await User.deleteMany({});
  });

  describe('POST /api/v1/auth/login', () => {
    it('sollte einen Token für gültige Anmeldedaten zurückgeben', async () => {
      // Testbenutzer erstellen
      await User.create({
        username: 'testuser',
        password: 'password123',
        email: 'test@example.com',
      });

      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          username: 'testuser',
          password: 'password123',
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toHaveProperty('username', 'testuser');
    });

    it('sollte 401 für ungültige Anmeldedaten zurückgeben', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          username: 'wronguser',
          password: 'wrongpass',
        });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('message');
    });
  });

  describe('POST /api/v1/auth/refresh', () => {
    it('sollte einen neuen Token für gültigen Refresh-Token zurückgeben', async () => {
      // Implementiere Refresh-Token-Test
    });

    it('sollte 401 für ungültigen Refresh-Token zurückgeben', async () => {
      const response = await request(app)
        .post('/api/v1/auth/refresh')
        .send({
          refreshToken: 'invalid-token',
        });

      expect(response.status).toBe(401);
    });
  });
}); 