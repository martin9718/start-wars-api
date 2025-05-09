import { Test, TestingModule } from '@nestjs/testing';
import { FindByIdUseCase } from './find-by-id.use-case';
import { MovieRepository } from '../../../domain/repositories/movie.repository';
import { MovieNotFoundError } from '../../../domain/errors/movie-not-found-error';
import { DatabaseError } from '../../../../shared/infrastructure/database/errors/database-error';
import { MovieFactory } from '../../../test/movie-factory';

describe('FindByIdUseCase', () => {
  let useCase: FindByIdUseCase;
  let movieRepository: jest.Mocked<MovieRepository>;

  beforeEach(async () => {
    const mockMovieRepository = {
      findById: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FindByIdUseCase,
        {
          provide: MovieRepository,
          useValue: mockMovieRepository,
        },
      ],
    }).compile();

    useCase = module.get<FindByIdUseCase>(FindByIdUseCase);
    movieRepository = module.get<jest.Mocked<MovieRepository>>(MovieRepository);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should return a movie when it exists', async () => {
    const mockMovie = MovieFactory.createMovie({
      id: 'existing-id',
    });

    movieRepository.findById.mockResolvedValue(mockMovie);

    const result = await useCase.execute('existing-id');

    expect(movieRepository.findById).toHaveBeenCalledWith('existing-id');

    expect(result).toEqual(mockMovie);
    expect(result.id).toBe('existing-id');
    expect(result.title).toBe('A New Hope');
  });

  it('should throw MovieNotFoundError when movie does not exist', async () => {
    movieRepository.findById.mockResolvedValue(null);

    await expect(useCase.execute('non-existent-id')).rejects.toThrow(
      MovieNotFoundError,
    );

    await expect(useCase.execute('non-existent-id')).rejects.toThrow(
      'Movie with id non-existent-id not found',
    );

    expect(movieRepository.findById).toHaveBeenCalledWith('non-existent-id');
  });

  it('should propagate database errors', async () => {
    const databaseError = new DatabaseError('Database connection error');

    movieRepository.findById.mockRejectedValue(databaseError);

    await expect(useCase.execute('any-id')).rejects.toThrow(DatabaseError);

    expect(movieRepository.findById).toHaveBeenCalledWith('any-id');
  });

  it('should handle other types of errors', async () => {
    const genericError = new Error('Some unexpected error');

    movieRepository.findById.mockRejectedValue(genericError);

    await expect(useCase.execute('any-id')).rejects.toThrow(
      'Some unexpected error',
    );

    expect(movieRepository.findById).toHaveBeenCalledWith('any-id');
  });
});
