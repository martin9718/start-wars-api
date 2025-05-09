import { ApplicationError } from '../../../shared/domain/errors/application-error';
import { HttpStatus } from '@nestjs/common';

export class MovieNotFoundError extends ApplicationError {
  constructor(id: string) {
    super(
      `Movie with id ${id} not found`,
      'MOVIE_NOT_FOUND',
      `No movie exists with the provided id: ${id}`,
      HttpStatus.NOT_FOUND,
    );
  }
}
