import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TConfigs } from 'src/configs';
import { TDatabaseConfig } from 'src/configs/database.config';
import { EstateMember } from 'src/entities/estate-member.entity';
import { Estate } from 'src/entities/estate.entity';
import { FcmToken } from 'src/entities/fcm-token.entity';
import { User } from 'src/entities/user.entity';
import { DataSource } from 'typeorm';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService<TConfigs>) => ({
        type: 'postgres',
        host: configService.getOrThrow<TDatabaseConfig>('database').dbHost,
        port: configService.getOrThrow<TDatabaseConfig>('database').dbPort,
        username:
          configService.getOrThrow<TDatabaseConfig>('database').dbUsername,
        password:
          configService.getOrThrow<TDatabaseConfig>('database').dbPassword,
        database: configService.getOrThrow<TDatabaseConfig>('database').dbName,
        ssl: configService.getOrThrow<TDatabaseConfig>('database').dbSSl,
        entities: [User, FcmToken, Estate, EstateMember],
      }),
      dataSourceFactory: async (options) => {
        return await new DataSource(options).initialize();
      },
      inject: [ConfigService],
    }),
  ],
})
export class DatabaseModule {}
