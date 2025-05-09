import { ApplicationError } from '../../../shared/domain/errors/application-error';
import { HttpStatus } from '@nestjs/common';

export class UnauthorizedError extends ApplicationError {
  constructor() {
    super(
      'User does not have access to do this action',
      'UNAUTHORIZED_ERROR',
      'User does not have access to do this action',
      HttpStatus.UNAUTHORIZED,
    );
  }
}
