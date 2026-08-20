import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class StaticContentExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const response = host.switchToHttp().getResponse<Response>();
    const statusCode = exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
    const exceptionResponse = exception instanceof HttpException ? exception.getResponse() : undefined;
    const message = this.getMessage(exceptionResponse);

    response.status(statusCode).json({
      status: false,
      message,
    });
  }

  private getMessage(exceptionResponse: string | object | undefined): string | string[] {
    if (typeof exceptionResponse === 'string') {
      return exceptionResponse;
    }
    if (exceptionResponse && 'message' in exceptionResponse) {
      const message = exceptionResponse.message;
      if (typeof message === 'string' || Array.isArray(message)) {
        return message;
      }
    }
    return 'Internal server error.';
  }
}
