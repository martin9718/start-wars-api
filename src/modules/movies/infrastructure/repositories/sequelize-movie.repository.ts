import { Injectable } from '@nestjs/common';
import { MovieRepository } from '../../domain/repositories/movie.repository';
import { InjectModel } from '@nestjs/sequelize';
import { Movie } from '../../domain/entities/movie';
import { MovieModel } from '../../../shared/infrastructure/database/models/movie.model';
import { MovieExternalService } from '../../domain/services/movie-external-service';
import { ApplicationError } from '../../../shared/domain/errors/application-error';
import { MovieExternalServiceError } from '../../domain/errors/movie-external-service-error';
import { DatabaseError } from '../../../shared/infrastructure/database/errors/database-error';

@Injectable()
export class SequelizeMovieRepository implements MovieRepository {
  constructor(
    @InjectModel(MovieModel)
    private readonly movieModel: typeof MovieModel,
    private readonly movieExternalService: MovieExternalService,
  ) {}

  async syncMovies(): Promise<Movie[]> {
    const transaction = await this.movieModel.sequelize!.transaction();
    try {
      const movieProperties = await this.movieExternalService.fetchAllMovies();

      const updatedMovies: Movie[] = [];

      for (const movieProps of movieProperties) {
        const existingMovie = await this.findByExternalId(
          movieProps.externalId as string,
        );

        if (existingMovie) {
          const updatedModelProps = {
            title: movieProps.title,
            episode_id: movieProps.episodeId,
            opening_crawl: movieProps.openingCrawl,
            director: movieProps.director,
            producer: movieProps.producer,
            release_date: movieProps.releaseDate,
            url: movieProps.url,
          };

          const model = await this.movieModel.findByPk(existingMovie.id, {
            transaction,
          });
          await model?.update(updatedModelProps, { transaction });

          await model?.reload();

          if (model) {
            const updated = this.buildMovieEntity(model);
            updatedMovies.push(updated);
          }
        } else {
          const newMovie = Movie.create({
            title: movieProps.title,
            episodeId: movieProps.episodeId,
            openingCrawl: movieProps.openingCrawl,
            director: movieProps.director,
            producer: movieProps.producer,
            releaseDate: movieProps.releaseDate,
            url: movieProps.url,
            externalId: movieProps.externalId,
          });

          const modelProps = {
            title: newMovie.title,
            episode_id: newMovie.episodeId,
            opening_crawl: newMovie.openingCrawl,
            director: newMovie.director,
            producer: newMovie.producer,
            release_date: newMovie.releaseDate,
            url: newMovie.url,
            external_id: newMovie.externalId,
          };

          const model = await this.movieModel.create(modelProps, {
            transaction,
          });
          const created = this.buildMovieEntity(model);
          updatedMovies.push(created);
        }
      }

      await transaction.commit();

      return updatedMovies;
    } catch (error) {
      await transaction.rollback();
      if (error instanceof ApplicationError) {
        throw error;
      }

      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : '';

      throw new MovieExternalServiceError(
        `Failed to sync movies from SWAPI: ${errorMessage}`,
        errorStack || '',
      );
    }
  }

  async findByExternalId(externalId: string): Promise<Movie | null> {
    try {
      const movie = await this.movieModel.findOne({
        where: { external_id: externalId },
      });

      if (!movie) return null;

      return this.buildMovieEntity(movie);
    } catch (error) {
      throw new DatabaseError(error);
    }
  }

  async findAll(): Promise<Movie[]> {
    try {
      const movies = await this.movieModel.findAll();

      return movies.map((movie) => this.buildMovieEntity(movie));
    } catch (error) {
      throw new DatabaseError(error);
    }
  }

  async findById(id: string): Promise<Movie | null> {
    try {
      const movie = await this.movieModel.findOne({
        where: { id },
      });

      if (!movie) return null;

      return this.buildMovieEntity(movie);
    } catch (error) {
      throw new DatabaseError(error);
    }
  }

  async create(movie: Movie): Promise<Movie> {
    try {
      const modelProps = {
        title: movie.title,
        episode_id: movie.episodeId,
        opening_crawl: movie.openingCrawl,
        director: movie.director,
        producer: movie.producer,
        release_date: movie.releaseDate,
        url: movie.url,
        external_id: movie.externalId,
      };

      const model = await this.movieModel.create(modelProps);

      return this.buildMovieEntity(model);
    } catch (error) {
      throw new DatabaseError(error);
    }
  }

  async update(id: string, movieData: Partial<Movie>): Promise<Movie | null> {
    try {
      const modelProps = {
        title: movieData.title,
        episode_id: movieData.episodeId,
        opening_crawl: movieData.openingCrawl,
        director: movieData.director,
        producer: movieData.producer,
        release_date: movieData.releaseDate,
        url: movieData.url,
        external_id: movieData.externalId,
      };

      const filteredProps = Object.fromEntries(
        Object.entries(modelProps).filter(([, value]) => value !== undefined),
      );

      const [affectedCount] = await this.movieModel.update(filteredProps, {
        where: { id },
      });

      if (affectedCount === 0) {
        return null;
      }

      const updatedMovie = await this.movieModel.findByPk(id);

      if (!updatedMovie) return null;

      return this.buildMovieEntity(updatedMovie);
    } catch (error) {
      throw new DatabaseError(error);
    }
  }

  async softDelete(id: string): Promise<boolean> {
    try {
      const result = await this.movieModel.destroy({
        where: { id },
        force: false,
      });

      return result > 0;
    } catch (error) {
      throw new DatabaseError(error);
    }
  }

  private buildMovieEntity(model: MovieModel): Movie {
    return Movie.create({
      id: model.id,
      title: model.title,
      episodeId: model.episode_id,
      openingCrawl: model.opening_crawl,
      director: model.director,
      producer: model.producer,
      releaseDate: model.release_date,
      url: model.url,
      externalId: model.external_id,
      createdAt: model.created_at,
      updatedAt: model.updated_at,
      deletedAt: model.deleted_at,
    });
  }
}
