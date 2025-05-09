import { Test } from '@nestjs/testing';
import { CreateUserUseCase } from './create-user.use-case';
import { UserRepository } from '../../../domain/repositories/user.repository';
import { PasswordHasher } from '../../../../auth/domain/services/password-hasher';
import { CreateUserDto } from './create-user.dto';
import { User } from '../../../domain/entities/user';
import { Role } from '../../../domain/entities/role';
import { UserAlreadyExistsError } from '../../../domain/errors/user-already-exists-error';
import { InvalidRoleError } from '../../../domain/errors/invalid-role-error';

describe('CreateUserUseCase', () => {
  let createUserUseCase: CreateUserUseCase;
  let userRepositoryMock: jest.Mocked<UserRepository>;
  let passwordHasherMock: jest.Mocked<PasswordHasher>;

  beforeEach(async () => {
    userRepositoryMock = {
      findByEmail: jest.fn(),
      create: jest.fn(),
      findById: jest.fn(),
    } as unknown as jest.Mocked<UserRepository>;

    passwordHasherMock = {
      hash: jest.fn(),
      compare: jest.fn(),
    } as unknown as jest.Mocked<PasswordHasher>;

    const moduleRef = await Test.createTestingModule({
      providers: [
        CreateUserUseCase,
        {
          provide: UserRepository,
          useValue: userRepositoryMock,
        },
        {
          provide: PasswordHasher,
          useValue: passwordHasherMock,
        },
      ],
    }).compile();

    createUserUseCase = moduleRef.get<CreateUserUseCase>(CreateUserUseCase);
  });

  it('should create a user successfully when email does not exist and role is valid', async () => {
    const createUserDto: CreateUserDto = {
      name: 'John Doe',
      email: 'john.doe@example.com',
      password: 'Password123!',
      roleId: 2,
    };

    const hashedPassword = 'hashedPassword123';
    const newUserId = '123e4567-e89b-12d3-a456-426614174000';

    userRepositoryMock.findByEmail.mockResolvedValue(null);
    passwordHasherMock.hash.mockResolvedValue(hashedPassword);

    const newUser = User.create({
      id: newUserId,
      name: createUserDto.name,
      email: createUserDto.email,
      password: hashedPassword,
      isActive: true,
      role: Role.create({ id: 2, name: 'User' }),
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    userRepositoryMock.create.mockResolvedValue(newUser);

    const result = await createUserUseCase.execute(createUserDto);

    expect(userRepositoryMock.findByEmail).toHaveBeenCalledWith(
      createUserDto.email,
    );
    expect(passwordHasherMock.hash).toHaveBeenCalledWith(
      createUserDto.password,
    );
    expect(userRepositoryMock.create).toHaveBeenCalled();
    expect(result).not.toHaveProperty('password');
    expect(result.id).toBe(newUserId);
    expect(result.name).toBe(createUserDto.name);
    expect(result.email).toBe(createUserDto.email);
    expect(result.role.id).toBe(createUserDto.roleId);
  });

  it('should throw UserAlreadyExistsError when email already exists', async () => {
    const createUserDto: CreateUserDto = {
      name: 'John Doe',
      email: 'existing@example.com',
      password: 'Password123!',
      roleId: 2,
    };

    const existingUser = User.create({
      id: 'existing-id',
      name: 'Existing User',
      email: createUserDto.email,
      password: 'hashedPassword',
      isActive: true,
      role: Role.create({ id: 2, name: 'User' }),
    });

    userRepositoryMock.findByEmail.mockResolvedValue(existingUser);

    await expect(createUserUseCase.execute(createUserDto)).rejects.toThrow(
      UserAlreadyExistsError,
    );

    expect(userRepositoryMock.findByEmail).toHaveBeenCalledWith(
      createUserDto.email,
    );
    expect(passwordHasherMock.hash).not.toHaveBeenCalled();
    expect(userRepositoryMock.create).not.toHaveBeenCalled();
  });

  it('should throw InvalidRoleError when roleId is not valid', async () => {
    const createUserDto: CreateUserDto = {
      name: 'John Doe',
      email: 'john.doe@example.com',
      password: 'Password123!',
      roleId: 999,
    };

    userRepositoryMock.findByEmail.mockResolvedValue(null);

    await expect(createUserUseCase.execute(createUserDto)).rejects.toThrow(
      InvalidRoleError,
    );

    expect(userRepositoryMock.findByEmail).toHaveBeenCalledWith(
      createUserDto.email,
    );
    expect(passwordHasherMock.hash).not.toHaveBeenCalled();
    expect(userRepositoryMock.create).not.toHaveBeenCalled();
  });
});
