import { UserDto } from './login.dto';

export interface IJwtPayload {
  user: UserDto;
  iat: number;
  exp: number;
}
