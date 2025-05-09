import { Test, TestingModule } from '@nestjs/testing';
import { LoginController } from './login.controller';
import { LoginUseCase } from '../../../application/use-cases/login/login.use-case';
import { LoginHttpDto } from './login.http-dto';
import { User } from '../../../../users/domain/entities/user';
import { Role } from '../../../../users/domain/entities/role';
import { InvalidCredentialsError } from '../../../domain/errors/invalid-credentials-error';
import { UserNotActive } from '../../../domain/errors/user-not-active-error';

describe('LoginController', () => {
  let controller: LoginController;
  let loginUseCaseMock: jest.Mocked<LoginUseCase>;

  beforeEach(async () => {
    loginUseCaseMock = {
      execute: jest.fn(),
    } as unknown as jest.MockedObject<LoginUseCase>;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [LoginController],
      providers: [
        {
          provide: LoginUseCase,
          useValue: loginUseCaseMock,
        },
      ],
    }).compile();

    controller = module.get<LoginController>(LoginController);
  });

  it('should return token and user data on successful login', async () => {
    const loginDto: LoginHttpDto = {
      email: 'test@example.com',
      password: 'Password123!',
    };

    const mockUser = User.create({
      id: 'user-id-123',
      name: 'Test User',
      email: 'test@example.com',
      password: 'hashed_password',
      isActive: true,
      role: Role.create({ id: 2, name: 'User' }),
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const mockResponse = {
      token: 'mock-jwt-token',
      user: mockUser.toResponse(),
    };

    loginUseCaseMock.execute.mockResolvedValue(mockResponse);

    const result = await controller.login(loginDto);

    expect(result).toEqual(mockResponse);
    expect(loginUseCaseMock.execute).toHaveBeenCalledWith(loginDto);
  });

  it('should propagate InvalidCredentialsError from use case', async () => {
    const loginDto: LoginHttpDto = {
      email: 'test@example.com',
      password: 'WrongPassword',
    };

    loginUseCaseMock.execute.mockRejectedValue(new InvalidCredentialsError());

    await expect(controller.login(loginDto)).rejects.toThrow(
      InvalidCredentialsError,
    );
    expect(loginUseCaseMock.execute).toHaveBeenCalledWith(loginDto);
  });

  it('should propagate UserNotActive error from use case', async () => {
    const loginDto: LoginHttpDto = {
      email: 'inactive@example.com',
      password: 'Password123!',
    };

    loginUseCaseMock.execute.mockRejectedValue(new UserNotActive());

    await expect(controller.login(loginDto)).rejects.toThrow(UserNotActive);
    expect(loginUseCaseMock.execute).toHaveBeenCalledWith(loginDto);
  });
});
