import { Test, TestingModule } from '@nestjs/testing';
import { LoginUseCase } from './login.use-case';
import { UserRepository } from '../../../../users/domain/repositories/user.repository';
import { PasswordHasher } from '../../../domain/services/password-hasher';
import { User, UserProperties } from '../../../../users/domain/entities/user';
import { Role } from '../../../../users/domain/entities/role';
import { InvalidCredentialsError } from '../../../domain/errors/invalid-credentials-error';
import { UserNotActive } from '../../../domain/errors/user-not-active-error';
import { JwtService } from '@nestjs/jwt';

describe('LoginUseCase', () => {
  let useCase: LoginUseCase;
  let userRepositoryMock: jest.Mocked<UserRepository>;
  let passwordHasherMock: jest.Mocked<PasswordHasher>;
  let jwtServiceMock: { sign: jest.Mock };

  beforeEach(async () => {
    userRepositoryMock = {
      findByEmail: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
    } as jest.Mocked<UserRepository>;

    passwordHasherMock = {
      compare: jest.fn(),
      hash: jest.fn(),
    } as jest.Mocked<PasswordHasher>;

    jwtServiceMock = {
      sign: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LoginUseCase,
        {
          provide: UserRepository,
          useValue: userRepositoryMock,
        },
        {
          provide: PasswordHasher,
          useValue: passwordHasherMock,
        },
        {
          provide: JwtService,
          useValue: jwtServiceMock,
        },
      ],
    }).compile();

    useCase = module.get<LoginUseCase>(LoginUseCase);
  });

  it('should successfully authenticate and return token and user', async () => {
    const loginDto = {
      email: 'john@example.com',
      password: 'password123',
    };

    const mockUser = User.create({
      id: 'user-id-123',
      name: 'John Doe',
      email: 'john@example.com',
      password: 'hashed_password',
      isActive: true,
      role: Role.create({ id: 2, name: 'User' }),
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const mockToken = 'jwt-token-xyz';

    userRepositoryMock.findByEmail.mockResolvedValue(mockUser);
    passwordHasherMock.compare.mockResolvedValue(true);
    jwtServiceMock.sign.mockReturnValue(mockToken);

    type UserResponse = Omit<UserProperties, 'password'>;

    jest.spyOn(mockUser, 'toResponse').mockReturnValue({
      id: 'user-id-123',
      name: 'John Doe',
      email: 'john@example.com',
      isActive: true,
      role: { id: 2, name: 'User' },
      createdAt: expect.any(Date),
      updatedAt: expect.any(Date),
    } as UserResponse);

    const result = await useCase.execute(loginDto);

    expect(result).toEqual({
      token: mockToken,
      user: mockUser.toResponse(),
    });
    expect(userRepositoryMock.findByEmail).toHaveBeenCalledWith(loginDto.email);
    expect(passwordHasherMock.compare).toHaveBeenCalledWith(
      loginDto.password,
      mockUser.password,
    );
    expect(jwtServiceMock.sign).toHaveBeenCalledWith({
      sub: mockUser.id,
      email: mockUser.email,
    });
    expect(mockUser.toResponse).toHaveBeenCalled();
  });

  it('should throw InvalidCredentialsError when user not found', async () => {
    const loginDto = {
      email: 'nonexistent@example.com',
      password: 'password123',
    };

    userRepositoryMock.findByEmail.mockResolvedValue(null);

    await expect(useCase.execute(loginDto)).rejects.toThrow(
      InvalidCredentialsError,
    );
    expect(userRepositoryMock.findByEmail).toHaveBeenCalledWith(loginDto.email);
    expect(passwordHasherMock.compare).not.toHaveBeenCalled();
    expect(jwtServiceMock.sign).not.toHaveBeenCalled();
  });

  it('should throw UserNotActive when user is inactive', async () => {
    const loginDto = {
      email: 'inactive@example.com',
      password: 'password123',
    };

    const inactiveUser = User.create({
      id: 'user-id-456',
      name: 'Inactive User',
      email: 'inactive@example.com',
      password: 'hashed_password',
      isActive: false,
      role: Role.create({ id: 2, name: 'User' }),
    });

    userRepositoryMock.findByEmail.mockResolvedValue(inactiveUser);

    await expect(useCase.execute(loginDto)).rejects.toThrow(UserNotActive);
    expect(userRepositoryMock.findByEmail).toHaveBeenCalledWith(loginDto.email);
    expect(passwordHasherMock.compare).not.toHaveBeenCalled();
    expect(jwtServiceMock.sign).not.toHaveBeenCalled();
  });

  it('should throw InvalidCredentialsError when password is incorrect', async () => {
    const loginDto = {
      email: 'john@example.com',
      password: 'wrong_password',
    };

    const mockUser = User.create({
      id: 'user-id-123',
      name: 'John Doe',
      email: 'john@example.com',
      password: 'hashed_password',
      isActive: true,
      role: Role.create({ id: 2, name: 'User' }),
    });

    userRepositoryMock.findByEmail.mockResolvedValue(mockUser);
    passwordHasherMock.compare.mockResolvedValue(false);

    await expect(useCase.execute(loginDto)).rejects.toThrow(
      InvalidCredentialsError,
    );
    expect(userRepositoryMock.findByEmail).toHaveBeenCalledWith(loginDto.email);
    expect(passwordHasherMock.compare).toHaveBeenCalledWith(
      loginDto.password,
      mockUser.password,
    );
    expect(jwtServiceMock.sign).not.toHaveBeenCalled();
  });

  it('should include user id and email in JWT payload', async () => {
    const loginDto = {
      email: 'john@example.com',
      password: 'password123',
    };

    const mockUser = User.create({
      id: 'user-id-123',
      name: 'John Doe',
      email: 'john@example.com',
      password: 'hashed_password',
      isActive: true,
      role: Role.create({ id: 2, name: 'User' }),
    });

    userRepositoryMock.findByEmail.mockResolvedValue(mockUser);
    passwordHasherMock.compare.mockResolvedValue(true);
    jwtServiceMock.sign.mockReturnValue('jwt-token-xyz');

    type UserResponse = Omit<UserProperties, 'password'>;
    const userResponse: UserResponse = {
      id: 'user-id-123',
      name: 'John Doe',
      email: 'john@example.com',
      isActive: true,
      role: { id: 2, name: 'User' },
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    jest.spyOn(mockUser, 'toResponse').mockReturnValue(userResponse);

    await useCase.execute(loginDto);

    expect(jwtServiceMock.sign).toHaveBeenCalledWith({
      sub: mockUser.id,
      email: mockUser.email,
    });
  });
});
