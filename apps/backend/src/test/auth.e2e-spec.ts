import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../app.module';
import { JwtService } from '@nestjs/jwt';

process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret';

describe('Auth e2e', () => {
  let app: INestApplication;
  const users: Record<string, any> = {};

  const mockPrisma = {
    user: {
      findFirst: jest.fn(async ({ where }: any) => {
        // check email or username
        for (const id of Object.keys(users)) {
          const u = users[id];
          if ((where?.OR && where.OR.some((c: any) => c.email === u.email || c.username === u.username)) || where?.email === u.email) {
            return u;
          }
        }
        return null;
      }),
      create: jest.fn(async ({ data, select }: any) => {
        const id = Date.now().toString();
        const user = { id, ...data, isActive: true, createdAt: new Date(), updatedAt: new Date() };
        users[id] = user;
        if (select) {
          const picked: any = {};
          Object.keys(select).forEach((k) => (picked[k] = user[k]));
          return picked;
        }
        return user;
      }),
      findUnique: jest.fn(async ({ where }: any) => {
        for (const id of Object.keys(users)) {
          const u = users[id];
          if (where?.email === u.email || where?.id === u.id) return u;
        }
        return null;
      }),
    },
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({ imports: [AppModule] })
      .overrideProvider('PrismaService')
      .useValue(mockPrisma)
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
    app.setGlobalPrefix('api');
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('register -> login flow', async () => {
    const payload = { email: 'test@example.com', username: 'tester', password: 'password123' };

    const reg = await request(app.getHttpServer()).post('/api/auth/register').send(payload).expect(201);
    expect(reg.body).toHaveProperty('user');

    const login = await request(app.getHttpServer()).post('/api/auth/login').send({ email: payload.email, password: payload.password }).expect(201);
    expect(login.body).toHaveProperty('token');
  });
});
