import { ApplicationError } from '../../../shared/domain/errors/application-error';
import { HttpStatus } from '@nestjs/common';

export class ForbiddenError extends ApplicationError {
  constructor(message: string = 'Access denied') {
    super(message, 'FORBIDDEN', message, HttpStatus.FORBIDDEN);
  }
}
