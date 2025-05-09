import { Test, TestingModule } from '@nestjs/testing';
import { MovieRepository } from '../../../domain/repositories/movie.repository';
import { DeleteMovieUseCase } from './delete-movie.use-case';
import { Movie } from '../../../domain/entities/movie';
import { MovieNotFoundError } from '../../../domain/errors/movie-not-found-error';

describe('DeleteMovieUseCase', () => {
  let useCase: DeleteMovieUseCase;
  let movieRepository: jest.Mocked<MovieRepository>;

  beforeEach(async () => {
    const movieRepositoryMock = {
      findById: jest.fn(),
      softDelete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeleteMovieUseCase,
        {
          provide: MovieRepository,
          useValue: movieRepositoryMock,
        },
      ],
    }).compile();

    useCase = module.get<DeleteMovieUseCase>(DeleteMovieUseCase);
    movieRepository = module.get<jest.Mocked<MovieRepository>>(MovieRepository);
  });

  it('should soft delete a movie successfully', async () => {
    const movieId = 'movie-id';
    const existingMovie = Movie.create({
      id: movieId,
      title: 'Movie to Delete',
      episodeId: 1,
      openingCrawl: 'Test crawl',
      director: 'Test Director',
      producer: 'Test Producer',
      releaseDate: new Date('2022-01-01'),
      url: 'https://example.com/test',
      externalId: 'ext-123',
    });

    movieRepository.findById.mockResolvedValue(existingMovie);
    movieRepository.softDelete.mockResolvedValue(true);

    await useCase.execute(movieId);

    expect(movieRepository.findById).toHaveBeenCalledWith(movieId);
    expect(movieRepository.softDelete).toHaveBeenCalledWith(movieId);
  });

  it('should throw MovieNotFoundError if movie does not exist', async () => {
    const movieId = 'non-existent-id';

    movieRepository.findById.mockResolvedValue(null);

    await expect(useCase.execute(movieId)).rejects.toThrow(
      new MovieNotFoundError(movieId),
    );
    expect(movieRepository.findById).toHaveBeenCalledWith(movieId);
    expect(movieRepository.softDelete).not.toHaveBeenCalled();
  });

  it('should throw MovieNotFoundError if soft delete operation fails', async () => {
    const movieId = 'movie-id';
    const existingMovie = Movie.create({
      id: movieId,
      title: 'Movie to Delete',
      episodeId: 1,
      openingCrawl: 'Test crawl',
      director: 'Test Director',
      producer: 'Test Producer',
      releaseDate: new Date('2022-01-01'),
      url: 'https://example.com/test',
      externalId: 'ext-123',
    });

    movieRepository.findById.mockResolvedValue(existingMovie);
    movieRepository.softDelete.mockResolvedValue(false);

    await expect(useCase.execute(movieId)).rejects.toThrow(
      new MovieNotFoundError(movieId),
    );
    expect(movieRepository.findById).toHaveBeenCalledWith(movieId);
    expect(movieRepository.softDelete).toHaveBeenCalledWith(movieId);
  });
});
