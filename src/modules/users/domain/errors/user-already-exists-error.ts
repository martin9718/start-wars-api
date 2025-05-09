import { ApplicationError } from '../../../shared/domain/errors/application-error';
import { HttpStatus } from '@nestjs/common';

export class UserAlreadyExistsError extends ApplicationError {
  constructor(email: string) {
    super(
      'User Already Exists',
      'USER_ALREADY_EXISTS',
      `A user with email ${email} already exists in the system`,
      HttpStatus.CONFLICT,
    );
  }
}
