import { ApplicationError } from '../../../shared/domain/errors/application-error';
import { HttpStatus } from '@nestjs/common';

export class InvalidCredentialsError extends ApplicationError {
  constructor() {
    super(
      'Invalid email or password',
      'INVALID_CREDENTIALS',
      'The provided credentials are incorrect',
      HttpStatus.UNAUTHORIZED,
    );
  }
}
