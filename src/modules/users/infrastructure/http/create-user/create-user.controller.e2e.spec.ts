import * as request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { TestHelper } from '../../../../shared/test/test-helper';
import { RoleModel } from '../../../../shared/infrastructure/database/models/role.model';

describe('CreateUserController (E2E)', () => {
  let testHelper: TestHelper;
  let app: INestApplication;

  beforeAll(async () => {
    testHelper = new TestHelper();
    await testHelper.init();
    app = testHelper.getApp();
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

  it('should create a user successfully', async () => {
    const userData = {
      name: 'Test User',
      email: 'test.e2e@example.com',
      password: 'Password123!',
      passwordConfirmation: 'Password123!',
      roleId: 2,
    };

    const response = await request(app.getHttpServer())
      .post('/api/users')
      .send(userData)
      .expect(201);

    expect(response.body).toHaveProperty('id');
    expect(response.body.name).toBe(userData.name);
    expect(response.body.email).toBe(userData.email);
    expect(response.body).not.toHaveProperty('password');
    expect(response.body.role.id).toBe(userData.roleId);
  });

  it('should return 400 when validation fails', async () => {
    const invalidData = {
      name: '',
      email: 'not-an-email',
      password: '123',
      passwordConfirmation: '1234',
      roleId: 999,
    };

    const response = await request(app.getHttpServer())
      .post('/api/users')
      .send(invalidData)
      .expect(400);

    expect(response.body).toHaveProperty('errorCodeName', 'VALIDATION_ERROR');
    expect(response.body.details).toContain('name is required');
    expect(response.body.details).toContain('email must be valid');
    expect(response.body.details).toContain(
      'password must be at least 8 characters long',
    );
  });

  it('should return 409 when user already exists', async () => {
    const userData = {
      name: 'Existing User',
      email: 'existing.e2e@example.com',
      password: 'Password123!',
      passwordConfirmation: 'Password123!',
      roleId: 2,
    };

    await request(app.getHttpServer())
      .post('/api/users')
      .send(userData)
      .expect(201);

    const response = await request(app.getHttpServer())
      .post('/api/users')
      .send(userData)
      .expect(409);

    expect(response.body).toHaveProperty(
      'errorCodeName',
      'USER_ALREADY_EXISTS',
    );
    expect(response.body.details).toContain(userData.email);
  });

  it('should accept valid values for password complexity', async () => {
    const userData = {
      name: 'Password Test User',
      email: 'password.test@example.com',
      password: 'ValidP@ssw0rd',
      passwordConfirmation: 'ValidP@ssw0rd',
      roleId: 2,
    };

    const response = await request(app.getHttpServer())
      .post('/api/users')
      .send(userData)
      .expect(201);

    expect(response.body).toHaveProperty('id');
    expect(response.body.name).toBe(userData.name);
  });

  it('should create a user with correct defaults', async () => {
    const userData = {
      name: 'Default Values User',
      email: 'defaults@example.com',
      password: 'Password123!',
      passwordConfirmation: 'Password123!',
      roleId: 2,
    };

    const response = await request(app.getHttpServer())
      .post('/api/users')
      .send(userData)
      .expect(201);

    expect(response.body.isActive).toBe(true);

    expect(response.body).toHaveProperty('createdAt');
    expect(response.body).toHaveProperty('updatedAt');

    expect(new Date(response.body.createdAt).getTime()).not.toBeNaN();
    expect(new Date(response.body.updatedAt).getTime()).not.toBeNaN();
  });
});
