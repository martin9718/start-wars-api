import { Injectable } from '@nestjs/common';
import { MovieRepository } from '../../../domain/repositories/movie.repository';
import { Movie } from '../../../domain/entities/movie';

export interface CreateMovieDto {
  title: string;
  episodeId: number;
  openingCrawl: string;
  director: string;
  producer: string;
  releaseDate: Date;
  url?: string;
  externalId?: string;
}

@Injectable()
export class CreateMovieUseCase {
  constructor(private readonly movieRepository: MovieRepository) {}

  async execute(dto: CreateMovieDto): Promise<Movie> {
    const movie = Movie.create({
      title: dto.title,
      episodeId: dto.episodeId,
      openingCrawl: dto.openingCrawl,
      director: dto.director,
      producer: dto.producer,
      releaseDate: dto.releaseDate,
      url: dto.url || '',
      externalId: dto.externalId,
    });

    return this.movieRepository.create(movie);
  }
}
