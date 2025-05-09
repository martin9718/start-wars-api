import {
  ExceptionFilter,
  Catch,
  NotFoundException,
  ArgumentsHost,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch(NotFoundException)
export class NotFoundExceptionFilter implements ExceptionFilter {
  catch(exception: NotFoundException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    response.status(404).json({
      errorCodeName: 'ROUTE_NOT_FOUND',
      message: `Route '${request.method} ${request.url}' not found`,
      details: 'Please check the API documentation for valid endpoints',
      status: 404,
      path: request.url,
      timestamp: new Date().toISOString(),
    });
  }
}
