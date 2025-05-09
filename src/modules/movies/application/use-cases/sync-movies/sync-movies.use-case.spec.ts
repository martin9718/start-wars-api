import { Test, TestingModule } from '@nestjs/testing';
import { Logger } from '@nestjs/common';
import { SyncMoviesUseCase } from './sync-movies.use-case';
import { MovieRepository } from '../../../domain/repositories/movie.repository';
import { Movie } from '../../../domain/entities/movie';
import { MovieExternalServiceError } from '../../../domain/errors/movie-external-service-error';

describe('SyncMoviesUseCase', () => {
  let useCase: SyncMoviesUseCase;
  let movieRepository: jest.Mocked<MovieRepository>;
  let loggerSpy: jest.SpyInstance;

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

  beforeEach(async () => {
    movieRepository = {
      syncMovies: jest.fn(),
      findByExternalId: jest.fn(),
    } as unknown as jest.Mocked<MovieRepository>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SyncMoviesUseCase,
        {
          provide: MovieRepository,
          useValue: movieRepository,
        },
      ],
    }).compile();

    useCase = module.get<SyncMoviesUseCase>(SyncMoviesUseCase);

    loggerSpy = jest
      .spyOn(Logger.prototype, 'log')
      .mockImplementation(() => undefined);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should sync movies successfully', async () => {
    movieRepository.syncMovies.mockResolvedValue(mockMovies);

    const result = await useCase.execute();

    expect(movieRepository.syncMovies).toHaveBeenCalledTimes(1);

    expect(result).toEqual({
      success: true,
      count: 2,
      movies: mockMovies.map((movie) => movie.toResponse()),
    });

    expect(loggerSpy).toHaveBeenCalledWith(
      'Starting synchronization of movies from external service',
    );
    expect(loggerSpy).toHaveBeenCalledWith(
      'Successfully synchronized 2 movies',
    );
  });

  it('should handle errors during sync', async () => {
    const error = new MovieExternalServiceError('Failed to fetch films', '');
    movieRepository.syncMovies.mockRejectedValue(error);

    await expect(useCase.execute()).rejects.toThrow(MovieExternalServiceError);
    expect(movieRepository.syncMovies).toHaveBeenCalledTimes(1);

    expect(loggerSpy).toHaveBeenCalledWith(
      'Starting synchronization of movies from external service',
    );
    expect(loggerSpy).not.toHaveBeenCalledWith(
      expect.stringContaining('Successfully synchronized'),
    );
  });

  it('should return empty array if no movies are synced', async () => {
    movieRepository.syncMovies.mockResolvedValue([]);

    const result = await useCase.execute();

    expect(result).toEqual({
      success: true,
      count: 0,
      movies: [],
    });

    expect(loggerSpy).toHaveBeenCalledWith(
      'Starting synchronization of movies from external service',
    );
    expect(loggerSpy).toHaveBeenCalledWith(
      'Successfully synchronized 0 movies',
    );
  });

  it('should transform movie entities to response format', async () => {
    movieRepository.syncMovies.mockResolvedValue(mockMovies);

    const toResponseSpy = jest.spyOn(mockMovies[0], 'toResponse');

    const result = await useCase.execute();

    expect(toResponseSpy).toHaveBeenCalled();

    expect(result.movies[0]).toEqual(mockMovies[0].toResponse());
    expect(result.movies[1]).toEqual(mockMovies[1].toResponse());
  });
});
