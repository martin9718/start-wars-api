import { Test, TestingModule } from '@nestjs/testing';
import { SyncMoviesController } from './sync-movies.controller';
import { SyncMoviesUseCase } from '../../../application/use-cases/sync-movies/sync-movies.use-case';
import { Movie } from '../../../domain/entities/movie';
import { MovieExternalServiceError } from '../../../domain/errors/movie-external-service-error';

describe('SyncMoviesController', () => {
  let controller: SyncMoviesController;
  let syncMoviesUseCase: jest.Mocked<SyncMoviesUseCase>;

  const mockMovies = [
    Movie.create({
      id: '1',
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
    }),
    Movie.create({
      id: '2',
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
    }),
  ];

  const mockResponse = {
    success: true,
    count: 2,
    movies: mockMovies.map((movie) => movie.toResponse()),
  };

  beforeEach(async () => {
    const syncMoviesUseCaseMock = {
      execute: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [SyncMoviesController],
      providers: [
        {
          provide: SyncMoviesUseCase,
          useValue: syncMoviesUseCaseMock,
        },
      ],
    }).compile();

    controller = module.get<SyncMoviesController>(SyncMoviesController);
    syncMoviesUseCase = module.get(SyncMoviesUseCase);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call syncMoviesUseCase.execute and return the result', async () => {
    syncMoviesUseCase.execute.mockResolvedValue(mockResponse);

    const result = await controller.syncMovies();

    expect(syncMoviesUseCase.execute).toHaveBeenCalledTimes(1);

    expect(result).toEqual(mockResponse);
  });

  it('should propagate errors from the use case', async () => {
    const error = new MovieExternalServiceError('Failed to sync movies', '');
    syncMoviesUseCase.execute.mockRejectedValue(error);

    await expect(controller.syncMovies()).rejects.toThrow(
      MovieExternalServiceError,
    );
    expect(syncMoviesUseCase.execute).toHaveBeenCalledTimes(1);
  });
});
