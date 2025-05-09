import { Injectable } from '@nestjs/common';
import { MovieRepository } from '../../../domain/repositories/movie.repository';
import { Movie } from '../../../domain/entities/movie';
import { MovieNotFoundError } from '../../../domain/errors/movie-not-found-error';

@Injectable()
export class FindByIdUseCase {
  constructor(private readonly movieRepository: MovieRepository) {}

  async execute(id: string): Promise<Movie> {
    const movie = await this.movieRepository.findById(id);

    if (!movie) {
      throw new MovieNotFoundError(id);
    }

    return movie;
  }
}
