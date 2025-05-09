import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { TestHelper } from '../../../../shared/test/test-helper';
import { BcryptPasswordHasher } from '../../services/bcrypt-password-hasher';
import { UserModel } from '../../../../shared/infrastructure/database/models/user.model';
import { RoleModel } from '../../../../shared/infrastructure/database/models/role.model';
import { PasswordHasher } from '../../../domain/services/password-hasher';

describe('LoginController (E2E)', () => {
  let app: INestApplication;
  let testHelper: TestHelper;
  let passwordHasher: BcryptPasswordHasher;

  beforeAll(async () => {
    testHelper = new TestHelper();
    await testHelper.init();
    app = testHelper.getApp();

    passwordHasher = app.get(PasswordHasher);
  });

  beforeEach(async () => {
    await testHelper.clearDatabase();

    await RoleModel.bulkCreate([
      { id: 1, name: 'Admin' },
      { id: 2, name: 'User' },
    ]);
  });

  afterAll(async () => {
    await testHelper.clearDatabase();
    await testHelper.close();
  });

  it('should authenticate user and return token', async () => {
    const hashedPassword = await passwordHasher.hash('Password123!');

    await UserModel.create({
      name: 'E2E Test User',
      email: 'e2e-login-test@example.com',
      password: hashedPassword,
      is_active: true,
      role_id: 2,
    });

    const response = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({
        email: 'e2e-login-test@example.com',
        password: 'Password123!',
      })
      .expect(200);

    expect(response.body).toHaveProperty('token');
    expect(response.body).toHaveProperty('user');
    expect(response.body.user.email).toBe('e2e-login-test@example.com');
    expect(response.body.user.name).toBe('E2E Test User');
    expect(response.body.user).not.toHaveProperty('password');
    expect(response.body.user.role.id).toBe(2);
  });

  it('should return 401 with invalid credentials', async () => {
    const hashedPassword = await passwordHasher.hash('Password123!');

    await UserModel.create({
      name: 'E2E Test User',
      email: 'e2e-login-test@example.com',
      password: hashedPassword,
      is_active: true,
      role_id: 2,
    });

    const response = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({
        email: 'e2e-login-test@example.com',
        password: 'WrongPassword',
      })
      .expect(401);

    expect(response.body).toHaveProperty(
      'errorCodeName',
      'INVALID_CREDENTIALS',
    );
  });

  it('should return 401 with non-existent user', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({
        email: 'nonexistent@example.com',
        password: 'Password123!',
      })
      .expect(401);

    expect(response.body).toHaveProperty(
      'errorCodeName',
      'INVALID_CREDENTIALS',
    );
  });

  it('should return 409 with inactive user', async () => {
    const hashedPassword = await passwordHasher.hash('Password123!');

    await UserModel.create({
      name: 'Inactive User',
      email: 'inactive@example.com',
      password: hashedPassword,
      is_active: false,
      role_id: 2,
    });

    const response = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({
        email: 'inactive@example.com',
        password: 'Password123!',
      })
      .expect(409);

    expect(response.body).toHaveProperty('errorCodeName', 'USER_NOT_ACTIVE');
  });

  it('should return 400 with validation errors', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({
        email: 'not-an-email',
        password: '123',
      })
      .expect(400);

    expect(response.body).toHaveProperty('errorCodeName', 'VALIDATION_ERROR');
    expect(response.body.details).toContain('email must be valid');
  });
});
