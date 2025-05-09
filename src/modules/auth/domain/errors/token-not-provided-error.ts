import { ApplicationError } from '../../../shared/domain/errors/application-error';
import { HttpStatus } from '@nestjs/common';

export class TokenNotProvidedError extends ApplicationError {
  constructor() {
    super(
      'Token not provided',
      'TOKEN_NOT_PROVIDED',
      'Token has not been provided',
      HttpStatus.UNAUTHORIZED,
    );
  }
}
