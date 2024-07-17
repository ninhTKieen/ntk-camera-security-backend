import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { TConfigs } from 'src/configs';
import { TAuthConfig } from 'src/configs/auth.config';

import { UsersModule } from '../users/users.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

@Module({
  imports: [
    UsersModule,
    JwtModule.registerAsync({
      global: true,
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService<TConfigs>) => ({
        secret: configService.get<TAuthConfig>('auth').jwtSecretKey,
        signOptions: {
          algorithm: 'HS256',
          expiresIn: configService.get<TAuthConfig>('auth').jwtShortExpiresIn,
        },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [AuthService],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
