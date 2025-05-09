import { Test, TestingModule } from '@nestjs/testing';
import { Logger } from '@nestjs/common';
import { SyncMoviesUseCase } from './sync-movies.use-case';
import { MovieRepository } from '../../../domain/repositories/movie.repository';
import { MovieExternalServiceError } from '../../../domain/errors/movie-external-service-error';
import { MovieFactory } from '../../../test/movie-factory';

describe('SyncMoviesUseCase', () => {
  let useCase: SyncMoviesUseCase;
  let movieRepository: jest.Mocked<MovieRepository>;
  let loggerSpy: jest.SpyInstance;

  const mockMovies = MovieFactory.createDefaultMovies();

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
      count: 3,
      movies: mockMovies.map((movie) => movie.toResponse()),
    });

    expect(loggerSpy).toHaveBeenCalledWith(
      'Starting synchronization of movies from external service',
    );
    expect(loggerSpy).toHaveBeenCalledWith(
      'Successfully synchronized 3 movies',
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
    expect(result.movies[2]).toEqual(mockMovies[2].toResponse());
  });
});
