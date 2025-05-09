import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { TestHelper } from '../../../../shared/test/test-helper';
import { MovieExternalService } from '../../../domain/services/movie-external-service';
import { MovieModel } from '../../../../shared/infrastructure/database/models/movie.model';
import { MovieExternalServiceError } from '../../../domain/errors/movie-external-service-error';
import { SyncMoviesUseCase } from '../../../application/use-cases/sync-movies/sync-movies.use-case';

describe('SyncMoviesController (E2E)', () => {
  let app: INestApplication;
  let testHelper: TestHelper;
  let movieExternalService: MovieExternalService;

  const mockMoviesData = [
    {
      title: 'A New Hope',
      episodeId: 4,
      openingCrawl: 'It is a period of civil war...',
      director: 'George Lucas',
      producer: 'Gary Kurtz, Rick McCallum',
      releaseDate: new Date('1977-05-25'),
      url: 'https://swapi.py4e.com/api/films/1/',
      externalId: '1',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      title: 'The Empire Strikes Back',
      episodeId: 5,
      openingCrawl: 'It is a dark time for the Rebellion...',
      director: 'Irvin Kershner',
      producer: 'Gary Kurtz, Rick McCallum',
      releaseDate: new Date('1980-05-17'),
      url: 'https://swapi.py4e.com/api/films/2/',
      externalId: '2',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  beforeAll(async () => {
    testHelper = new TestHelper();
    await testHelper.init();
    app = testHelper.getApp();

    movieExternalService = app.get(MovieExternalService);
  });

  beforeEach(async () => {
    await testHelper.clearDatabase();

    jest
      .spyOn(movieExternalService, 'fetchAllMovies')
      .mockResolvedValue(mockMoviesData);
  });

  afterAll(async () => {
    await testHelper.clearDatabase();
    await testHelper.close();
  });

  it('should synchronize movies and return success response', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/movies/sync')
      .expect(200);

    expect(response.body).toHaveProperty('success', true);
    expect(response.body).toHaveProperty('count', 2);
    expect(response.body).toHaveProperty('movies');
    expect(response.body.movies).toHaveLength(2);
  });

  it('should update existing movies instead of creating duplicates', async () => {
    await MovieModel.create({
      title: 'Old Title',
      episode_id: 4,
      opening_crawl: 'Old opening crawl',
      director: 'Old Director',
      producer: 'Old Producer',
      release_date: new Date('1977-05-25'),
      url: 'https://swapi.py4e.com/api/films/1/',
      external_id: '1',
    });

    const response = await request(app.getHttpServer())
      .post('/api/movies/sync')
      .expect(200);

    expect(response.body.count).toBe(2);
  });

  it('should handle empty response from external service', async () => {
    jest
      .spyOn(movieExternalService, 'fetchAllMovies')
      .mockResolvedValueOnce([]);

    const response = await request(app.getHttpServer())
      .post('/api/movies/sync')
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
      .expect(503);

    expect(response.body).toHaveProperty(
      'errorCodeName',
      'EXTERNAL_SERVICE_ERROR',
    );
    expect(response.body.message).toBe('External API error');
    expect(response.body.details).toBe('Service unavailable');
  });

  it('should handle unhandled errors with 500 status code', async () => {
    const genericError = new Error('Unexpected database failure');

    const syncMoviesUseCase = app.get(SyncMoviesUseCase);
    jest
      .spyOn(syncMoviesUseCase, 'execute')
      .mockRejectedValueOnce(genericError);

    const response = await request(app.getHttpServer())
      .post('/api/movies/sync')
      .expect(500);

    expect(response.body).toHaveProperty(
      'errorCodeName',
      'INTERNAL_SERVER_ERROR',
    );
    expect(response.body.message).toBe('An unexpected error occurred');
    expect(response.body.details).toBe('Unexpected database failure');
  });
});
