import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FcmToken } from 'src/entities/fcm-token.entity';

import { AdminFirebaseController } from './admin-firebase.controller';
import { FirebaseController } from './firebase.controller';
import { FirebaseProvider } from './firebase.provider';
import { FirebaseService } from './firebase.service';

@Module({
  imports: [TypeOrmModule.forFeature([FcmToken])],
  controllers: [FirebaseController, AdminFirebaseController],
  providers: [FirebaseService, FirebaseProvider],
  exports: [FirebaseService, FirebaseProvider],
})
export class FirebaseModule {}
