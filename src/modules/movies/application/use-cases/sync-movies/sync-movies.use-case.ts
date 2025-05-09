import { Injectable, Logger } from '@nestjs/common';
import { MovieRepository } from '../../../domain/repositories/movie.repository';
import { Movie } from '../../../domain/entities/movie';

export interface SyncMoviesResponse {
  success: boolean;
  count: number;
  movies: ReturnType<Movie['toResponse']>[];
}

@Injectable()
export class SyncMoviesUseCase {
  private readonly logger = new Logger(SyncMoviesUseCase.name);

  constructor(private readonly movieRepository: MovieRepository) {}

  async execute(): Promise<SyncMoviesResponse> {
    this.logger.log('Starting synchronization of movies from external service');

    const movies = await this.movieRepository.syncMovies();

    this.logger.log(`Successfully synchronized ${movies.length} movies`);

    return {
      success: true,
      count: movies.length,
      movies: movies.map((movie) => movie.toResponse()),
    };
  }
}
