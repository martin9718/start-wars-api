import { HttpStatus } from '@nestjs/common';
import { ApplicationError } from '../../../shared/domain/errors/application-error';

export class InvalidRoleError extends ApplicationError {
  constructor(roleId: number) {
    super(
      'Invalid Role',
      'INVALID_ROLE',
      `The role id: ${roleId} is not valid`,
      HttpStatus.BAD_REQUEST,
    );
  }
}
