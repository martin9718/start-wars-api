import { ApplicationError } from '../../../shared/domain/errors/application-error';
import { HttpStatus } from '@nestjs/common';

export class TokenExpiredError extends ApplicationError {
  constructor() {
    super(
      'Token has expired',
      'TOKEN_EXPIRED',
      'Token has expired',
      HttpStatus.UNAUTHORIZED,
    );
  }
}
