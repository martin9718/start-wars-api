import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/sequelize';
import { Movie } from '../../domain/entities/movie';
import { DatabaseError } from '../../../shared/infrastructure/database/errors/database-error';
import { TestHelper } from '../../../shared/test/test-helper';
import { MovieRepository } from '../../domain/repositories/movie.repository';
import { MovieModel } from '../../../shared/infrastructure/database/models/movie.model';
import { MovieExternalService } from '../../domain/services/movie-external-service';
import { SequelizeMovieRepository } from './sequelize-movie.repository';
import { MovieExternalServiceError } from '../../domain/errors/movie-external-service-error';

interface SequelizeMovieRepositoryWithPrivateMethods extends MovieRepository {
  buildMovieEntity(model: MovieModel): Movie;
}

describe('SequelizeMovieRepository (Integration)', () => {
  let repository: MovieRepository;
  let externalService: jest.Mocked<MovieExternalService>;
  let testHelper: TestHelper;

  const movieData = [
    {
      title: 'A New Hope',
      episodeId: 4,
      openingCrawl: 'It is a period of civil war...',
      director: 'George Lucas',
      producer: 'Gary Kurtz, Rick McCallum',
      releaseDate: new Date('1977-05-25'),
      url: 'https://swapi.py4e.com/api/films/1/',
      externalId: '1',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      title: 'The Empire Strikes Back',
      episodeId: 5,
      openingCrawl: 'It is a dark time for the Rebellion...',
      director: 'Irvin Kershner',
      producer: 'Gary Kurtz, Rick McCallum',
      releaseDate: new Date('1980-05-17'),
      url: 'https://swapi.py4e.com/api/films/2/',
      externalId: '2',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  beforeAll(async () => {
    testHelper = new TestHelper();
    await testHelper.init();

    externalService = {
      fetchAllMovies: jest.fn(),
    } as unknown as jest.Mocked<MovieExternalService>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: MovieRepository,
          useClass: SequelizeMovieRepository,
        },
        {
          provide: MovieExternalService,
          useValue: externalService,
        },
        {
          provide: getModelToken(MovieModel),
          useValue: MovieModel,
        },
      ],
    }).compile();

    repository = module.get<MovieRepository>(MovieRepository);
  });

  beforeEach(async () => {
    await testHelper.clearDatabase();

    jest.clearAllMocks();
  });

  afterEach(async () => {
    await testHelper.clearDatabase();
  });

  afterAll(async () => {
    await testHelper.clearDatabase();
    await testHelper.close();
  });

  describe('syncMovies', () => {
    it('should sync movies from external service', async () => {
      externalService.fetchAllMovies.mockResolvedValue(
        movieData.map((data) => ({
          ...data,
        })),
      );

      const result = await repository.syncMovies();

      expect(externalService.fetchAllMovies).toHaveBeenCalledTimes(1);

      expect(result).toHaveLength(2);
      expect(result[0].title).toBe('A New Hope');
      expect(result[1].title).toBe('The Empire Strikes Back');

      const moviesInDb = await MovieModel.findAll();
      expect(moviesInDb).toHaveLength(2);
      expect(moviesInDb[0].title).toBe('A New Hope');
      expect(moviesInDb[1].title).toBe('The Empire Strikes Back');
    });

    it('should update existing movies if they already exist', async () => {
      await MovieModel.create({
        title: 'Old Title',
        episode_id: 4,
        opening_crawl: 'Old crawl',
        director: 'Old Director',
        producer: 'Old Producer',
        release_date: new Date('1977-05-25'),
        url: 'https://swapi.py4e.com/api/films/1/',
        external_id: '1',
      });

      externalService.fetchAllMovies.mockResolvedValue([
        {
          title: 'A New Hope (Updated)',
          episodeId: 4,
          openingCrawl: 'Updated crawl',
          director: 'George Lucas',
          producer: 'Gary Kurtz, Rick McCallum',
          releaseDate: new Date('1977-05-25'),
          url: 'https://swapi.py4e.com/api/films/1/',
          externalId: '1',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]);

      const result = await repository.syncMovies();

      expect(result).toHaveLength(1);
      expect(result[0].title).toBe('A New Hope (Updated)');
      expect(result[0].openingCrawl).toBe('Updated crawl');

      const movie = await MovieModel.findOne({ where: { external_id: '1' } });
      expect(movie).not.toBeNull();
      expect(movie?.title).toBe('A New Hope (Updated)');
      expect(movie?.opening_crawl).toBe('Updated crawl');
    });

    it('should handle errors from external service', async () => {
      externalService.fetchAllMovies.mockRejectedValue(
        new Error('External API error'),
      );

      await expect(repository.syncMovies()).rejects.toThrow(
        MovieExternalServiceError,
      );
    });

    it('should rollback transaction if an error occurs during sync', async () => {
      externalService.fetchAllMovies.mockResolvedValue(movieData);

      jest.spyOn(MovieModel, 'create').mockImplementationOnce(() => {
        throw new Error('Database error');
      });

      await expect(repository.syncMovies()).rejects.toThrow();

      const moviesInDb = await MovieModel.findAll();
      expect(moviesInDb).toHaveLength(0);
    });
  });

  describe('findByExternalId', () => {
    it('should find a movie by external ID', async () => {
      await MovieModel.create({
        title: 'Test Movie',
        episode_id: 1,
        opening_crawl: 'Test crawl',
        director: 'Test Director',
        producer: 'Test Producer',
        release_date: new Date(),
        url: 'https://example.com/1/',
        external_id: 'test-external-id',
      });

      const result = await repository.findByExternalId('test-external-id');

      expect(result).not.toBeNull();
      expect(result?.title).toBe('Test Movie');
      expect(result?.externalId).toBe('test-external-id');
    });

    it('should return null if movie with external ID does not exist', async () => {
      const result = await repository.findByExternalId('non-existent-id');

      expect(result).toBeNull();
    });

    it('should throw DatabaseError if database operation fails', async () => {
      jest.spyOn(MovieModel, 'findOne').mockImplementationOnce(() => {
        throw new Error('Database connection error');
      });

      await expect(repository.findByExternalId('any-id')).rejects.toThrow(
        DatabaseError,
      );
    });
  });

  describe('buildMovieEntity', () => {
    it('should correctly map MovieModel to Movie domain entity', async () => {
      const movieModel = await MovieModel.create({
        title: 'Entity Mapping Movie',
        episode_id: 3,
        opening_crawl: 'Mapping test',
        director: 'Test Director',
        producer: 'Test Producer',
        release_date: new Date('2020-01-01'),
        url: 'https://example.com/3/',
        external_id: 'mapping-test',
      });

      const buildMovieEntity = (
        repository as SequelizeMovieRepositoryWithPrivateMethods
      ).buildMovieEntity.bind(repository);

      const result = buildMovieEntity(movieModel);

      expect(result).toBeInstanceOf(Movie);
      expect(result.id).toBe(movieModel.id);
      expect(result.title).toBe(movieModel.title);
      expect(result.episodeId).toBe(movieModel.episode_id);
      expect(result.openingCrawl).toBe(movieModel.opening_crawl);
      expect(result.director).toBe(movieModel.director);
      expect(result.producer).toBe(movieModel.producer);
      expect(result.releaseDate).toEqual(movieModel.release_date);
      expect(result.url).toBe(movieModel.url);
      expect(result.externalId).toBe(movieModel.external_id);
    });
  });
});
