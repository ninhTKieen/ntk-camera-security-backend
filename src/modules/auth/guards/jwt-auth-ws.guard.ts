import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Socket } from 'socket.io';
import { TConfigs } from 'src/configs';

@Injectable()
export class JwtAuthWsGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private readonly configService: ConfigService<TConfigs>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const client: Socket = context.switchToWs().getClient<Socket>();
    const token = this.extractTokenFromHeader(client);
    if (!token) {
      throw new UnauthorizedException();
    }
    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: this.configService.get('auth').jwtSecret,
      });
      client['user'] = payload;
    } catch {
      throw new UnauthorizedException();
    }
    return true;
  }

  private extractTokenFromHeader(request: Socket): string | undefined {
    const token = request.handshake.headers.access_token as string;
    return token;
  }
}
