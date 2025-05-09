import { Injectable } from '@nestjs/common';
import { MovieRepository } from '../../../domain/repositories/movie.repository';
import { Movie } from '../../../domain/entities/movie';

@Injectable()
export class GetAllMoviesUseCase {
  constructor(private readonly movieRepository: MovieRepository) {}

  async execute(): Promise<Movie[]> {
    return this.movieRepository.findAll();
  }
}
