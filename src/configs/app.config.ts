import { registerAs } from '@nestjs/config';
import { IsInt, IsOptional, IsString } from 'class-validator';
import { validateConfig } from 'src/utils/common.util';

export type TAppConfig = {
  port: number;
  apiPrefix: string;
  bcryptSalt: number;
  cloudinaryCloudName: string;
  cloudinaryApiKey: string;
  cloudinaryApiSecret: string;
};

class AppConfigValidator {
  @IsInt()
  @IsOptional()
  PORT?: number;

  @IsString()
  API_PREFIX: string;

  @IsInt()
  @IsOptional()
  BCRYPT_SALT: number;

  @IsString()
  CLOUDINARY_CLOUD_NAME: string;

  @IsString()
  CLOUDINARY_API_KEY: string;

  @IsString()
  CLOUDINARY_API_SECRET: string;
}

export default registerAs<TAppConfig>('app', () => {
  validateConfig(process.env, AppConfigValidator);

  return {
    port: parseInt(process.env.PORT, 10),
    apiPrefix: process.env.API_PREFIX,
    bcryptSalt: parseInt(process.env.BCRYPT_SALT, 10) || 10,
    cloudinaryCloudName: process.env.CLOUDINARY_CLOUD_NAME,
    cloudinaryApiKey: process.env.CLOUDINARY_API_KEY,
    cloudinaryApiSecret: process.env.CLOUDINARY_API_SECRET,
  };
});
