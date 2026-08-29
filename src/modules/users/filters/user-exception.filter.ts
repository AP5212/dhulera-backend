import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class UserExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const response = host.switchToHttp().getResponse<Response>();
    const statusCode =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;
    const exceptionResponse =
      exception instanceof HttpException ? exception.getResponse() : undefined;
    const message =
      typeof exceptionResponse === 'string'
        ? exceptionResponse
        : exceptionResponse &&
            'message' in exceptionResponse &&
            (typeof exceptionResponse.message === 'string' ||
              Array.isArray(exceptionResponse.message))
          ? exceptionResponse.message
          : 'Internal server error.';
    response.status(statusCode).json({ status: false, message });
  }
}
