import { Logger, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { ServeStaticModule } from '@nestjs/serve-static';
import appConfig from 'src/configs/app.config';
import authConfig from 'src/configs/auth.config';
import databaseConfig from 'src/configs/database.config';
import firebaseConfig from 'src/configs/firebase.config';
import { DatabaseModule } from 'src/database/database.module';
import { GlobalExceptionFilter } from 'src/filters/global-exception.filter';
import { ResponseInterceptor } from 'src/interceptors/response.interceptor';
import { DevicesModule } from 'src/modules/devices/devices.module';

import { AuthModule } from '../auth/auth.module';
import { DeviceGateway } from '../devices/device.gateway';
import { EstateModule } from '../estates/estate.module';
import { FirebaseModule } from '../firebase/firebase.module';
import { ImageModule } from '../image/image.module';
import { RelayGateway } from '../relays/relay.gateway';
import { RelayModule } from '../relays/relay.module';
import { UsersModule } from '../users/users.module';
import { AppController } from './app.controller';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: `${process.cwd()}/uploads`,
      serveRoot: '/uploads',
    }),
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
    EstateModule,
    DevicesModule,
    RelayModule,
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
    DeviceGateway,
    RelayGateway,
  ],
})
export class AppModule {}
