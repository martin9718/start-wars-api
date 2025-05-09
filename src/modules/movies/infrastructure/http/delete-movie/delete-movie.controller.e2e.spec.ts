import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { JwtService } from '@nestjs/jwt';
import { TestHelper } from '../../../../shared/test/test-helper';
import { RoleModel } from '../../../../shared/infrastructure/database/models/role.model';
import { ROLES } from '../../../../users/domain/types';
import { UserFactory } from '../../../../users/test/user-factory';
import { UserModel } from '../../../../shared/infrastructure/database/models/user.model';
import { DeleteMovieUseCase } from '../../../application/use-cases/delete-movie/delete-movie.use-case';
import { MovieModel } from '../../../../shared/infrastructure/database/models/movie.model';
import { MovieFactory } from '../../../test/movie-factory';

describe('DeleteMovieController (E2E)', () => {
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

    const movieData = {
      ...MovieFactory.createMovieModels()[0],
      external_id: `test-ext-${Date.now()}`,
    };
    const movieModel = await MovieModel.create(movieData);
    existingMovieId = movieModel.id;
  });

  afterAll(async () => {
    await testHelper.clearDatabase();
    await testHelper.close();
  });

  it('should soft delete a movie when user is admin', async () => {
    await request(app.getHttpServer())
      .delete(`/api/movies/${existingMovieId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(204);

    const deletedMovie = await MovieModel.findByPk(existingMovieId);
    expect(deletedMovie).toBeNull();

    const movieWithParanoid = await MovieModel.findByPk(existingMovieId, {
      paranoid: false,
    });
    expect(movieWithParanoid).not.toBeNull();
    expect(movieWithParanoid?.deleted_at).not.toBeNull();
  });

  it('should return 404 when movie does not exist', async () => {
    const nonExistentId = '00000000-0000-0000-0000-000000000000';

    const response = await request(app.getHttpServer())
      .delete(`/api/movies/${nonExistentId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(404);

    expect(response.body).toHaveProperty('errorCodeName', 'MOVIE_NOT_FOUND');
  });

  it('should return 403 when user is not admin', async () => {
    const response = await request(app.getHttpServer())
      .delete(`/api/movies/${existingMovieId}`)
      .set('Authorization', `Bearer ${userToken}`)
      .expect(403);

    expect(response.body).toHaveProperty('errorCodeName', 'FORBIDDEN');

    const movieStillExists = await MovieModel.findByPk(existingMovieId);
    expect(movieStillExists).not.toBeNull();
  });

  it('should return 401 when not authenticated', async () => {
    const response = await request(app.getHttpServer())
      .delete(`/api/movies/${existingMovieId}`)
      .expect(401);

    expect(response.body).toHaveProperty('errorCodeName', 'TOKEN_NOT_PROVIDED');

    const movieStillExists = await MovieModel.findByPk(existingMovieId);
    expect(movieStillExists).not.toBeNull();
  });

  it('should handle database errors with 500 status code', async () => {
    const deleteMovieUseCase = app.get(DeleteMovieUseCase);
    jest
      .spyOn(deleteMovieUseCase, 'execute')
      .mockRejectedValueOnce(new Error('Database error'));

    const response = await request(app.getHttpServer())
      .delete(`/api/movies/${existingMovieId}`)
      .set('Authorization', `Bearer ${adminToken}`)
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

    const response = await request(app.getHttpServer())
      .delete(`/api/movies/${existingMovieId}`)
      .set('Authorization', `Bearer ${expiredToken}`)
      .expect(401);

    expect(response.body).toHaveProperty('errorCodeName', 'TOKEN_EXPIRED');
  });
});
