import { Test, TestingModule } from '@nestjs/testing';
import { CreateMovieController } from './create-movie.controller';
import { CreateMovieUseCase } from '../../../application/use-cases/create-movie/create-movie.use-case';
import { MovieFactory } from '../../../test/movie-factory';
import { DatabaseError } from '../../../../shared/infrastructure/database/errors/database-error';
import { CreateMovieHttpDto } from './create-movie.http-dto';

describe('CreateMovieController', () => {
  let controller: CreateMovieController;
  let createMovieUseCase: jest.Mocked<CreateMovieUseCase>;

  beforeEach(async () => {
    const mockCreateMovieUseCase = {
      execute: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [CreateMovieController],
      providers: [
        {
          provide: CreateMovieUseCase,
          useValue: mockCreateMovieUseCase,
        },
      ],
    }).compile();

    controller = module.get<CreateMovieController>(CreateMovieController);
    createMovieUseCase =
      module.get<jest.Mocked<CreateMovieUseCase>>(CreateMovieUseCase);
  });

  it('should call createMovieUseCase.execute and return the result', async () => {
    const createMovieDto: CreateMovieHttpDto = {
      title: 'The Phantom Menace',
      episodeId: 1,
      openingCrawl: 'Turmoil has engulfed the Galactic Republic...',
      director: 'George Lucas',
      producer: 'Rick McCallum',
      releaseDate: '1999-05-19',
    };

    const createdMovie = MovieFactory.createMovie({
      id: 'new-movie-id',
      title: createMovieDto.title,
      episodeId: createMovieDto.episodeId,
      openingCrawl: createMovieDto.openingCrawl,
      director: createMovieDto.director,
      producer: createMovieDto.producer,
      releaseDate: new Date(createMovieDto.releaseDate),
    });

    createMovieUseCase.execute.mockResolvedValue(createdMovie);

    const result = await controller.create(createMovieDto);

    expect(createMovieUseCase.execute).toHaveBeenCalledWith({
      ...createMovieDto,
      releaseDate: new Date(createMovieDto.releaseDate),
    });

    expect(result).toEqual(createdMovie);
    expect(result.id).toBe('new-movie-id');
    expect(result.title).toBe('The Phantom Menace');
  });

  it('should convert releaseDate from string to Date', async () => {
    const createMovieDto: CreateMovieHttpDto = {
      title: 'The Phantom Menace',
      episodeId: 1,
      openingCrawl: 'Turmoil has engulfed the Galactic Republic...',
      director: 'George Lucas',
      producer: 'Rick McCallum',
      releaseDate: '1999-05-19',
    };

    createMovieUseCase.execute.mockResolvedValue(MovieFactory.createMovie());

    await controller.create(createMovieDto);

    const executeArgs = createMovieUseCase.execute.mock.calls[0][0];
    expect(executeArgs.releaseDate).toBeInstanceOf(Date);
    expect(executeArgs.releaseDate.toISOString()).toContain('1999-05-19');
  });

  it('should propagate database errors from the use case', async () => {
    const createMovieDto: CreateMovieHttpDto = {
      title: 'The Phantom Menace',
      episodeId: 1,
      openingCrawl: 'Turmoil has engulfed the Galactic Republic...',
      director: 'George Lucas',
      producer: 'Rick McCallum',
      releaseDate: '1999-05-19',
    };

    const dbError = new DatabaseError('Database error');
    createMovieUseCase.execute.mockRejectedValue(dbError);

    await expect(controller.create(createMovieDto)).rejects.toThrow(
      DatabaseError,
    );
    expect(createMovieUseCase.execute).toHaveBeenCalledTimes(1);
  });
});
