import { Injectable } from '@nestjs/common';
import { MovieRepository } from '../../../domain/repositories/movie.repository';
import { Movie } from '../../../domain/entities/movie';
import { MovieNotFoundError } from '../../../domain/errors/movie-not-found-error';

export interface UpdateMovieDto {
  id: string;
  title?: string;
  episodeId?: number;
  openingCrawl?: string;
  director?: string;
  producer?: string;
  releaseDate?: Date;
  url?: string;
  externalId?: string;
}

@Injectable()
export class UpdateMovieUseCase {
  constructor(private readonly movieRepository: MovieRepository) {}

  async execute(dto: UpdateMovieDto): Promise<Movie> {
    const existingMovie = await this.movieRepository.findById(dto.id);

    if (!existingMovie) {
      throw new MovieNotFoundError(dto.id);
    }

    const movieUpdate = Object.fromEntries(
      Object.entries(dto).filter(
        ([key, value]) => key !== 'id' && value !== undefined,
      ),
    ) as Partial<Movie>;

    const updatedMovie = await this.movieRepository.update(dto.id, movieUpdate);

    if (!updatedMovie) {
      throw new MovieNotFoundError(dto.id);
    }

    return updatedMovie;
  }
}
