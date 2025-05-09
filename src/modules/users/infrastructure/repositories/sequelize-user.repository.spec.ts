import { User } from '../../domain/entities/user';
import { Role } from '../../domain/entities/role';
import { DatabaseError } from '../../../shared/infrastructure/database/errors/database-error';
import { TestHelper } from '../../../shared/test/test-helper';
import { UserRepository } from '../../domain/repositories/user.repository';
import { UserModel } from '../../../shared/infrastructure/database/models/user.model';
import { RoleModel } from '../../../shared/infrastructure/database/models/role.model';

interface SequelizeUserRepositoryWithPrivateMethods extends UserRepository {
  buildUserEntity(model: UserModel): User;
}

describe('SequelizeUserRepository (Integration', () => {
  let repository: UserRepository;
  let testHelper: TestHelper;

  beforeAll(async () => {
    testHelper = new TestHelper();
    await testHelper.init();

    repository = testHelper.getApp().get<UserRepository>(UserRepository);
  });

  beforeEach(async () => {
    await RoleModel.bulkCreate([
      { id: 1, name: 'Admin' },
      { id: 2, name: 'User' },
    ]);
  });

  afterEach(async () => {
    await testHelper.clearDatabase();
  });

  afterAll(async () => {
    await testHelper.clearDatabase();
    await testHelper.close();
  });

  describe('create', () => {
    it('should create a user successfully', async () => {
      const userData = User.create({
        name: 'Test User',
        email: 'test@example.com',
        password: 'hashed_password',
        isActive: true,
        role: Role.create({ id: 2, name: 'User' }),
      });

      const result = await repository.create(userData);

      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
      expect(result.name).toBe('Test User');
      expect(result.email).toBe('test@example.com');
      expect(result.role.id).toBe(2);
      expect(result.role.name).toBe('User');
    });

    it('should throw DatabaseError when trying to create a user with existing email', async () => {
      const existingUser = User.create({
        name: 'Existing User',
        email: 'existing@example.com',
        password: 'hashed_password',
        isActive: true,
        role: Role.create({ id: 2, name: 'User' }),
      });

      await repository.create(existingUser);

      const duplicateUser = User.create({
        name: 'Duplicate User',
        email: 'existing@example.com',
        password: 'another_password',
        isActive: true,
        role: Role.create({ id: 2, name: 'User' }),
      });

      await expect(repository.create(duplicateUser)).rejects.toThrow(
        DatabaseError,
      );
    });
  });

  describe('findById', () => {
    it('should find user by id', async () => {
      const user = User.create({
        name: 'Find By ID User',
        email: 'findbyid@example.com',
        password: 'hashed_password',
        isActive: true,
        role: Role.create({ id: 1, name: 'Admin' }),
      });

      const createdUser = await repository.create(user);

      const foundUser = await repository.findById(createdUser.id as string);

      expect(foundUser).not.toBeNull();
      expect(foundUser?.id).toBe(createdUser.id);
      expect(foundUser?.name).toBe('Find By ID User');
      expect(foundUser?.role.id).toBe(1);
      expect(foundUser?.role.name).toBe('Admin');
    });

    it('should return null when user id does not exist', async () => {
      const result = await repository.findById('non-existent-id');

      expect(result).toBeNull();
    });

    it('should throw DatabaseError when database operation fails', async () => {
      jest.spyOn(UserModel, 'findOne').mockImplementationOnce(() => {
        throw new Error('Database connection error');
      });

      await expect(repository.findById('any-id')).rejects.toThrow(
        DatabaseError,
      );
    });
  });

  describe('findByEmail', () => {
    it('should find user by email', async () => {
      const user = User.create({
        name: 'Find By Email User',
        email: 'findbyemail@example.com',
        password: 'hashed_password',
        isActive: true,
        role: Role.create({ id: 2, name: 'User' }),
      });

      await repository.create(user);

      const foundUser = await repository.findByEmail('findbyemail@example.com');

      expect(foundUser).not.toBeNull();
      expect(foundUser?.email).toBe('findbyemail@example.com');
      expect(foundUser?.name).toBe('Find By Email User');
      expect(foundUser?.role.id).toBe(2);
    });

    it('should return null when email does not exist', async () => {
      const result = await repository.findByEmail('nonexistent@example.com');

      expect(result).toBeNull();
    });

    it('should throw DatabaseError when database operation fails', async () => {
      jest.spyOn(UserModel, 'findOne').mockImplementationOnce(() => {
        throw new Error('Database connection error');
      });

      await expect(repository.findByEmail('any@example.com')).rejects.toThrow(
        DatabaseError,
      );
    });
  });

  describe('buildUserEntity', () => {
    it('should correctly map UserModel to User domain entity', async () => {
      const user = User.create({
        name: 'Entity Mapping User',
        email: 'entitymapping@example.com',
        password: 'hashed_password',
        isActive: true,
        role: Role.create({ id: 1, name: 'Admin' }),
      });

      const createdUser = await repository.create(user);

      const userModel = await UserModel.findOne({
        where: { id: createdUser.id },
        include: [{ model: RoleModel }],
      });

      const buildUserEntity = (
        repository as SequelizeUserRepositoryWithPrivateMethods
      ).buildUserEntity.bind(repository);

      const result = buildUserEntity(userModel);

      expect(result).toBeInstanceOf(User);
      expect(result.id).toBe(userModel?.id);
      expect(result.name).toBe(userModel?.name);
      expect(result.email).toBe(userModel?.email);
      expect(result.password).toBe(userModel?.password);
      expect(result.isActive).toBe(userModel?.is_active);
      expect(result.role).toBeInstanceOf(Role);
      expect(result.role.id).toBe(userModel?.role.id);
      expect(result.role.name).toBe(userModel?.role.name);
    });
  });
});
