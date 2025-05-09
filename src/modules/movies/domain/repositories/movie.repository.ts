import { Movie } from '../entities/movie';

export abstract class MovieRepository {
  abstract syncMovies(): Promise<Movie[]>;
  abstract findByExternalId(externalId: string): Promise<Movie | null>;
  abstract findAll(): Promise<Movie[]>;
  abstract findById(id: string): Promise<Movie | null>;
  abstract create(movie: Movie): Promise<Movie>;
  abstract update(id: string, movieData: Partial<Movie>): Promise<Movie | null>;
}
