import { Test, TestingModule } from '@nestjs/testing';
import { UpdateMovieController } from './update-movie.controller';
import { UpdateMovieUseCase } from '../../../application/use-cases/update-movie/update-movie.use-case';
import { MovieFactory } from '../../../test/movie-factory';
import { DatabaseError } from '../../../../shared/infrastructure/database/errors/database-error';
import { UpdateMovieHttpDto } from './update-movie.http-dto';
import { MovieNotFoundError } from '../../../domain/errors/movie-not-found-error';

describe('UpdateMovieController', () => {
  let controller: UpdateMovieController;
  let updateMovieUseCase: jest.Mocked<UpdateMovieUseCase>;

  beforeEach(async () => {
    const mockUpdateMovieUseCase = {
      execute: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UpdateMovieController],
      providers: [
        {
          provide: UpdateMovieUseCase,
          useValue: mockUpdateMovieUseCase,
        },
      ],
    }).compile();

    controller = module.get<UpdateMovieController>(UpdateMovieController);
    updateMovieUseCase =
      module.get<jest.Mocked<UpdateMovieUseCase>>(UpdateMovieUseCase);
  });

  it('should call updateMovieUseCase.execute and return the result', async () => {
    const movieId = 'movie-123';
    const updateMovieDto: UpdateMovieHttpDto = {
      title: 'Updated Phantom Menace',
      director: 'George Lucas',
      producer: 'Rick McCallum',
      releaseDate: '1999-05-20',
    };

    const updatedMovie = MovieFactory.createMovie({
      id: movieId,
      title: updateMovieDto.title,
      director: updateMovieDto.director,
      producer: updateMovieDto.producer,
    });

    updateMovieUseCase.execute.mockResolvedValue(updatedMovie);

    const result = await controller.update(movieId, updateMovieDto);

    expect(result).toEqual(updatedMovie);
    expect(result.id).toBe(movieId);
    expect(result.title).toBe('Updated Phantom Menace');
  });

  it('should convert releaseDate from string to Date when provided', async () => {
    const movieId = 'movie-123';
    const updateMovieDto: UpdateMovieHttpDto = {
      title: 'Updated Title',
      releaseDate: '2023-01-15',
    };

    updateMovieUseCase.execute.mockResolvedValue(MovieFactory.createMovie());

    await controller.update(movieId, updateMovieDto);

    const executeArgs = updateMovieUseCase.execute.mock.calls[0][0];
    expect(executeArgs.releaseDate).toBeInstanceOf(Date);
  });

  it('should not send undefined releaseDate if not provided', async () => {
    const movieId = 'movie-123';
    const updateMovieDto: UpdateMovieHttpDto = {
      title: 'Updated Title',
    };

    updateMovieUseCase.execute.mockResolvedValue(MovieFactory.createMovie());

    await controller.update(movieId, updateMovieDto);

    const executeArgs = updateMovieUseCase.execute.mock.calls[0][0];
    expect(executeArgs.releaseDate).toBeUndefined();
  });

  it('should propagate database errors from the use case', async () => {
    const movieId = 'movie-123';
    const updateMovieDto: UpdateMovieHttpDto = {
      title: 'Updated Title',
    };

    const dbError = new DatabaseError('Database error');
    updateMovieUseCase.execute.mockRejectedValue(dbError);

    await expect(controller.update(movieId, updateMovieDto)).rejects.toThrow(
      DatabaseError,
    );
    expect(updateMovieUseCase.execute).toHaveBeenCalledTimes(1);
  });

  it('should propagate not found errors from the use case', async () => {
    const movieId = 'non-existent-movie';
    const updateMovieDto: UpdateMovieHttpDto = {
      title: 'Updated Title',
    };

    const notFoundError = new MovieNotFoundError(movieId);
    updateMovieUseCase.execute.mockRejectedValue(notFoundError);

    await expect(controller.update(movieId, updateMovieDto)).rejects.toThrow(
      MovieNotFoundError,
    );
    expect(updateMovieUseCase.execute).toHaveBeenCalledTimes(1);
  });
});
