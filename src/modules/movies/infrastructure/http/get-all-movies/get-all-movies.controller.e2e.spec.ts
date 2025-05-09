import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { JwtService } from '@nestjs/jwt';
import { TestHelper } from '../../../../shared/test/test-helper';
import { RoleModel } from '../../../../shared/infrastructure/database/models/role.model';
import { ROLES } from '../../../../users/domain/types';
import { UserModel } from '../../../../shared/infrastructure/database/models/user.model';
import { MovieModel } from '../../../../shared/infrastructure/database/models/movie.model';
import { MovieFactory } from '../../../test/movie-factory';
import { UserFactory } from '../../../../users/test/user-factory';
import { GetAllMoviesUseCase } from '../../../application/use-cases/get-all-movies/get-all-movies.use-case';

describe('GetAllMoviesController (E2E)', () => {
  let app: INestApplication;
  let testHelper: TestHelper;
  let jwtService: JwtService;
  let userToken: string;
  let adminToken: string;

  beforeAll(async () => {
    testHelper = new TestHelper();
    await testHelper.init();
    app = testHelper.getApp();

    jwtService = app.get(JwtService);
  });

  beforeEach(async () => {
    await testHelper.clearDatabase();

    await RoleModel.bulkCreate([
      { id: ROLES.ADMIN.id, name: ROLES.ADMIN.name },
      { id: ROLES.USER.id, name: ROLES.USER.name },
    ]);

    const userModels = UserFactory.createUserModels();
    const [adminUserModel, regularUserModel] =
      await UserModel.bulkCreate(userModels);

    adminToken = jwtService.sign({
      sub: adminUserModel.id,
      email: adminUserModel.email,
    });

    userToken = jwtService.sign({
      sub: regularUserModel.id,
      email: regularUserModel.email,
    });
  });

  afterAll(async () => {
    await testHelper.clearDatabase();
    await testHelper.close();
  });

  it('should return all movies when authenticated', async () => {
    await MovieModel.bulkCreate(MovieFactory.createMovieModels());

    const response = await request(app.getHttpServer())
      .get('/api/movies')
      .set('Authorization', `Bearer ${userToken}`)
      .expect(200);

    expect(response.body).toBeInstanceOf(Array);
    expect(response.body).toHaveLength(3);
    expect(response.body[0].title).toBe('A New Hope');
    expect(response.body[1].title).toBe('The Empire Strikes Back');
    expect(response.body[2].title).toBe('Return of the Jedi');
    expect(response.body[0]).toHaveProperty('id');
    expect(response.body[0]).toHaveProperty('episodeId');
    expect(response.body[0]).toHaveProperty('openingCrawl');
    expect(response.body[0]).toHaveProperty('director');
    expect(response.body[0]).toHaveProperty('producer');
    expect(response.body[0]).toHaveProperty('releaseDate');
    expect(response.body[0]).toHaveProperty('url');
    expect(response.body[0]).toHaveProperty('externalId');
  });

  it('should work for both admin and regular users', async () => {
    await MovieModel.bulkCreate(MovieFactory.createMovieModels().slice(0, 1));

    const userResponse = await request(app.getHttpServer())
      .get('/api/movies')
      .set('Authorization', `Bearer ${userToken}`)
      .expect(200);

    expect(userResponse.body).toHaveLength(1);
    expect(userResponse.body[0].title).toBe('A New Hope');

    const adminResponse = await request(app.getHttpServer())
      .get('/api/movies')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    expect(adminResponse.body).toHaveLength(1);
    expect(adminResponse.body[0].title).toBe('A New Hope');
  });

  it('should return empty array when no movies exist', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/movies')
      .set('Authorization', `Bearer ${userToken}`)
      .expect(200);

    expect(response.body).toBeInstanceOf(Array);
    expect(response.body).toHaveLength(0);
  });

  it('should return 401 when not authenticated', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/movies')
      .expect(401);

    expect(response.body).toHaveProperty('errorCodeName', 'TOKEN_NOT_PROVIDED');
  });

  it('should return 401 when token is invalid', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/movies')
      .set('Authorization', 'Bearer invalid_token')
      .expect(401);

    expect(response.body).toHaveProperty('errorCodeName', 'INVALID_TOKEN');
  });

  it('should handle database errors with 500 status code', async () => {
    const genericError = new Error('Unexpected database error');

    const getAllMoviesUseCase = app.get(GetAllMoviesUseCase);
    jest
      .spyOn(getAllMoviesUseCase, 'execute')
      .mockRejectedValueOnce(genericError);

    const response = await request(app.getHttpServer())
      .get('/api/movies')
      .set('Authorization', `Bearer ${userToken}`)
      .expect(500);

    expect(response.body).toHaveProperty(
      'errorCodeName',
      'INTERNAL_SERVER_ERROR',
    );
    expect(response.body.message).toBe('An unexpected error occurred');
    expect(response.body.details).toBe('Unexpected database error');
  });

  it('should return 401 when token is expired', async () => {
    const expiredToken = jwtService.sign(
      {
        sub: UserFactory.createUserModels()[1].id,
        email: 'user@example.com',
      },
      { expiresIn: '0s' },
    );

    await new Promise((resolve) => setTimeout(resolve, 10));

    const response = await request(app.getHttpServer())
      .get('/api/movies')
      .set('Authorization', `Bearer ${expiredToken}`)
      .expect(401);

    expect(response.body).toHaveProperty('errorCodeName', 'TOKEN_EXPIRED');
  });
});
