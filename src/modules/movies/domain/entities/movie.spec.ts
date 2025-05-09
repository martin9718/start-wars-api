import { Movie } from './movie';

describe('Movie Entity', () => {
  it('should create a movie with all required properties', () => {
    const releaseDate = new Date('1977-05-25');

    const movie = Movie.create({
      title: 'A New Hope',
      episodeId: 4,
      openingCrawl: 'It is a period of civil war...',
      director: 'George Lucas',
      producer: 'Gary Kurtz, Rick McCallum',
      releaseDate,
      url: 'https://swapi.py4e.com/api/films/1/',
    });

    expect(movie.title).toBe('A New Hope');
    expect(movie.episodeId).toBe(4);
    expect(movie.openingCrawl).toBe('It is a period of civil war...');
    expect(movie.director).toBe('George Lucas');
    expect(movie.producer).toBe('Gary Kurtz, Rick McCallum');
    expect(movie.releaseDate).toBe(releaseDate);
    expect(movie.url).toBe('https://swapi.py4e.com/api/films/1/');
    expect(movie.externalId).toBeUndefined();
    expect(movie.id).toBeUndefined();
    expect(movie.createdAt).toBeInstanceOf(Date);
    expect(movie.updatedAt).toBeInstanceOf(Date);
    expect(movie.deletedAt).toBeUndefined();
  });

  it('should create a movie with optional properties', () => {
    const releaseDate = new Date('1977-05-25');
    const createdAt = new Date('2023-01-01');
    const updatedAt = new Date('2023-01-02');
    const deletedAt = new Date('2023-01-03');

    const movie = Movie.create({
      id: 'movie-123',
      title: 'A New Hope',
      episodeId: 4,
      openingCrawl: 'It is a period of civil war...',
      director: 'George Lucas',
      producer: 'Gary Kurtz, Rick McCallum',
      releaseDate,
      url: 'https://swapi.py4e.com/api/films/1/',
      externalId: 'external-123',
      createdAt,
      updatedAt,
      deletedAt,
    });

    expect(movie.id).toBe('movie-123');
    expect(movie.externalId).toBe('external-123');
    expect(movie.createdAt).toBe(createdAt);
    expect(movie.updatedAt).toBe(updatedAt);
    expect(movie.deletedAt).toBe(deletedAt);
  });

  it('should convert to response object correctly', () => {
    const id = 'movie-123';
    const title = 'A New Hope';
    const episodeId = 4;
    const openingCrawl = 'It is a period of civil war...';
    const director = 'George Lucas';
    const producer = 'Gary Kurtz, Rick McCallum';
    const releaseDate = new Date('1977-05-25');
    const url = 'https://swapi.py4e.com/api/films/1/';
    const externalId = 'external-123';
    const createdAt = new Date('2023-01-01');
    const updatedAt = new Date('2023-01-02');
    const deletedAt = new Date('2023-01-03');

    const movie = Movie.create({
      id,
      title,
      episodeId,
      openingCrawl,
      director,
      producer,
      releaseDate,
      url,
      externalId,
      createdAt,
      updatedAt,
      deletedAt,
    });

    const response = movie.toResponse();

    expect(response).toEqual({
      id,
      title,
      episodeId,
      openingCrawl,
      director,
      producer,
      releaseDate,
      url,
      externalId,
      createdAt,
      updatedAt,
      deletedAt,
    });
  });

  it('should handle undefined deletedAt in toResponse', () => {
    const movie = Movie.create({
      title: 'A New Hope',
      episodeId: 4,
      openingCrawl: 'It is a period of civil war...',
      director: 'George Lucas',
      producer: 'Gary Kurtz, Rick McCallum',
      releaseDate: new Date('1977-05-25'),
      url: 'https://swapi.py4e.com/api/films/1/',
    });

    const response = movie.toResponse();

    expect(response.deletedAt).toBeUndefined();
  });

  it('should create a soft deleted movie', () => {
    const deletedAt = new Date();

    const movie = Movie.create({
      title: 'Deleted Movie',
      episodeId: 9,
      openingCrawl: 'This movie has been deleted...',
      director: 'Test Director',
      producer: 'Test Producer',
      releaseDate: new Date('2023-01-01'),
      url: 'https://example.com/deleted-movie',
      deletedAt,
    });

    expect(movie.deletedAt).toBe(deletedAt);
    expect(movie.toResponse().deletedAt).toBe(deletedAt);
  });
});
