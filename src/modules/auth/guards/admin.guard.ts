import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { ErrorMessages } from 'src/configs/constant.config';

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly jwtService: JwtService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const token = request.headers['authorization']?.split(' ')[1];

    if (!token) {
      throw new HttpException(
        {
          statusCode: HttpStatus.UNAUTHORIZED,
          message: ErrorMessages.INVALID_CREDENTIALS,
        },
        HttpStatus.UNAUTHORIZED,
      );
    }

    const payload = await this.jwtService.verifyAsync(token, {
      secret: process.env.JWT_SECRET_KEY,
    });
    const user = payload.user;
    if (user.role !== 'ADMIN') {
      throw new HttpException(
        {
          statusCode: HttpStatus.FORBIDDEN,
          message: ErrorMessages.NOT_ALLOWED,
        },
        HttpStatus.FORBIDDEN,
      );
    }

    return true;
  }
}
