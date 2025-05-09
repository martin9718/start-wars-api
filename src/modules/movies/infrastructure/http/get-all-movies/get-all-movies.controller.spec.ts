import { Test, TestingModule } from '@nestjs/testing';
import { GetAllMoviesController } from './get-all-movies.controller';
import { GetAllMoviesUseCase } from '../../../application/use-cases/get-all-movies/get-all-movies.use-case';
import { DatabaseError } from '../../../../shared/infrastructure/database/errors/database-error';
import { MovieFactory } from '../../../test/movie-factory';

describe('GetAllMoviesController', () => {
  let controller: GetAllMoviesController;
  let getAllMoviesUseCase: jest.Mocked<GetAllMoviesUseCase>;

  const mockMovies = MovieFactory.createDefaultMovies();

  beforeEach(async () => {
    const mockGetAllMoviesUseCase = {
      execute: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [GetAllMoviesController],
      providers: [
        {
          provide: GetAllMoviesUseCase,
          useValue: mockGetAllMoviesUseCase,
        },
      ],
    }).compile();

    controller = module.get<GetAllMoviesController>(GetAllMoviesController);
    getAllMoviesUseCase =
      module.get<jest.Mocked<GetAllMoviesUseCase>>(GetAllMoviesUseCase);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call getAllMoviesUseCase.execute and return the result', async () => {
    getAllMoviesUseCase.execute.mockResolvedValue(mockMovies);

    const result = await controller.getAllMovies();

    expect(getAllMoviesUseCase.execute).toHaveBeenCalledTimes(1);

    expect(result).toEqual(mockMovies);
    expect(result).toHaveLength(3);
    expect(result[0].title).toBe('A New Hope');
    expect(result[1].title).toBe('The Empire Strikes Back');
    expect(result[2].title).toBe('Return of the Jedi');
  });

  it('should propagate errors from the use case', async () => {
    const error = new DatabaseError('Database error');
    getAllMoviesUseCase.execute.mockRejectedValue(error);

    await expect(controller.getAllMovies()).rejects.toThrow(DatabaseError);
    expect(getAllMoviesUseCase.execute).toHaveBeenCalledTimes(1);
  });

  it('should return empty array when no movies exist', async () => {
    getAllMoviesUseCase.execute.mockResolvedValue([]);

    const result = await controller.getAllMovies();

    expect(getAllMoviesUseCase.execute).toHaveBeenCalledTimes(1);
    expect(result).toEqual([]);
    expect(result).toHaveLength(0);
  });
});
