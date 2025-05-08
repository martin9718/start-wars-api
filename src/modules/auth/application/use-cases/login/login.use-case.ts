import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './login.dto';
import { UserProperties } from '../../../../users/domain/entities/user';
import { UserRepository } from '../../../../users/domain/repositories/user.repository';
import { PasswordHasher } from '../../../domain/services/password-hasher';
import { InvalidCredentialsError } from '../../../domain/errors/invalid-credentials-error';
import { UserNotActive } from '../../../domain/errors/user-not-active-error';

@Injectable()
export class LoginUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly jwtService: JwtService,
    private readonly passwordHasher: PasswordHasher,
  ) {}

  async execute(
    dto: LoginDto,
  ): Promise<{ token: string; user: Omit<UserProperties, 'password'> }> {
    const user = await this.userRepository.findByEmail(dto.email);

    if (!user) {
      throw new InvalidCredentialsError();
    }

    if (!user.isActive) {
      throw new UserNotActive();
    }

    const isValidPassword = await this.passwordHasher.compare(
      dto.password,
      user.password,
    );

    if (!isValidPassword) {
      throw new InvalidCredentialsError();
    }

    const payload: { sub: string; email: string } = {
      sub: user.id as string,
      email: user.email,
    };

    const token = this.jwtService.sign(payload);

    return {
      token,
      user: user.toResponse(),
    };
  }
}
