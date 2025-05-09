import { Module } from '@nestjs/common';
import { MovieRepository } from './domain/repositories/movie.repository';
import { SequelizeMovieRepository } from './infrastructure/repositories/sequelize-movie.repository';
import { SyncMoviesUseCase } from './application/use-cases/sync-movies/sync-movies.use-case';
import { SequelizeModule } from '@nestjs/sequelize';
import { SwapiService } from './infrastructure/services/swapi.service';
import { MovieModel } from '../shared/infrastructure/database/models/movie.model';
import { MovieExternalService } from './domain/services/movie-external-service';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { SyncMoviesController } from './infrastructure/http/sync-movies/sync-movies.controller';
import { GetAllMoviesUseCase } from './application/use-cases/get-all-movies/get-all-movies.use-case';
import { GetAllMoviesController } from './infrastructure/http/get-all-movies/get-all-movies.controller';
import { FindMovieByIdController } from './infrastructure/http/find-by-id/find-by-id.controller';
import { FindByIdUseCase } from './application/use-cases/find-by-id/find-by-id.use-case';
import { CreateMovieController } from './infrastructure/http/create-movie/create-movie.controller';
import { CreateMovieUseCase } from './application/use-cases/create-movie/create-movie.use-case';
import { UpdateMovieUseCase } from './application/use-cases/update-movie/update-movie.use-case';
import { UpdateMovieController } from './infrastructure/http/update-movie/update-movie.controller';
import { DeleteMovieUseCase } from './application/use-cases/delete-movie/delete-movie.use-case';
import { DeleteMovieController } from './infrastructure/http/delete-movie/delete-movie.controller';

@Module({
  imports: [
    SequelizeModule.forFeature([MovieModel]),
    HttpModule.register({
      timeout: 5000,
      maxRedirects: 5,
    }),
    ConfigModule,
  ],
  providers: [
    {
      provide: MovieExternalService,
      useClass: SwapiService,
    },
    {
      provide: MovieRepository,
      useClass: SequelizeMovieRepository,
    },
    SyncMoviesUseCase,
    GetAllMoviesUseCase,
    FindByIdUseCase,
    CreateMovieUseCase,
    UpdateMovieUseCase,
    DeleteMovieUseCase,
  ],
  controllers: [
    SyncMoviesController,
    GetAllMoviesController,
    FindMovieByIdController,
    CreateMovieController,
    UpdateMovieController,
    DeleteMovieController,
  ],
  exports: [MovieRepository],
})
export class MoviesModule {}
