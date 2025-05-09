import { Movie } from '../entities/movie';

export abstract class MovieRepository {
  abstract syncMovies(): Promise<Movie[]>;
  abstract findByExternalId(externalId: string): Promise<Movie | null>;
  abstract findAll(): Promise<Movie[]>;
}
