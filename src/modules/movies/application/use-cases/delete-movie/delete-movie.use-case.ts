import { Injectable } from '@nestjs/common';
import { MovieRepository } from '../../../domain/repositories/movie.repository';
import { MovieNotFoundError } from '../../../domain/errors/movie-not-found-error';

@Injectable()
export class DeleteMovieUseCase {
  constructor(private readonly movieRepository: MovieRepository) {}

  async execute(id: string): Promise<void> {
    const exists = await this.movieRepository.findById(id);

    if (!exists) {
      throw new MovieNotFoundError(id);
    }

    const deleted = await this.movieRepository.softDelete(id);

    if (!deleted) {
      throw new MovieNotFoundError(id);
    }
  }
}
