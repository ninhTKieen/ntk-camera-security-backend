import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IDatabaseConfig } from 'src/configs/database.config';
import { User } from 'src/entities/user.entity';
import { DataSource } from 'typeorm';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService<IDatabaseConfig>) => ({
        type: 'postgres',
        host: configService.get('dbHost'),
        port: configService.get('dbPort'),
        username: configService.get('dbUsername'),
        password: configService.get('dbPassword'),
        database: configService.get('dbName'),
        ssl: configService.get('dbSSl'),
        entities: [User],
      }),
      dataSourceFactory: async (options) => {
        return await new DataSource(options).initialize();
      },
      inject: [ConfigService],
    }),
  ],
})
export class DatabaseModule {}
