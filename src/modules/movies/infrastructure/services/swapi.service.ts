import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { MovieExternalService } from '../../domain/services/movie-external-service';
import { MovieProperties } from '../../domain/entities/movie';
import { ConfigService } from '@nestjs/config';
import { MovieExternalServiceError } from '../../domain/errors/movie-external-service-error';

interface SwapiFilmResponse {
  title: string;
  episode_id: number;
  opening_crawl: string;
  director: string;
  producer: string;
  release_date: string;
  url: string;
  created: string;
  edited: string;
}

interface SwapiFilmsResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: SwapiFilmResponse[];
}

@Injectable()
export class SwapiService implements MovieExternalService {
  private readonly baseUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.baseUrl = this.configService.get<string>(
      'SWAPI_BASE_URL',
      'https://swapi.py4e.com/api',
    );
  }

  async fetchAllMovies(): Promise<MovieProperties[]> {
    try {
      const response = await firstValueFrom(
        this.httpService.get<SwapiFilmsResponse>(`${this.baseUrl}/films/`),
      );

      return response.data?.results?.map(this.mapSwapiFilmToMovieProperties);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      const details = error instanceof Error && error.stack ? error.stack : '';
      throw new MovieExternalServiceError(
        `Failed to fetch films from SWAPI: ${errorMessage}`,
        details,
      );
    }
  }

  private mapSwapiFilmToMovieProperties = (
    film: SwapiFilmResponse,
  ): MovieProperties => {
    const urlParts = film.url.split('/');
    const externalId = urlParts[urlParts.length - 2];

    return {
      title: film.title,
      episodeId: film.episode_id,
      openingCrawl: film.opening_crawl,
      director: film.director,
      producer: film.producer,
      releaseDate: new Date(film.release_date),
      url: film.url,
      externalId,
      createdAt: new Date(film.created),
      updatedAt: new Date(film.edited),
    };
  };
}
