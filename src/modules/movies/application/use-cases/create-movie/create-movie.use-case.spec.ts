import { Test, TestingModule } from '@nestjs/testing';
import { CreateMovieUseCase } from './create-movie.use-case';
import { MovieRepository } from '../../../domain/repositories/movie.repository';
import { Movie } from '../../../domain/entities/movie';
import { DatabaseError } from '../../../../shared/infrastructure/database/errors/database-error';
import { MovieFactory } from '../../../test/movie-factory';

describe('CreateMovieUseCase', () => {
  let useCase: CreateMovieUseCase;
  let movieRepository: jest.Mocked<MovieRepository>;

  beforeEach(async () => {
    const mockMovieRepository = {
      create: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateMovieUseCase,
        {
          provide: MovieRepository,
          useValue: mockMovieRepository,
        },
      ],
    }).compile();

    useCase = module.get<CreateMovieUseCase>(CreateMovieUseCase);
    movieRepository = module.get<jest.Mocked<MovieRepository>>(MovieRepository);
  });

  it('should create a movie successfully', async () => {
    const createMovieDto = {
      title: 'The Phantom Menace',
      episodeId: 1,
      openingCrawl: 'Turmoil has engulfed the Galactic Republic...',
      director: 'George Lucas',
      producer: 'Rick McCallum',
      releaseDate: new Date('1999-05-19'),
      url: 'https://example.com/phantom-menace',
    };

    const createdMovie = MovieFactory.createMovie({
      id: 'new-movie-id',
      title: createMovieDto.title,
      episodeId: createMovieDto.episodeId,
      openingCrawl: createMovieDto.openingCrawl,
      director: createMovieDto.director,
      producer: createMovieDto.producer,
      releaseDate: createMovieDto.releaseDate,
      url: createMovieDto.url,
    });

    movieRepository.create.mockResolvedValue(createdMovie);

    const result = await useCase.execute(createMovieDto);

    expect(result).toEqual(createdMovie);
    expect(result.id).toBe('new-movie-id');
    expect(result.title).toBe('The Phantom Menace');
    expect(result.episodeId).toBe(1);
    expect(result.url).toBe('https://example.com/phantom-menace');

    expect(movieRepository.create).toHaveBeenCalledTimes(1);

    const moviePassedToRepo = movieRepository.create.mock.calls[0][0];
    expect(moviePassedToRepo).toBeInstanceOf(Movie);
    expect(moviePassedToRepo.title).toBe('The Phantom Menace');
    expect(moviePassedToRepo.episodeId).toBe(1);
    expect(moviePassedToRepo.director).toBe('George Lucas');
  });

  it('should work with minimal required data', async () => {
    const minimalDto = {
      title: 'Minimal Movie',
      episodeId: 10,
      openingCrawl: 'Short crawl',
      director: 'Director',
      producer: 'Producer',
      releaseDate: new Date('2020-01-01'),
    };

    const createdMovie = MovieFactory.createMovie({
      id: 'minimal-id',
      title: minimalDto.title,
      episodeId: minimalDto.episodeId,
      openingCrawl: minimalDto.openingCrawl,
      director: minimalDto.director,
      producer: minimalDto.producer,
      releaseDate: minimalDto.releaseDate,
      url: '',
    });

    movieRepository.create.mockResolvedValue(createdMovie);

    const result = await useCase.execute(minimalDto);

    expect(result.id).toBe('minimal-id');
    expect(result.title).toBe('Minimal Movie');

    const moviePassedToRepo = movieRepository.create.mock.calls[0][0];
    expect(moviePassedToRepo.url).toBe('');
    expect(moviePassedToRepo.externalId).toBeUndefined();
  });

  it('should propagate database errors', async () => {
    const createMovieDto = {
      title: 'Error Movie',
      episodeId: 999,
      openingCrawl: 'Error crawl',
      director: 'Error Director',
      producer: 'Error Producer',
      releaseDate: new Date('2025-01-01'),
    };

    const dbError = new DatabaseError('Database error');
    movieRepository.create.mockRejectedValue(dbError);

    await expect(useCase.execute(createMovieDto)).rejects.toThrow(
      DatabaseError,
    );

    expect(movieRepository.create).toHaveBeenCalledTimes(1);
  });
});
