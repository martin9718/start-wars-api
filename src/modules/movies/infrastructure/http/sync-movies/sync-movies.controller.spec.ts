import { Test, TestingModule } from '@nestjs/testing';
import { SyncMoviesController } from './sync-movies.controller';
import { SyncMoviesUseCase } from '../../../application/use-cases/sync-movies/sync-movies.use-case';
import { MovieExternalServiceError } from '../../../domain/errors/movie-external-service-error';
import { MovieFactory } from '../../../test/movie-factory';

describe('SyncMoviesController', () => {
  let controller: SyncMoviesController;
  let syncMoviesUseCase: jest.Mocked<SyncMoviesUseCase>;

  const mockMovies = MovieFactory.createDefaultMovies();

  const mockResponse = {
    success: true,
    count: 3,
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
