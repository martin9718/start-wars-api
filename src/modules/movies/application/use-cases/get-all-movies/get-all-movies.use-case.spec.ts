import { Test, TestingModule } from '@nestjs/testing';
import { GetAllMoviesUseCase } from './get-all-movies.use-case';
import { MovieRepository } from '../../../domain/repositories/movie.repository';
import { DatabaseError } from '../../../../shared/infrastructure/database/errors/database-error';
import { MovieFactory } from '../../../test/movie-factory';

describe('GetAllMoviesUseCase', () => {
  let useCase: GetAllMoviesUseCase;
  let movieRepository: jest.Mocked<MovieRepository>;

  const mockMovies = MovieFactory.createDefaultMovies();

  beforeEach(async () => {
    const mockMovieRepository = {
      findAll: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetAllMoviesUseCase,
        {
          provide: MovieRepository,
          useValue: mockMovieRepository,
        },
      ],
    }).compile();

    useCase = module.get<GetAllMoviesUseCase>(GetAllMoviesUseCase);
    movieRepository = module.get<jest.Mocked<MovieRepository>>(MovieRepository);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should return all movies from the repository', async () => {
    movieRepository.findAll.mockResolvedValue(mockMovies);

    const result = await useCase.execute();

    expect(movieRepository.findAll).toHaveBeenCalledTimes(1);

    expect(result).toEqual(mockMovies);
    expect(result).toHaveLength(3);
    expect(result[0].title).toBe('A New Hope');
    expect(result[1].title).toBe('The Empire Strikes Back');
    expect(result[2].title).toBe('Return of the Jedi');
  });

  it('should return empty array when no movies exist', async () => {
    movieRepository.findAll.mockResolvedValue([]);

    const result = await useCase.execute();

    expect(movieRepository.findAll).toHaveBeenCalledTimes(1);

    expect(result).toEqual([]);
    expect(result).toHaveLength(0);
  });

  it('should propagate errors from the repository', async () => {
    const databaseError = new DatabaseError('Database connection error');
    movieRepository.findAll.mockRejectedValue(databaseError);

    await expect(useCase.execute()).rejects.toThrow(DatabaseError);
    expect(movieRepository.findAll).toHaveBeenCalledTimes(1);
  });
});
