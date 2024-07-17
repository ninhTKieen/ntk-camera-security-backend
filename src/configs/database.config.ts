import { registerAs } from '@nestjs/config';
import { IsInt, IsOptional, IsString } from 'class-validator';
import { validateConfig } from 'src/utils/common.util';

export type TDatabaseConfig = {
  dbType: string;
  dbHost: string;
  dbPort: number;
  dbUsername: string;
  dbPassword: string;
  dbName: string;
  dbSSl?: boolean;
};

class DatabaseValidator {
  @IsString()
  @IsOptional()
  DB_TYPE?: string;

  @IsString()
  @IsOptional()
  DB_HOST?: string;

  @IsInt()
  DB_PORT: number;

  @IsString()
  DB_USERNAME: string;

  @IsString()
  DB_PASSWORD: string;

  @IsString()
  DB_NAME: string;

  @IsString()
  @IsOptional()
  DB_SSL?: string;
}

export default registerAs<TDatabaseConfig>('database', () => {
  validateConfig(process.env, DatabaseValidator);

  return {
    dbType: 'postgres',
    dbHost: process.env.DB_HOST || 'localhost',
    dbPort: parseInt(process.env.DB_PORT, 10),
    dbUsername: process.env.DB_USERNAME,
    dbPassword: process.env.DB_PASSWORD,
    dbName: process.env.DB_NAME,
    dbSSl: process.env.DB_SSL === 'true',
  };
});
