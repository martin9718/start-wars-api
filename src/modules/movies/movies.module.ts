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
  ],
  controllers: [SyncMoviesController],
  exports: [MovieRepository],
})
export class MoviesModule {}
