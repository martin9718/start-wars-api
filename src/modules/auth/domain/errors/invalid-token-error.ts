import { ApplicationError } from '../../../shared/domain/errors/application-error';
import { HttpStatus } from '@nestjs/common';

export class InvalidTokenError extends ApplicationError {
  constructor() {
    super(
      'Token is not valid',
      'INVALID_TOKEN',
      'Provided authentication token is invalid',
      HttpStatus.UNAUTHORIZED,
    );
  }
}
