import { Test, TestingModule } from '@nestjs/testing';
import { DeleteMovieController } from './delete-movie.controller';
import { DeleteMovieUseCase } from '../../../application/use-cases/delete-movie/delete-movie.use-case';
import { MovieNotFoundError } from '../../../domain/errors/movie-not-found-error';
import { DatabaseError } from '../../../../shared/infrastructure/database/errors/database-error';

describe('DeleteMovieController', () => {
  let controller: DeleteMovieController;
  let deleteMovieUseCase: jest.Mocked<DeleteMovieUseCase>;

  beforeEach(async () => {
    const mockDeleteMovieUseCase = {
      execute: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [DeleteMovieController],
      providers: [
        {
          provide: DeleteMovieUseCase,
          useValue: mockDeleteMovieUseCase,
        },
      ],
    }).compile();

    controller = module.get<DeleteMovieController>(DeleteMovieController);
    deleteMovieUseCase =
      module.get<jest.Mocked<DeleteMovieUseCase>>(DeleteMovieUseCase);
  });

  it('should call deleteMovieUseCase.execute with the correct ID', async () => {
    const movieId = 'movie-to-delete-id';

    deleteMovieUseCase.execute.mockResolvedValue(undefined);

    await controller.delete(movieId);

    expect(deleteMovieUseCase.execute).toHaveBeenCalledWith(movieId);
  });

  it('should propagate not found errors from the use case', async () => {
    const movieId = 'non-existent-movie';

    const notFoundError = new MovieNotFoundError(movieId);
    deleteMovieUseCase.execute.mockRejectedValue(notFoundError);

    await expect(controller.delete(movieId)).rejects.toThrow(
      MovieNotFoundError,
    );
    expect(deleteMovieUseCase.execute).toHaveBeenCalledTimes(1);
  });

  it('should propagate database errors from the use case', async () => {
    const movieId = 'movie-id';

    const dbError = new DatabaseError('Database error');
    deleteMovieUseCase.execute.mockRejectedValue(dbError);

    await expect(controller.delete(movieId)).rejects.toThrow(DatabaseError);
    expect(deleteMovieUseCase.execute).toHaveBeenCalledTimes(1);
  });
});
