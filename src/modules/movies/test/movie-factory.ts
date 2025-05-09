import { Movie } from '../domain/entities/movie';

export class MovieFactory {
  static createDefaultMovies(): Movie[] {
    return [
      Movie.create({
        id: '1',
        title: 'A New Hope',
        episodeId: 4,
        openingCrawl: 'It is a period of civil war...',
        director: 'George Lucas',
        producer: 'Gary Kurtz, Rick McCallum',
        releaseDate: new Date('1977-05-25'),
        url: 'https://swapi.py4e.com/api/films/1/',
        externalId: '1',
        createdAt: new Date('2023-01-01'),
        updatedAt: new Date('2023-01-01'),
        deletedAt: undefined,
      }),
      Movie.create({
        id: '2',
        title: 'The Empire Strikes Back',
        episodeId: 5,
        openingCrawl: 'It is a dark time for the Rebellion...',
        director: 'Irvin Kershner',
        producer: 'Gary Kurtz, Rick McCallum',
        releaseDate: new Date('1980-05-17'),
        url: 'https://swapi.py4e.com/api/films/2/',
        externalId: '2',
        createdAt: new Date('2023-01-01'),
        updatedAt: new Date('2023-01-01'),
        deletedAt: undefined,
      }),
      Movie.create({
        id: '3',
        title: 'Return of the Jedi',
        episodeId: 6,
        openingCrawl: 'Luke Skywalker has returned to his home planet...',
        director: 'Richard Marquand',
        producer: 'Howard G. Kazanjian, George Lucas, Rick McCallum',
        releaseDate: new Date('1983-05-25'),
        url: 'https://swapi.py4e.com/api/films/3/',
        externalId: '3',
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: undefined,
      }),
    ];
  }

  static createMovie(
    overrides: Partial<Parameters<typeof Movie.create>[0]> = {},
  ): Movie {
    const defaultProps = {
      id: '1',
      title: 'A New Hope',
      episodeId: 4,
      openingCrawl: 'It is a period of civil war...',
      director: 'George Lucas',
      producer: 'Gary Kurtz, Rick McCallum',
      releaseDate: new Date('1977-05-25'),
      url: 'https://swapi.py4e.com/api/films/1/',
      externalId: '1',
      createdAt: new Date('2023-01-01'),
      updatedAt: new Date('2023-01-01'),
      deletedAt: undefined,
    };

    return Movie.create({
      ...defaultProps,
      ...overrides,
    });
  }

  static createMovieModels(): Array<Record<string, unknown>> {
    return [
      {
        title: 'A New Hope',
        episode_id: 4,
        opening_crawl: 'It is a period of civil war...',
        director: 'George Lucas',
        producer: 'Gary Kurtz, Rick McCallum',
        release_date: new Date('1977-05-25'),
        url: 'https://swapi.py4e.com/api/films/1/',
        external_id: '1',
      },
      {
        title: 'The Empire Strikes Back',
        episode_id: 5,
        opening_crawl: 'It is a dark time for the Rebellion...',
        director: 'Irvin Kershner',
        producer: 'Gary Kurtz, Rick McCallum',
        release_date: new Date('1980-05-17'),
        url: 'https://swapi.py4e.com/api/films/2/',
        external_id: '2',
      },
      {
        title: 'Return of the Jedi',
        episode_id: 6,
        opening_crawl: 'Luke Skywalker has returned to his home planet...',
        director: 'Richard Marquand',
        producer: 'Howard G. Kazanjian, George Lucas, Rick McCallum',
        release_date: new Date('1983-05-25'),
        url: 'https://swapi.py4e.com/api/films/3/',
        external_id: '3',
      },
    ];
  }
}
