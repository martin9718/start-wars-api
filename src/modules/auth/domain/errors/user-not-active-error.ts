import { ApplicationError } from '../../../shared/domain/errors/application-error';
import { HttpStatus } from '@nestjs/common';

export class UserNotActive extends ApplicationError {
  constructor() {
    super(
      'User not active',
      'USER_NOT_ACTIVE',
      'User not active',
      HttpStatus.CONFLICT,
    );
  }
}
