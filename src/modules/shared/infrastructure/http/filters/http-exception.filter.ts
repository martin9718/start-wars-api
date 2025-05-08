import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { Response } from 'express';
import { ApplicationError } from '../../../domain/errors/application-error';
import { DatabaseError } from '../../database/errors/database-error';

interface ExceptionResponse {
  statusCode?: number;
  error?: string;
  message?: string | string[];
}

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let statusCode: HttpStatus;
    let responseBody: Record<string, unknown>;

    if (
      exception instanceof ApplicationError &&
      !(exception instanceof DatabaseError)
    ) {
      statusCode = exception.status;
      responseBody = {
        errorCodeName: exception.codeName,
        message: exception.message,
        details: exception.details,
        status: exception.status,
      };
    } else if (exception instanceof BadRequestException) {
      const exceptionResponse = exception.getResponse() as ExceptionResponse;
      const validationErrors = Array.isArray(exceptionResponse.message)
        ? exceptionResponse.message
        : [exceptionResponse.message || 'Validation error'];

      statusCode = HttpStatus.BAD_REQUEST;
      responseBody = {
        errorCodeName: 'VALIDATION_ERROR',
        message: 'Validation failed',
        details: validationErrors,
        status: statusCode,
      };
    } else if (exception instanceof HttpException) {
      statusCode = exception.getStatus();
      const exceptionResponse = exception.getResponse() as ExceptionResponse;

      if (typeof exceptionResponse === 'object') {
        const message = exceptionResponse.message || 'Error';
        responseBody = {
          errorCodeName: exceptionResponse.error || 'ERROR',
          message: Array.isArray(message) ? message.join(', ') : message,
          details: '',
          status: statusCode,
        };
      } else {
        responseBody = {
          errorCodeName: 'ERROR',
          message: String(exceptionResponse),
          details: '',
          status: statusCode,
        };
      }
    } else {
      console.error('Unhandled exception:', exception);
      statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
      responseBody = {
        errorCodeName: 'INTERNAL_SERVER_ERROR',
        message: 'An unexpected error occurred',
        details:
          exception instanceof Error ? exception.message : 'Unknown error',
        status: HttpStatus.INTERNAL_SERVER_ERROR,
      };
    }

    response.status(statusCode).json(responseBody);
  }
}
