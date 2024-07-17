import { registerAs } from '@nestjs/config';
import { IsOptional, IsString } from 'class-validator';
import { validateConfig } from 'src/utils/common.util';

export type TAuthConfig = {
  jwtSecretKey: string;
  jwtAlgorithm: Algorithm;
  jwtShortExpiresIn: string;
  jwtLongExpiresIn: string;
};

class AuthConfigValidator {
  @IsString()
  JWT_SECRET_KEY: string;

  @IsOptional()
  JWT_ALGORITHM?: Algorithm;

  @IsString()
  @IsOptional()
  JWT_SHORT_EXPIRES_IN?: string;

  @IsString()
  @IsOptional()
  JWT_LONG_EXPIRES_IN: string;
}

export default registerAs<TAuthConfig>('auth', () => {
  validateConfig(process.env, AuthConfigValidator);

  return {
    jwtSecretKey: process.env.JWT_SECRET_KEY,
    jwtAlgorithm: 'HS256' as unknown as Algorithm,
    jwtShortExpiresIn: process.env.JWT_SHORT_EXPIRES_IN || '1d',
    jwtLongExpiresIn: process.env.JWT_LONG_EXPIRES_IN || '30d',
  };
});
