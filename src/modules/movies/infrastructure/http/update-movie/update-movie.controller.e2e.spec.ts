import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { JwtService } from '@nestjs/jwt';
import { TestHelper } from '../../../../shared/test/test-helper';
import { RoleModel } from '../../../../shared/infrastructure/database/models/role.model';
import { ROLES } from '../../../../users/domain/types';
import { UserFactory } from '../../../../users/test/user-factory';
import { UserModel } from '../../../../shared/infrastructure/database/models/user.model';
import { UpdateMovieUseCase } from '../../../application/use-cases/update-movie/update-movie.use-case';
import { MovieModel } from '../../../../shared/infrastructure/database/models/movie.model';
import { MovieFactory } from '../../../test/movie-factory';

describe('UpdateMovieController (E2E)', () => {
  let app: INestApplication;
  let testHelper: TestHelper;
  let jwtService: JwtService;
  let adminToken: string;
  let userToken: string;
  let existingMovieId: string;

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
    existingMovieId = movieModel.id;
  });

  afterAll(async () => {
    await testHelper.clearDatabase();
    await testHelper.close();
  });

  it('should update a movie when user is admin', async () => {
    const updateData = {
      title: 'A New Hope (Special Edition)',
      director: 'George Lucas',
      releaseDate: '1997-01-31',
    };

    const response = await request(app.getHttpServer())
      .put(`/api/movies/${existingMovieId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send(updateData)
      .expect(200);

    expect(response.body).toHaveProperty('id', existingMovieId);
    expect(response.body).toHaveProperty(
      'title',
      'A New Hope (Special Edition)',
    );
    expect(response.body).toHaveProperty('director', 'George Lucas');
  });

  it('should update only the provided fields', async () => {
    const updateData = {
      title: 'A New Hope (Remastered)',
    };

    const response = await request(app.getHttpServer())
      .put(`/api/movies/${existingMovieId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send(updateData)
      .expect(200);

    expect(response.body).toHaveProperty('id', existingMovieId);
    expect(response.body).toHaveProperty('title', 'A New Hope (Remastered)');

    expect(response.body).toHaveProperty('director', 'George Lucas');
    expect(response.body).toHaveProperty('episodeId', 4);
  });

  it('should return 404 when movie does not exist', async () => {
    const nonExistentId = '00000000-0000-0000-0000-000000000000';
    const updateData = {
      title: 'This Movie Does Not Exist',
    };

    const response = await request(app.getHttpServer())
      .put(`/api/movies/${nonExistentId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send(updateData)
      .expect(404);

    expect(response.body).toHaveProperty('errorCodeName', 'MOVIE_NOT_FOUND');
  });

  it('should return 403 when user is not admin', async () => {
    const updateData = {
      title: 'Unauthorized Update',
    };

    const response = await request(app.getHttpServer())
      .put(`/api/movies/${existingMovieId}`)
      .set('Authorization', `Bearer ${userToken}`)
      .send(updateData)
      .expect(403);

    expect(response.body).toHaveProperty('errorCodeName', 'FORBIDDEN');
  });

  it('should return 401 when not authenticated', async () => {
    const updateData = {
      title: 'Unauthenticated Update',
    };

    const response = await request(app.getHttpServer())
      .put(`/api/movies/${existingMovieId}`)
      .send(updateData)
      .expect(401);

    expect(response.body).toHaveProperty('errorCodeName', 'TOKEN_NOT_PROVIDED');
  });

  it('should return 400 for invalid data types', async () => {
    const invalidData = {
      episodeId: 'not-a-number',
    };

    const response = await request(app.getHttpServer())
      .put(`/api/movies/${existingMovieId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send(invalidData)
      .expect(400);

    expect(response.body).toHaveProperty('errorCodeName', 'VALIDATION_ERROR');
    expect(response.body.details[0]).toContain('episodeId');
  });

  it('should return 400 for invalid date format', async () => {
    const invalidDateData = {
      releaseDate: 'not-a-date',
    };

    const response = await request(app.getHttpServer())
      .put(`/api/movies/${existingMovieId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send(invalidDateData)
      .expect(400);

    expect(response.body).toHaveProperty('errorCodeName', 'VALIDATION_ERROR');
    expect(response.body.details[0]).toContain('releaseDate');
  });

  it('should handle database errors with 500 status code', async () => {
    const updateData = {
      title: 'Database Error Test',
    };

    const updateMovieUseCase = app.get(UpdateMovieUseCase);
    jest
      .spyOn(updateMovieUseCase, 'execute')
      .mockRejectedValueOnce(new Error('Database error'));

    const response = await request(app.getHttpServer())
      .put(`/api/movies/${existingMovieId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send(updateData)
      .expect(500);

    expect(response.body).toHaveProperty(
      'errorCodeName',
      'INTERNAL_SERVER_ERROR',
    );
  });

  it('should return 401 when token is expired', async () => {
    const expiredToken = jwtService.sign(
      {
        sub: UserFactory.createUserModels()[0].id,
        email: 'admin@example.com',
      },
      { expiresIn: '0s' },
    );

    await new Promise((resolve) => setTimeout(resolve, 10));

    const updateData = {
      title: 'Expired Token Test',
    };

    const response = await request(app.getHttpServer())
      .put(`/api/movies/${existingMovieId}`)
      .set('Authorization', `Bearer ${expiredToken}`)
      .send(updateData)
      .expect(401);

    expect(response.body).toHaveProperty('errorCodeName', 'TOKEN_EXPIRED');
  });
});
