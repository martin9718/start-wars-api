import { Test, TestingModule } from '@nestjs/testing';
import { FindByIdUseCase } from '../../../application/use-cases/find-by-id/find-by-id.use-case';
import { MovieNotFoundError } from '../../../domain/errors/movie-not-found-error';
import { MovieFactory } from '../../../test/movie-factory';
import { DatabaseError } from '../../../../shared/infrastructure/database/errors/database-error';
import { FindMovieByIdController } from './find-by-id.controller';

describe('FindMovieByIdController', () => {
  let controller: FindMovieByIdController;
  let findByIdUseCase: jest.Mocked<FindByIdUseCase>;

  beforeEach(async () => {
    const mockFindByIdUseCase = {
      execute: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [FindMovieByIdController],
      providers: [
        {
          provide: FindByIdUseCase,
          useValue: mockFindByIdUseCase,
        },
      ],
    }).compile();

    controller = module.get<FindMovieByIdController>(FindMovieByIdController);
    findByIdUseCase = module.get<jest.Mocked<FindByIdUseCase>>(FindByIdUseCase);
  });

  it('should call findByIdUseCase.execute and return the result', async () => {
    const mockMovie = MovieFactory.createMovie({
      id: 'test-id',
    });

    findByIdUseCase.execute.mockResolvedValue(mockMovie);

    const result = await controller.findById('test-id');

    expect(findByIdUseCase.execute).toHaveBeenCalledWith('test-id');

    expect(result).toEqual(mockMovie);
    expect(result.id).toBe('test-id');
    expect(result.title).toBe('A New Hope');
  });

  it('should propagate MovieNotFoundError from the use case', async () => {
    const notFoundError = new MovieNotFoundError('non-existent-id');
    findByIdUseCase.execute.mockRejectedValue(notFoundError);

    await expect(controller.findById('non-existent-id')).rejects.toThrow(
      MovieNotFoundError,
    );
    expect(findByIdUseCase.execute).toHaveBeenCalledWith('non-existent-id');
  });

  it('should propagate database errors from the use case', async () => {
    const dbError = new DatabaseError('Database error');
    findByIdUseCase.execute.mockRejectedValue(dbError);

    await expect(controller.findById('any-id')).rejects.toThrow(DatabaseError);
    expect(findByIdUseCase.execute).toHaveBeenCalledWith('any-id');
  });
});
