import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { QueryFailedError } from 'typeorm';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(
    exception: HttpException | QueryFailedError | Error,
    host: ArgumentsHost,
  ) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let responseBody: any = {
      data: false,
      code: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Internal server error',
    };

    if (exception instanceof HttpException) {
      responseBody = {
        data: false,
        code: exception.getStatus(),
        message: exception.message,
      };
    } else if (exception instanceof QueryFailedError) {
      responseBody = {
        data: false,
        code: HttpStatus.BAD_REQUEST,
        message: exception.message,
      };
    } else {
      responseBody = {
        data: false,
        code: HttpStatus.INTERNAL_SERVER_ERROR,
        message: exception.message,
      };
    }

    response.status(responseBody.code).json(responseBody);
  }
}
