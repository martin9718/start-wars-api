import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { TestHelper } from '../../../../shared/test/test-helper';
import { MovieExternalService } from '../../../domain/services/movie-external-service';
import { MovieModel } from '../../../../shared/infrastructure/database/models/movie.model';
import { MovieExternalServiceError } from '../../../domain/errors/movie-external-service-error';
import { SyncMoviesUseCase } from '../../../application/use-cases/sync-movies/sync-movies.use-case';
import { JwtService } from '@nestjs/jwt';
import { UserRepository } from '../../../../users/domain/repositories/user.repository';
import { User } from '../../../../users/domain/entities/user';
import { ROLES } from '../../../../users/domain/types';
import { UserModel } from '../../../../shared/infrastructure/database/models/user.model';
import { RoleModel } from '../../../../shared/infrastructure/database/models/role.model';
import { MovieFactory } from '../../../test/movie-factory';
import { UserFactory } from '../../../../users/test/user-factory';

describe('SyncMoviesController (E2E)', () => {
  let app: INestApplication;
  let testHelper: TestHelper;
  let movieExternalService: MovieExternalService;
  let jwtService: JwtService;
  let userRepository: UserRepository;

  let adminToken: string;
  let userToken: string;
  let adminUser: User;

  beforeAll(async () => {
    testHelper = new TestHelper();
    await testHelper.init();
    app = testHelper.getApp();

    movieExternalService = app.get(MovieExternalService);
    jwtService = app.get(JwtService);
    userRepository = app.get(UserRepository);
  });

  beforeEach(async () => {
    await testHelper.clearDatabase();

    const mockMoviesData = MovieFactory.createDefaultMovies().slice(0, 2);
    jest
      .spyOn(movieExternalService, 'fetchAllMovies')
      .mockResolvedValue(mockMoviesData);

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

    const adminUserResult = await userRepository.findById(adminUserModel.id);
    if (!adminUserResult) {
      throw new Error('Failed to create admin user for tests');
    }
    adminUser = adminUserResult;
  });

  afterAll(async () => {
    await testHelper.clearDatabase();
    await testHelper.close();
  });

  it('should synchronize movies and return success response when admin is authenticated', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/movies/sync')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    expect(response.body).toHaveProperty('success', true);
    expect(response.body).toHaveProperty('count', 2);
    expect(response.body).toHaveProperty('movies');
    expect(response.body.movies).toHaveLength(2);
  });

  it('should update existing movies instead of creating duplicates', async () => {
    const existingMovieData = MovieFactory.createMovieModels()[0];
    await MovieModel.create({
      ...existingMovieData,
      title: 'Old Title',
      opening_crawl: 'Old opening crawl',
    });

    const response = await request(app.getHttpServer())
      .post('/api/movies/sync')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    expect(response.body.count).toBe(2);
  });

  it('should handle empty response from external service', async () => {
    jest
      .spyOn(movieExternalService, 'fetchAllMovies')
      .mockResolvedValueOnce([]);

    const response = await request(app.getHttpServer())
      .post('/api/movies/sync')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    expect(response.body).toHaveProperty('success', true);
    expect(response.body).toHaveProperty('count', 0);
    expect(response.body).toHaveProperty('movies');
    expect(response.body.movies).toHaveLength(0);
  });

  it('should handle external service errors with 503 status code', async () => {
    const externalError = new MovieExternalServiceError(
      'External API error',
      'Service unavailable',
    );

    jest
      .spyOn(movieExternalService, 'fetchAllMovies')
      .mockRejectedValueOnce(externalError);

    const response = await request(app.getHttpServer())
      .post('/api/movies/sync')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(503);

    expect(response.body).toHaveProperty(
      'errorCodeName',
      'EXTERNAL_SERVICE_ERROR',
    );
    expect(response.body.message).toBe('External API error');
    expect(response.body.details).toBe('Service unavailable');
  });

  it('should handle unhandled errors with 500 status code', async () => {
    const genericError = new Error('Unexpected error');

    const syncMoviesUseCase = app.get(SyncMoviesUseCase);
    jest
      .spyOn(syncMoviesUseCase, 'execute')
      .mockRejectedValueOnce(genericError);

    const response = await request(app.getHttpServer())
      .post('/api/movies/sync')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(500);

    expect(response.body).toHaveProperty(
      'errorCodeName',
      'INTERNAL_SERVER_ERROR',
    );
    expect(response.body.message).toBe('An unexpected error occurred');
    expect(response.body.details).toBe('Unexpected error');
  });

  it('should return 401 Unauthorized when no token is provided', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/movies/sync')
      .expect(401);

    expect(response.body).toHaveProperty('errorCodeName', 'TOKEN_NOT_PROVIDED');
    expect(response.body.message).toBe('Token not provided');
    expect(response.body.status).toBe(401);
  });

  it('should return 401 Unauthorized when an invalid token is provided', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/movies/sync')
      .set('Authorization', 'Bearer invalid-token')
      .expect(401);

    expect(response.body).toHaveProperty('errorCodeName', 'INVALID_TOKEN');
  });

  it('should return 403 Forbidden when user does not have required role', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/movies/sync')
      .set('Authorization', `Bearer ${userToken}`)
      .expect(403);

    expect(response.body).toHaveProperty('errorCodeName', 'FORBIDDEN');
    expect(response.body.message).toBe(
      'User does not have required permissions',
    );
    expect(response.body.status).toBe(403);
  });

  it('should return 401 Unauthorized when token is expired', async () => {
    const expiredToken = jwtService.sign(
      {
        sub: adminUser.id,
        email: adminUser.email,
      },
      { expiresIn: '0s' },
    );

    await new Promise((resolve) => setTimeout(resolve, 10));

    const response = await request(app.getHttpServer())
      .post('/api/movies/sync')
      .set('Authorization', `Bearer ${expiredToken}`)
      .expect(401);

    expect(response.body).toHaveProperty('errorCodeName', 'TOKEN_EXPIRED');
  });
});
