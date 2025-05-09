import { MovieProperties } from '../entities/movie';

export abstract class MovieExternalService {
  abstract fetchAllMovies(): Promise<MovieProperties[]>;
}
