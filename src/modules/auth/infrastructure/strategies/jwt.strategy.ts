import { Injectable } from '@nestjs/common';
import { UserRepository } from '../../../users/domain/repositories/user.repository';
import { PassportStrategy } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UnauthorizedError } from '../../domain/errors/unauthorized-error';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly userRepository: UserRepository,
    private configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET_KEY') as string,
    });
  }

  async validate(payload: { sub: string; email: string }) {
    const user = await this.userRepository.findByEmail(payload.email);

    if (!user) {
      throw new UnauthorizedError();
    }
    return user;
  }
}
