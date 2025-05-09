import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { JwtService } from '@nestjs/jwt';
import { TestHelper } from '../../../../shared/test/test-helper';
import { RoleModel } from '../../../../shared/infrastructure/database/models/role.model';
import { ROLES } from '../../../../users/domain/types';
import { UserFactory } from '../../../../users/test/user-factory';
import { UserModel } from '../../../../shared/infrastructure/database/models/user.model';
import { MovieModel } from '../../../../shared/infrastructure/database/models/movie.model';
import { MovieFactory } from '../../../test/movie-factory';
import { FindByIdUseCase } from '../../../application/use-cases/find-by-id/find-by-id.use-case';

describe('FindMovieByIdController (E2E)', () => {
  let app: INestApplication;
  let testHelper: TestHelper;
  let jwtService: JwtService;
  let adminToken: string;
  let userToken: string;
  let movieId: string;

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

    const movieModel = await MovieModel.create(
      MovieFactory.createMovieModels()[0],
    );
    movieId = movieModel.id;
  });

  afterAll(async () => {
    await testHelper.clearDatabase();
    await testHelper.close();
  });

  it('should return a movie when it exists and user has USER role', async () => {
    const response = await request(app.getHttpServer())
      .get(`/api/movies/${movieId}`)
      .set('Authorization', `Bearer ${userToken}`)
      .expect(200);

    expect(response.body).toHaveProperty('id', movieId);
    expect(response.body).toHaveProperty('title', 'A New Hope');
    expect(response.body).toHaveProperty('episodeId', 4);
    expect(response.body).toHaveProperty('director', 'George Lucas');
  });

  it('should return 403 Forbidden when user is an admin without USER role', async () => {
    const response = await request(app.getHttpServer())
      .get(`/api/movies/${movieId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(403);

    expect(response.body).toHaveProperty('errorCodeName', 'FORBIDDEN');
    expect(response.body.message).toBe(
      'User does not have required permissions',
    );
  });

  it('should return 404 when movie does not exist', async () => {
    const nonExistentId = '00000000-0000-0000-0000-000000000000';

    const response = await request(app.getHttpServer())
      .get(`/api/movies/${nonExistentId}`)
      .set('Authorization', `Bearer ${userToken}`)
      .expect(404);

    expect(response.body).toHaveProperty('errorCodeName', 'MOVIE_NOT_FOUND');
    expect(response.body.message).toContain(nonExistentId);
  });

  it('should return 401 when not authenticated', async () => {
    const response = await request(app.getHttpServer())
      .get(`/api/movies/${movieId}`)
      .expect(401);

    expect(response.body).toHaveProperty('errorCodeName', 'TOKEN_NOT_PROVIDED');
  });

  it('should return 401 when token is invalid', async () => {
    const response = await request(app.getHttpServer())
      .get(`/api/movies/${movieId}`)
      .set('Authorization', 'Bearer invalid_token')
      .expect(401);

    expect(response.body).toHaveProperty('errorCodeName', 'INVALID_TOKEN');
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
      .get(`/api/movies/${movieId}`)
      .set('Authorization', `Bearer ${expiredToken}`)
      .expect(401);

    expect(response.body).toHaveProperty('errorCodeName', 'TOKEN_EXPIRED');
  });

  it('should handle database errors with 500 status code', async () => {
    const findByIdUseCase = app.get(FindByIdUseCase);
    jest
      .spyOn(findByIdUseCase, 'execute')
      .mockRejectedValueOnce(new Error('Database connection error'));

    const response = await request(app.getHttpServer())
      .get(`/api/movies/${movieId}`)
      .set('Authorization', `Bearer ${userToken}`)
      .expect(500);

    expect(response.body).toHaveProperty(
      'errorCodeName',
      'INTERNAL_SERVER_ERROR',
    );
  });
});
