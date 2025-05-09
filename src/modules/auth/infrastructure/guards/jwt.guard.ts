import { AuthGuard } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { TokenNotProvidedError } from '../../domain/errors/token-not-provided-error';
import { TokenExpiredError } from '../../domain/errors/token-expired-error';
import { InvalidTokenError } from '../../domain/errors/invalid-token-error';
import { User } from '../../../users/domain/entities/user';

interface JwtError {
  name: string;
  message: string;
  stack?: string;
}

interface JwtInfo {
  message: string;
  name?: string;
  expiredAt?: Date;
}

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  handleRequest<TUser extends User = User>(
    err: Error | null,
    user: TUser | false,
    info: JwtError | JwtInfo | undefined,
  ): TUser {
    if (info) {
      const infoMessage =
        typeof info === 'object' ? info.message : String(info);

      if (infoMessage === 'No auth token') {
        throw new TokenNotProvidedError();
      } else if (infoMessage === 'jwt expired') {
        throw new TokenExpiredError();
      }
      throw new InvalidTokenError();
    }

    if (err || !user) {
      throw new InvalidTokenError();
    }

    return user;
  }
}
