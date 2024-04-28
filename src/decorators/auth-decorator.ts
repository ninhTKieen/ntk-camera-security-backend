import { ExecutionContext, createParamDecorator } from '@nestjs/common';
import { Request } from 'express';
import { GetAllUserDto } from 'src/modules/users/dto/get-all-user.dto';

interface IRequestWithUser extends Request {
  user: GetAllUserDto;
}

export const AuthUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request: IRequestWithUser = ctx.switchToHttp().getRequest();

    return request.user;
  },
);
