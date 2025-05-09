import { Test, TestingModule } from '@nestjs/testing';
import { CreateUserController } from './create-user.controller';
import { CreateUserUseCase } from '../../../application/use-cases/create-user/create-user.use-case';
import { CreateUserHttpDto } from './create-user.http-dto';
import { User } from '../../../domain/entities/user';
import { Role } from '../../../domain/entities/role';
import { UserAlreadyExistsError } from '../../../domain/errors/user-already-exists-error';
import { InvalidRoleError } from '../../../domain/errors/invalid-role-error';

describe('CreateUserController (Unit)', () => {
  let controller: CreateUserController;
  let createUserUseCase: jest.Mocked<CreateUserUseCase>;

  beforeEach(async () => {
    const mockCreateUserUseCase = {
      execute: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [CreateUserController],
      providers: [
        {
          provide: CreateUserUseCase,
          useValue: mockCreateUserUseCase,
        },
      ],
    }).compile();

    controller = module.get<CreateUserController>(CreateUserController);
    createUserUseCase = jest.mocked(module.get(CreateUserUseCase));
  });

  it('should create a user successfully', async () => {
    const createUserDto: CreateUserHttpDto = {
      name: 'John Doe',
      email: 'john@example.com',
      password: 'Password123!',
      passwordConfirmation: 'Password123!',
      roleId: 2,
    };

    const createdUser = User.create({
      id: 'generated-uuid',
      name: createUserDto.name,
      email: createUserDto.email,
      password: 'hashed-password',
      isActive: true,
      role: Role.create({ id: 2, name: 'User' }),
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const expectedResponse = createdUser.toResponse();

    createUserUseCase.execute.mockResolvedValue(expectedResponse);

    const result = await controller.createUser(createUserDto);

    expect(createUserUseCase.execute).toHaveBeenCalledWith(createUserDto);
    expect(result).toEqual(expectedResponse);
    expect(result).not.toHaveProperty('password');
    expect(result.id).toBe('generated-uuid');
    expect(result.name).toBe(createUserDto.name);
    expect(result.email).toBe(createUserDto.email);
    expect(result.role.id).toBe(createUserDto.roleId);
  });

  it('should propagate UserAlreadyExistsError from use case', async () => {
    const createUserDto: CreateUserHttpDto = {
      name: 'John Doe',
      email: 'existing@example.com',
      password: 'Password123!',
      passwordConfirmation: 'Password123!',
      roleId: 2,
    };

    const error = new UserAlreadyExistsError(createUserDto.email);
    createUserUseCase.execute.mockRejectedValue(error);

    await expect(controller.createUser(createUserDto)).rejects.toThrow(
      UserAlreadyExistsError,
    );

    expect(createUserUseCase.execute).toHaveBeenCalledWith(createUserDto);
  });

  it('should propagate InvalidRoleError from use case', async () => {
    const createUserDto: CreateUserHttpDto = {
      name: 'John Doe',
      email: 'john@example.com',
      password: 'Password123!',
      passwordConfirmation: 'Password123!',
      roleId: 999,
    };

    const error = new InvalidRoleError(createUserDto.roleId);
    createUserUseCase.execute.mockRejectedValue(error);

    await expect(controller.createUser(createUserDto)).rejects.toThrow(
      InvalidRoleError,
    );

    expect(createUserUseCase.execute).toHaveBeenCalledWith(createUserDto);
  });
});
