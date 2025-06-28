import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { ConfigModule } from '@nestjs/config';

describe('UserController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          envFilePath: '.env.test',
        }),
        AppModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  describe('/user (POST)', () => {
    it('should create a new user', () => {
      const createUserDto = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
        roles: ['client'],
      };

      return request(app.getHttpServer())
        .post('/user')
        .send(createUserDto)
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('code', 200);
          expect(res.body).toHaveProperty('message');
          expect(res.body).toHaveProperty('data');
          expect(Array.isArray(res.body.data)).toBe(true);
        });
    });

    it('should return 400 when creating user with existing email', () => {
      const createUserDto = {
        username: 'existinguser',
        email: 'existing@example.com',
        password: 'password123',
        roles: ['client'],
      };

      return request(app.getHttpServer())
        .post('/user')
        .send(createUserDto)
        .expect(400);
    });

    it('should return 400 when creating user with invalid data', () => {
      const invalidUserDto = {
        username: 'te', // Too short
        email: 'invalid-email',
        password: '123', // Too short
        roles: ['invalid-role'],
      };

      return request(app.getHttpServer())
        .post('/user')
        .send(invalidUserDto)
        .expect(400);
    });
  });

  describe('/user/login (POST)', () => {
    it('should login successfully with valid credentials', () => {
      const loginDto = {
        user: 'test@example.com',
        password: 'password123',
      };

      return request(app.getHttpServer())
        .post('/user/login')
        .send(loginDto)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('code', 200);
          expect(res.body).toHaveProperty('message');
          expect(res.body).toHaveProperty('data');
          expect(Array.isArray(res.body.data)).toBe(true);
          expect(res.body.data[0]).toHaveProperty('user');
          expect(res.body.data[0]).toHaveProperty('token');
        });
    });

    it('should return 401 with invalid credentials', () => {
      const invalidLoginDto = {
        user: 'test@example.com',
        password: 'wrongpassword',
      };

      return request(app.getHttpServer())
        .post('/user/login')
        .send(invalidLoginDto)
        .expect(401);
    });

    it('should return 401 when user does not exist', () => {
      const nonExistentUserDto = {
        user: 'nonexistent@example.com',
        password: 'password123',
      };

      return request(app.getHttpServer())
        .post('/user/login')
        .send(nonExistentUserDto)
        .expect(401);
    });
  });

  describe('/user/:id (GET)', () => {
    it('should return user by id', () => {
      const userId = '1';

      return request(app.getHttpServer())
        .get(`/user/${userId}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('code', 200);
          expect(res.body).toHaveProperty('message');
          expect(res.body).toHaveProperty('data');
          expect(Array.isArray(res.body.data)).toBe(true);
        });
    });

    it('should return 401 when user not found', () => {
      const nonExistentUserId = '999';

      return request(app.getHttpServer())
        .get(`/user/${nonExistentUserId}`)
        .expect(401);
    });
  });

  describe('/user/:id (PUT)', () => {
    it('should update user successfully', () => {
      const userId = '1';
      const updateUserDto = {
        name: 'Updated Name',
        email: 'updated@example.com',
      };

      return request(app.getHttpServer())
        .put(`/user/${userId}`)
        .send(updateUserDto)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('code', 200);
          expect(res.body).toHaveProperty('message');
          expect(res.body).toHaveProperty('data');
        });
    });

    it('should return 401 when updating non-existent user', () => {
      const nonExistentUserId = '999';
      const updateUserDto = {
        name: 'Updated Name',
      };

      return request(app.getHttpServer())
        .put(`/user/${nonExistentUserId}`)
        .send(updateUserDto)
        .expect(401);
    });
  });

  describe('/user/:id (DELETE)', () => {
    it('should delete user successfully', () => {
      const userId = '1';

      return request(app.getHttpServer())
        .delete(`/user/${userId}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('code', 200);
          expect(res.body).toHaveProperty('message');
        });
    });

    it('should return 401 when deleting non-existent user', () => {
      const nonExistentUserId = '999';

      return request(app.getHttpServer())
        .delete(`/user/${nonExistentUserId}`)
        .expect(401);
    });
  });
}); 