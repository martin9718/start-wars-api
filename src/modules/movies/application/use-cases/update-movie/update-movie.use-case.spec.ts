import { Test, TestingModule } from '@nestjs/testing';
import { MovieRepository } from '../../../domain/repositories/movie.repository';
import { UpdateMovieUseCase } from './update-movie.use-case';
import { Movie } from '../../../domain/entities/movie';
import { MovieNotFoundError } from '../../../domain/errors/movie-not-found-error';

describe('UpdateMovieUseCase', () => {
  let useCase: UpdateMovieUseCase;
  let movieRepository: jest.Mocked<MovieRepository>;

  beforeEach(async () => {
    const movieRepositoryMock = {
      findById: jest.fn(),
      update: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateMovieUseCase,
        {
          provide: MovieRepository,
          useValue: movieRepositoryMock,
        },
      ],
    }).compile();

    useCase = module.get<UpdateMovieUseCase>(UpdateMovieUseCase);
    movieRepository = module.get(MovieRepository);
  });

  it('should update a movie successfully', async () => {
    const existingMovie = Movie.create({
      id: 'movie-id',
      title: 'Original Title',
      episodeId: 1,
      openingCrawl: 'Original crawl',
      director: 'Original Director',
      producer: 'Original Producer',
      releaseDate: new Date('2022-01-01'),
      url: 'https://example.com/original',
    });

    const updateDto = {
      id: 'movie-id',
      title: 'Updated Title',
      director: 'Updated Director',
      releaseDate: new Date('2023-05-15'),
    };

    const updatedMovie = Movie.create({
      ...existingMovie,
      title: 'Updated Title',
      director: 'Updated Director',
      releaseDate: new Date('2023-05-15'),
    });

    movieRepository.findById.mockResolvedValue(existingMovie);
    movieRepository.update.mockResolvedValue(updatedMovie);

    const result = await useCase.execute(updateDto);

    expect(movieRepository.findById).toHaveBeenCalledWith('movie-id');
    expect(movieRepository.update).toHaveBeenCalledWith('movie-id', {
      title: 'Updated Title',
      director: 'Updated Director',
      releaseDate: new Date('2023-05-15'),
    });

    expect(result).toEqual(updatedMovie);
    expect(result.title).toBe('Updated Title');
    expect(result.director).toBe('Updated Director');
    expect(result.releaseDate).toEqual(new Date('2023-05-15'));
    expect(result.episodeId).toBe(existingMovie.episodeId);
    expect(result.openingCrawl).toBe(existingMovie.openingCrawl);
  });

  it('should throw MovieNotFoundError if movie does not exist', async () => {
    const updateDto = {
      id: 'non-existent-id',
      title: 'Updated Title',
    };

    movieRepository.findById.mockResolvedValue(null);

    await expect(useCase.execute(updateDto)).rejects.toThrow(
      new MovieNotFoundError('non-existent-id'),
    );
    expect(movieRepository.findById).toHaveBeenCalledWith('non-existent-id');
    expect(movieRepository.update).not.toHaveBeenCalled();
  });

  it('should throw MovieNotFoundError if update returns null', async () => {
    const existingMovie = Movie.create({
      id: 'movie-id',
      title: 'Original Title',
      episodeId: 1,
      openingCrawl: 'Original crawl',
      director: 'Original Director',
      producer: 'Original Producer',
      releaseDate: new Date('2022-01-01'),
      url: 'https://example.com/original',
    });

    const updateDto = {
      id: 'movie-id',
      title: 'Updated Title',
    };

    movieRepository.findById.mockResolvedValue(existingMovie);
    movieRepository.update.mockResolvedValue(null);

    await expect(useCase.execute(updateDto)).rejects.toThrow(
      new MovieNotFoundError('movie-id'),
    );
    expect(movieRepository.findById).toHaveBeenCalledWith('movie-id');
    expect(movieRepository.update).toHaveBeenCalledWith('movie-id', {
      title: 'Updated Title',
    });
  });
});
