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
import { MovieFactory } from '../../test/movie-factory';

interface SequelizeMovieRepositoryWithPrivateMethods extends MovieRepository {
  buildMovieEntity(model: MovieModel): Movie;
}

describe('SequelizeMovieRepository (Integration)', () => {
  let repository: MovieRepository;
  let externalService: jest.Mocked<MovieExternalService>;
  let testHelper: TestHelper;

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
      const movieData = MovieFactory.createDefaultMovies().slice(0, 2);

      externalService.fetchAllMovies.mockResolvedValue(movieData);

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

      const updatedMovie = MovieFactory.createMovie({
        title: 'A New Hope (Updated)',
        openingCrawl: 'Updated crawl',
      });

      externalService.fetchAllMovies.mockResolvedValue([updatedMovie]);

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
      const movieData = MovieFactory.createDefaultMovies().slice(0, 2);

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
      const movieModel = MovieFactory.createMovieModels()[0];
      await MovieModel.create({
        ...movieModel,
        external_id: 'test-external-id',
      });

      const result = await repository.findByExternalId('test-external-id');

      expect(result).not.toBeNull();
      expect(result?.title).toBe('A New Hope');
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

  describe('findAll', () => {
    it('should return all movies', async () => {
      await MovieModel.bulkCreate(MovieFactory.createMovieModels());

      const result = await repository.findAll();

      expect(result).toHaveLength(3);
      expect(result[0]).toBeInstanceOf(Movie);
      expect(result[1]).toBeInstanceOf(Movie);
      expect(result[2]).toBeInstanceOf(Movie);

      expect(result[0].title).toBe('A New Hope');
      expect(result[1].title).toBe('The Empire Strikes Back');
      expect(result[2].title).toBe('Return of the Jedi');

      expect(result[0].episodeId).toBe(4);
      expect(result[1].episodeId).toBe(5);
      expect(result[2].episodeId).toBe(6);
    });

    it('should return empty array when no movies exist', async () => {
      await MovieModel.destroy({ where: {}, force: true });

      const result = await repository.findAll();

      expect(result).toHaveLength(0);
    });

    it('should throw DatabaseError if database operation fails', async () => {
      jest.spyOn(MovieModel, 'findAll').mockImplementationOnce(() => {
        throw new Error('Database connection error');
      });

      await expect(repository.findAll()).rejects.toThrow(DatabaseError);
    });
  });

  describe('buildMovieEntity', () => {
    it('should correctly map MovieModel to Movie domain entity', async () => {
      const modelData = MovieFactory.createMovieModels()[2];

      const movieModel = await MovieModel.create({
        ...modelData,
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
      expect(result.externalId).toBe('mapping-test');
    });
  });
});
