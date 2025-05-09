import { ApplicationError } from '../../../domain/errors/application-error';
import { HttpStatus } from '@nestjs/common';

export class DatabaseError extends ApplicationError {
  constructor(error: unknown) {
    let details: string;

    if (error instanceof Error) {
      details = error.message;
    } else if (typeof error === 'string') {
      details = error;
    } else if (error && typeof error === 'object') {
      try {
        details = JSON.stringify(error);
      } catch {
        details = 'Unknown database error (object could not be stringified)';
      }
    } else {
      details = 'Unknown database error';
    }

    super(
      'Database Operation Failed',
      'DATABASE_ERROR',
      details,
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
}
