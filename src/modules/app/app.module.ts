import { Logger, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import appConfig from 'src/configs/app.config';
import authConfig from 'src/configs/auth.config';
import databaseConfig from 'src/configs/database.config';
import firebaseConfig from 'src/configs/firebase.config';
import { DatabaseModule } from 'src/database/database.module';
import { GlobalExceptionFilter } from 'src/filters/global-exception.filter';
import { ResponseInterceptor } from 'src/interceptors/response.interceptor';

import { AuthModule } from '../auth/auth.module';
import { FirebaseModule } from '../firebase/firebase.module';
import { ImageModule } from '../image/image.module';
import { UsersModule } from '../users/users.module';
import { AppController } from './app.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, authConfig, databaseConfig, firebaseConfig],
      envFilePath: ['.env.development', '.env.local'],
    }),
    DatabaseModule,
    AuthModule,
    UsersModule,
    ImageModule,
    FirebaseModule,
  ],
  controllers: [AppController],
  providers: [
    Logger,
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseInterceptor,
    },
  ],
})
export class AppModule {}
