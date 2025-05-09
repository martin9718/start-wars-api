import { Injectable } from '@nestjs/common';
import { UserRepository } from '../../../domain/repositories/user.repository';
import { PasswordHasher } from '../../../../auth/domain/services/password-hasher';
import { CreateUserDto } from './create-user.dto';
import { UserAlreadyExistsError } from '../../../domain/errors/user-already-exists-error';
import { User, UserProperties } from '../../../domain/entities/user';
import { Role } from '../../../domain/entities/role';
import { RoleId, ROLES, validRoleIds } from '../../../domain/types';
import { InvalidRoleError } from '../../../domain/errors/invalid-role-error';

@Injectable()
export class CreateUserUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly passwordHasher: PasswordHasher,
  ) {}

  async execute(
    data: CreateUserDto,
  ): Promise<Omit<UserProperties, 'password'>> {
    const existingUser = await this.userRepository.findByEmail(data.email);

    if (existingUser) {
      throw new UserAlreadyExistsError(data.email);
    }

    if (!validRoleIds.includes(data.roleId as RoleId)) {
      throw new InvalidRoleError(data.roleId);
    }

    const roleName =
      data.roleId === ROLES.ADMIN.id ? ROLES.ADMIN.name : ROLES.USER.name;
    const password = await this.passwordHasher.hash(data.password);

    const newUser = User.create({
      name: data.name,
      email: data.email,
      password: password,
      isActive: true,
      role: Role.create({ id: data.roleId, name: roleName }),
    });

    const createdUser = await this.userRepository.create(newUser);

    return createdUser.toResponse();
  }
}
