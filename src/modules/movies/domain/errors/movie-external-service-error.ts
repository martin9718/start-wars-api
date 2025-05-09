import { ApplicationError } from '../../../shared/domain/errors/application-error';

export class MovieExternalServiceError extends ApplicationError {
  constructor(message: string, details: string = '') {
    super(message, 'EXTERNAL_SERVICE_ERROR', details, 503);
  }
}
