import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { JwtService } from '@nestjs/jwt';
import { TestHelper } from '../../../../shared/test/test-helper';
import { RoleModel } from '../../../../shared/infrastructure/database/models/role.model';
import { ROLES } from '../../../../users/domain/types';
import { UserFactory } from '../../../../users/test/user-factory';
import { UserModel } from '../../../../shared/infrastructure/database/models/user.model';
import { CreateMovieUseCase } from '../../../application/use-cases/create-movie/create-movie.use-case';

describe('CreateMovieController (E2E)', () => {
  let app: INestApplication;
  let testHelper: TestHelper;
  let jwtService: JwtService;
  let adminToken: string;
  let userToken: string;

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

  it('should create a movie when user is admin', async () => {
    const movieData = {
      title: 'The Phantom Menace',
      episodeId: 1,
      openingCrawl: 'Turmoil has engulfed the Galactic Republic...',
      director: 'George Lucas',
      producer: 'Rick McCallum',
      releaseDate: '1999-05-19',
    };

    const response = await request(app.getHttpServer())
      .post('/api/movies')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(movieData)
      .expect(201);

    expect(response.body).toHaveProperty('id');
    expect(response.body).toHaveProperty('title', 'The Phantom Menace');
    expect(response.body).toHaveProperty('episodeId', 1);
    expect(response.body).toHaveProperty('director', 'George Lucas');
  });

  it('should create a movie with all optional fields', async () => {
    const fullMovieData = {
      title: 'Attack of the Clones',
      episodeId: 2,
      openingCrawl: 'There is unrest in the Galactic Senate...',
      director: 'George Lucas',
      producer: 'Rick McCallum',
      releaseDate: '2002-05-16',
      url: 'https://example.com/attack-of-clones',
      externalId: 'ep2',
    };

    const response = await request(app.getHttpServer())
      .post('/api/movies')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(fullMovieData)
      .expect(201);

    expect(response.body).toHaveProperty('id');
    expect(response.body).toHaveProperty(
      'url',
      'https://example.com/attack-of-clones',
    );
    expect(response.body).toHaveProperty('externalId', 'ep2');
  });

  it('should return 403 when user is not admin', async () => {
    const movieData = {
      title: 'The Phantom Menace',
      episodeId: 1,
      openingCrawl: 'Turmoil has engulfed the Galactic Republic...',
      director: 'George Lucas',
      producer: 'Rick McCallum',
      releaseDate: '1999-05-19',
    };

    const response = await request(app.getHttpServer())
      .post('/api/movies')
      .set('Authorization', `Bearer ${userToken}`)
      .send(movieData)
      .expect(403);

    expect(response.body).toHaveProperty('errorCodeName', 'FORBIDDEN');
  });

  it('should return 401 when not authenticated', async () => {
    const movieData = {
      title: 'The Phantom Menace',
      episodeId: 1,
      openingCrawl: 'Turmoil has engulfed the Galactic Republic...',
      director: 'George Lucas',
      producer: 'Rick McCallum',
      releaseDate: '1999-05-19',
    };

    const response = await request(app.getHttpServer())
      .post('/api/movies')
      .send(movieData)
      .expect(401);

    expect(response.body).toHaveProperty('errorCodeName', 'TOKEN_NOT_PROVIDED');
  });

  it('should return 400 for incomplete data', async () => {
    const incompleteData = {
      episodeId: 1,
      openingCrawl: 'Turmoil has engulfed the Galactic Republic...',
      director: 'George Lucas',
      producer: 'Rick McCallum',
      releaseDate: '1999-05-19',
    };

    const response = await request(app.getHttpServer())
      .post('/api/movies')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(incompleteData)
      .expect(400);

    expect(response.body).toHaveProperty('errorCodeName', 'VALIDATION_ERROR');
    expect(response.body.details[0]).toContain('title');
  });

  it('should return 400 for invalid data types', async () => {
    const invalidData = {
      title: 'The Phantom Menace',
      episodeId: 'not-a-number',
      openingCrawl: 'Turmoil has engulfed the Galactic Republic...',
      director: 'George Lucas',
      producer: 'Rick McCallum',
      releaseDate: '1999-05-19',
    };

    const response = await request(app.getHttpServer())
      .post('/api/movies')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(invalidData)
      .expect(400);

    expect(response.body).toHaveProperty('errorCodeName', 'VALIDATION_ERROR');
    expect(response.body.details[0]).toContain('episodeId');
  });

  it('should return 400 for invalid date format', async () => {
    const invalidDateData = {
      title: 'The Phantom Menace',
      episodeId: 1,
      openingCrawl: 'Turmoil has engulfed the Galactic Republic...',
      director: 'George Lucas',
      producer: 'Rick McCallum',
      releaseDate: 'not-a-date',
    };

    const response = await request(app.getHttpServer())
      .post('/api/movies')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(invalidDateData)
      .expect(400);

    expect(response.body).toHaveProperty('errorCodeName', 'VALIDATION_ERROR');
    expect(response.body.details[0]).toContain('releaseDate');
  });

  it('should handle database errors with 500 status code', async () => {
    const movieData = {
      title: 'The Phantom Menace',
      episodeId: 1,
      openingCrawl: 'Turmoil has engulfed the Galactic Republic...',
      director: 'George Lucas',
      producer: 'Rick McCallum',
      releaseDate: '1999-05-19',
    };

    const createMovieUseCase = app.get(CreateMovieUseCase);
    jest
      .spyOn(createMovieUseCase, 'execute')
      .mockRejectedValueOnce(new Error('Database error'));

    const response = await request(app.getHttpServer())
      .post('/api/movies')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(movieData)
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

    const movieData = {
      title: 'The Phantom Menace',
      episodeId: 1,
      openingCrawl: 'Turmoil has engulfed the Galactic Republic...',
      director: 'George Lucas',
      producer: 'Rick McCallum',
      releaseDate: '1999-05-19',
    };

    const response = await request(app.getHttpServer())
      .post('/api/movies')
      .set('Authorization', `Bearer ${expiredToken}`)
      .send(movieData)
      .send(movieData)
      .expect(401);

    expect(response.body).toHaveProperty('errorCodeName', 'TOKEN_EXPIRED');
  });
});
